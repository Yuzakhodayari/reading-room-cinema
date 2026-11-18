# Background Object Swap & Presenter Depth-Matte Guide (GTX 1650 4 GB VRAM)

Replacing a background appliance with a walnut bookshelf can ruin A-roll when a generative video model alters the speaker's face. Local video-inpainting weights also run out of memory at 1080p on a 4 GB GTX 1650.

Pick the workflow below that matches how the shot was filmed and how the edit layers graphics around the presenter.

---

## Workflow A: Locked-Off Tripod Shot + Automatic Person Mask (Main A-Roll)

A tripod shot needs AI on only one still frame. Editing a single clean plate with `gemini-nano-banana-2.1` and running CPU person segmentation across the full recording keeps skin texture, hair, and lip sync completely untouched across a 20-minute episode.

### 1. Extract the sharpest frame

```powershell
tools\.venv\Scripts\python.exe tools\room_object_swap.py extract-plate raw_aroll.mp4 --out plate_raw.png
```

`extract-plate` samples evenly spaced frames with a Laplacian sharpness metric. Clipped highlights and crushed shadows get penalized before the sharpest frame is saved as a full-resolution lossless PNG.

### 2. Swap the background prop in the clean plate (`gemini-nano-banana-2.1`)

Set `GEMINI_API_KEY` from Google AI Studio and run `gemini-plate-edit`:

```powershell
$env:GEMINI_API_KEY="your-key-here"
tools\.venv\Scripts\python.exe tools\room_object_swap.py gemini-plate-edit plate_raw.png --prompt "Replace the fridge on the right with a warm walnut wooden bookshelf filled with hardcover books. Keep the lighting and room identical." --out room_swapped.png
```

- Supports `--model gemini-nano-banana-2.1` (default), `--model gemini-3-pro-image`, or `--model gemini-3.1-flash-lite-image`.
- Matches the input plate aspect ratio automatically and resamples the edited result back to the exact pixel dimensions of `plate_raw.png`.
- Pass `--dry-run` first to inspect the request JSON without calling the API.

### 3. Generate the person matte and composite in one pass

```powershell
tools\.venv\Scripts\python.exe tools\room_object_swap.py auto-person-mask raw_aroll.mp4 --composite-plate room_swapped.png --swap-box 0.55,0.0,0.45,1.0 --out aroll_bookshelf.mp4
```

How `auto-person-mask` processes the clip:
- Runs MediaPipe Selfie Segmentation (`tools/models/selfie_segmenter.tflite`, ~244 KB, git-ignored and CPU-fast) on every frame with exponential moving-average smoothing (`--temporal-smooth 0.65`) and Gaussian edge feathering (`--feather 5.0`) to write `<stem>_person_mask.mp4`.
- Optional `--swap-box x,y,w,h` restricts the swapped area (for example `0.55,0.0,0.45,1.0` for the right side of the room). Pixels outside that box come straight from `raw_aroll.mp4`, while hands or shoulders crossing into the box still sit cleanly in front of the new bookshelf.
- Adding `--composite-plate room_swapped.png` composites the real foreground over `room_swapped.png` in FFmpeg and copies original audio without re-encoding.
- Omit `--composite-plate` if you want to bring `<stem>_person_mask.mp4` and `room_swapped.png` into DaVinci Resolve manually as a luma track matte.

#### Static Mask Alternative (Zero foreground overlap)

When the presenter never crosses in front of the swapped prop, paint a grayscale `mask.png` (white over the prop, black everywhere else) and run:

```powershell
tools\.venv\Scripts\python.exe tools\room_object_swap.py composite-plate raw_aroll.mp4 --plate room_swapped.png --mask mask.png --feather 8 --out aroll_bookshelf.mp4
```

---

## Workflow B: Handheld or Moving Camera (3 to 15 s Clips via Gemini Omni 1.2 Flash)

Camera movement causes a static plate to slide against the wall. For short 3 to 15 s walk-ins or handheld B-roll, run `omni-edit` with `gemini-omni-1.2-flash`.

### 1. Preview the clip-prep and API commands (dry run)

```powershell
tools\.venv\Scripts\python.exe tools\room_object_swap.py omni-edit moving_clip.mp4 --ref-image room_swapped.png --start 0 --duration 10 --resolution 1080p
```

This writes a `.omni-job.json` manifest and prints two commands: an `ffmpeg` trim/scale step capping the clip between 3 and 15 seconds, and the `generate_video.py` call pairing `room_swapped.png` (`--image`) with the source video (`--video`).

### 2. Run the video edit

```powershell
$env:GEMINI_API_KEY="your-key-here"
tools\.venv\Scripts\python.exe tools\room_object_swap.py omni-edit moving_clip.mp4 --ref-image room_swapped.png --start 0 --duration 10 --resolution 1080p --run
```

### Operational limits for Gemini Omni 1.2 Flash
- **Duration cap**: Source clips must stay between 3 and 15 seconds (`10s` default). Split longer moving shots before editing.
- **Audio retention**: Leave `--strip-audio` off so the original spoken audio stays intact.
- **Regional gating**: Video upload editing is blocked in the EEA, Switzerland, the United Kingdom, and select US states.
- **Speaker fidelity**: Use Workflow A whenever the camera is locked on a tripod. Reserve Workflow B for shots where perspective shifts.

---

## Workflow C: Alpha Presenter Matte for Pillar #10 Depth Sandwich (`export-person-matte`)

Depth-Sandwich beats place giant figures, debt walls, or cartographic corridors behind the presenter's shoulders while keeping foreground smoked-navy glass cards in front. `export-person-matte` writes a temporally smoothed RGBA presenter video ready for Remotion and DaVinci Resolve Free.

### 1. Export WebM VP9 alpha for Remotion `<PresenterDepthStage>`

```powershell
tools\.venv\Scripts\python.exe tools\room_object_swap.py export-person-matte aroll_prepped.mp4 --codec webm --out studio\public\aroll_person_alpha.webm
```

This encodes `yuva420p` VP9 with `-auto-alt-ref 0` so Chromium decodes the alpha channel cleanly inside `<PresenterDepthStage presenterAlphaSrc="aroll_person_alpha.webm">`.

### 2. Export Apple ProRes 4444 `.mov` for DaVinci Resolve Free (`export-fcpxml.mjs`)

```powershell
tools\.venv\Scripts\python.exe tools\room_object_swap.py export-person-matte projects\ep01\aroll_prepped.mp4 --codec prores --out projects\ep01\aroll_person_alpha.mov
node studio\scripts\export-fcpxml.mjs projects\ep01\director-plan.json --aroll projects\ep01\aroll_prepped.mp4 --person-alpha projects\ep01\aroll_person_alpha.mov --out projects\ep01\timeline.fcpxml
```

Key details:
- ProRes 4444 writes 10-bit `yuva444p10le` alpha with soft edge halo attenuation (`--despill 0.15`) and muted audio (`-an`) by default so Track V3 never doubles Track A1 dialogue. Pass `--keep-audio` only when standalone playback needs sound.
- When `export-fcpxml.mjs` detects `aroll_person_alpha.mov` (or `--person-alpha`), Depth-Sandwich beats automatically populate four synchronized video lanes: V1 background A-roll, V2 behind-presenter graphics, V3 foreground alpha presenter (with matching camera zoom/position keyframes), and V4 foreground liquid glass.
- Pass `--dry-run` to inspect the exact FFmpeg `bgra` pipe command before running segmentation across a long recording.

---

## Workflow D: Script-Driven Chapter Prop Planning (`suggest-props`)

Before shooting or editing chapter plates, `suggest-props` scans act breaks in a markdown or text script and recommends *Reading Room* shelf props, subtle desk accents, `.cube` LUT pairings, and ready-to-paste `gemini-plate-edit` prompts.

```powershell
python tools\room_object_swap.py suggest-props --script scripts\video_01_the_allowance.md --acts 6 --out out\ep01_props.json
```

- Splits by markdown headings (`#` to `###`) when present, or divides paragraphs into balanced act windows timed at `--wpm 150`.
- Matches each chapter's vocabulary against fiscal ledgers, household mortgages, statutory court rulings, compute scrip history, power-grid hardware, or epilogue synthesis.
- Pass `--json` when piping chapter recommendations into another script.
