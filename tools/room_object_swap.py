#!/usr/bin/env python3
"""
Room Object Swap toolkit for low-VRAM setups (e.g., GTX 1650 4GB).

Subcommands:
  1. extract-plate     : Extracts the sharpest frame from A-roll as a lossless PNG clean plate.
  2. gemini-plate-edit : Edits an extracted clean plate PNG via Gemini Nano Banana 2.1 (or Gemini 3 Pro Image).
  3. auto-person-mask  : Generates a temporally smoothed, feathered person matte MP4 across full-length
                         tripod A-roll using MediaPipe Selfie Segmentation (or diff fallback), and
                         optionally composites foreground over an edited plate in one pass (--composite-plate).
  4. composite-plate   : Composites an edited background plate onto a locked-off shot via a static mask PNG.
  5. omni-edit         : Builds (and runs with --run) the Gemini Omni 1.2 Flash video-edit workflow
                         for short 3-15s moving-camera clips (alias: omni-command).
"""

from __future__ import annotations

import argparse
import base64
import io
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path
from typing import Any

try:
    import numpy as np
except ImportError:
    np = None  # type: ignore[assignment]
try:
    from scipy.ndimage import laplace
except ImportError:
    laplace = None  # type: ignore[assignment]


def require_numpy() -> None:
    if np is None:
        raise RuntimeError(
            "numpy is required for frame/matte pixel processing. "
            "Run with tools/.venv/Scripts/python.exe or install numpy & opencv-python."
        )

TOOLS_DIR = Path(__file__).resolve().parent
DEFAULT_SEGMENTER_MODEL = TOOLS_DIR / "models" / "selfie_segmenter.tflite"
SELFIE_SEGMENTER_URL = (
    "https://storage.googleapis.com/mediapipe-models/image_segmenter/"
    "selfie_segmenter/float16/latest/selfie_segmenter.tflite"
)

SKILL_GENERATE_VIDEO = Path(
    r"C:\Users\youza\.gemini\config\plugins\gemini-api\skills\gemini-omni-flash-api\scripts\video\generate_video.py"
)

DEFAULT_PLATE_PROMPT = (
    "Replace the fridge on the right with a warm walnut wooden bookshelf filled with "
    "hardcover books. Keep the lighting, shadows, wall color, and rest of the room identical."
)

DEFAULT_OMNI_PROMPT = (
    "Replace the refrigerator in the background with a warm walnut wooden bookshelf "
    "neatly filled with hardcover books. Keep the speaker, face, hands, desk, lighting, "
    "and camera movement identical. Keep everything else the same."
)

SUPPORTED_IMAGE_ASPECT_RATIOS: list[tuple[str, float]] = [
    ("1:1", 1.0),
    ("4:3", 4.0 / 3.0),
    ("3:4", 3.0 / 4.0),
    ("16:9", 16.0 / 9.0),
    ("9:16", 9.0 / 16.0),
    ("3:2", 3.0 / 2.0),
    ("2:3", 2.0 / 3.0),
    ("5:4", 5.0 / 4.0),
    ("4:5", 4.0 / 5.0),
    ("21:9", 21.0 / 9.0),
]


def find_media_bin(name: str) -> str:
    """Locate ffmpeg or ffprobe on PATH or inside WinGet package folders."""
    on_path = shutil.which(name)
    if on_path:
        return on_path

    local_app_data = os.environ.get("LOCALAPPDATA")
    if local_app_data:
        winget_root = Path(local_app_data) / "Microsoft" / "WinGet" / "Packages"
        if winget_root.exists():
            exe_name = f"{name}.exe" if os.name == "nt" else name
            for exe in winget_root.rglob(exe_name):
                return str(exe)

    raise FileNotFoundError(
        f"Could not find '{name}'. Install via WinGet (Gyan.FFmpeg) or add it to PATH."
    )


def probe_video(ffprobe_bin: str, video_path: Path) -> dict[str, Any]:
    """Read video stream resolution, FPS, and total duration using ffprobe."""
    cmd = [
        ffprobe_bin,
        "-v",
        "error",
        "-show_format",
        "-show_streams",
        "-of",
        "json",
        str(video_path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(proc.stdout)
    v_stream = next(
        (s for s in data.get("streams", []) if s.get("codec_type") == "video"), None
    )
    if not v_stream:
        raise ValueError(f"No video stream found in {video_path}")

    a_stream = next(
        (s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None
    )
    duration = float(
        data.get("format", {}).get("duration") or v_stream.get("duration") or 0.0
    )
    r_fps = v_stream.get("r_frame_rate", "30/1")
    num, _, den = r_fps.partition("/")
    fps = float(num) / float(den) if den and float(den) != 0 else 30.0
    nb_frames_raw = v_stream.get("nb_frames")
    nb_frames = int(nb_frames_raw) if nb_frames_raw and str(nb_frames_raw).isdigit() else 0

    return {
        "width": int(v_stream["width"]),
        "height": int(v_stream["height"]),
        "fps": fps,
        "durationSec": duration,
        "nbFrames": nb_frames,
        "hasAudio": a_stream is not None,
    }


def score_frame_sharpness(gray: np.ndarray) -> float:
    """Compute Laplacian variance with mild highlight/shadow clipping penalty."""
    require_numpy()
    assert laplace is not None
    """Compute Laplacian variance with mild highlight/shadow clipping penalty."""
    f = gray.astype(np.float32) / 255.0
    lap_var = float(np.var(laplace(f)))
    clipped = float(np.mean((f < 0.02) | (f > 0.98)))
    return lap_var * (1.0 - 0.5 * clipped)


def require_gemini_api_key() -> str:
    """Return GEMINI_API_KEY or raise a clear setup message."""
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise RuntimeError(
            "GEMINI_API_KEY environment variable is not set.\n"
            "Set your Google AI Studio key before running Gemini edits:\n"
            '  PowerShell: $env:GEMINI_API_KEY="your-key-here"\n'
            '  bash:       export GEMINI_API_KEY="your-key-here"'
        )
    return key


def pick_closest_aspect_ratio(width: int, height: int) -> str:
    """Map pixel dimensions to the nearest supported Gemini image aspect ratio."""
    ratio = width / max(1, height)
    best_name, _ = min(
        SUPPORTED_IMAGE_ASPECT_RATIOS, key=lambda item: abs(item[1] - ratio)
    )
    return best_name


def detect_image_mime(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix in {".jpg", ".jpeg"}:
        return "image/jpeg"
    if suffix == ".webp":
        return "image/webp"
    return "image/png"


def cmd_extract_plate(args: argparse.Namespace) -> None:
    video_path = Path(args.input_video).resolve()
    if not video_path.exists():
        raise FileNotFoundError(f"Input video not found: {video_path}")

    ffmpeg_bin = find_media_bin("ffmpeg")
    ffprobe_bin = find_media_bin("ffprobe")
    meta = probe_video(ffprobe_bin, video_path)

    total_dur = meta["durationSec"]
    start_sec = max(0.0, float(args.start))
    if start_sec >= total_dur > 0:
        raise ValueError(f"--start ({start_sec}s) exceeds video duration ({total_dur:.2f}s).")

    span_sec = (
        min(float(args.duration), total_dur - start_sec)
        if args.duration is not None
        else max(0.1, total_dur - start_sec)
    )
    samples = max(1, int(args.samples))
    sample_fps = samples / max(span_sec, 0.1)

    scale_w = min(640, meta["width"])
    scale_h = int(round((meta["height"] * scale_w / meta["width"]) / 2.0) * 2)
    scale_h = max(2, scale_h)

    raw_cmd = [
        ffmpeg_bin,
        "-v",
        "error",
        "-ss",
        f"{start_sec:.3f}",
        "-t",
        f"{span_sec:.3f}",
        "-i",
        str(video_path),
        "-vf",
        f"fps={sample_fps:.6f},scale={scale_w}:{scale_h}:flags=bilinear,format=gray",
        "-frames:v",
        str(samples),
        "-f",
        "rawvideo",
        "-pix_fmt",
        "gray",
        "-",
    ]
    proc = subprocess.run(raw_cmd, capture_output=True)
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg frame scan failed: {proc.stderr.decode('utf-8', 'ignore')}")

    frame_bytes = scale_w * scale_h
    buf = proc.stdout
    num_frames = len(buf) // frame_bytes
    if num_frames == 0:
        raise RuntimeError("No frames decoded during sharpness scan.")

    best_idx = 0
    best_score = -1.0
    for idx in range(num_frames):
        chunk = buf[idx * frame_bytes : (idx + 1) * frame_bytes]
        gray = np.frombuffer(chunk, dtype=np.uint8).reshape((scale_h, scale_w))
        score = score_frame_sharpness(gray)
        if score > best_score:
            best_score = score
            best_idx = idx

    best_ts = start_sec + (best_idx + 0.5) / sample_fps
    best_ts = min(max(0.0, best_ts), max(0.0, total_dur - 0.04))

    out_png = (
        Path(args.out).resolve()
        if args.out
        else video_path.with_name(f"{video_path.stem}_clean_plate.png")
    )
    out_png.parent.mkdir(parents=True, exist_ok=True)

    pre_seek = max(0.0, best_ts - 0.5)
    post_seek = best_ts - pre_seek
    extract_cmd = [
        ffmpeg_bin,
        "-y",
        "-v",
        "error",
        "-ss",
        f"{pre_seek:.3f}",
        "-i",
        str(video_path),
        "-ss",
        f"{post_seek:.3f}",
        "-frames:v",
        "1",
        "-c:v",
        "png",
        str(out_png),
    ]
    subprocess.run(extract_cmd, check=True)

    print(f"Clean plate extracted: {out_png}")
    print(
        f"  Resolution : {meta['width']}x{meta['height']}\n"
        f"  Timestamp  : {best_ts:.3f}s (scanned {num_frames} frames, sharpness={best_score:.6f})\n"
        f"  Next step  : Run 'room_object_swap.py gemini-plate-edit {out_png.name}' to swap the background prop,\n"
        f"               then run 'room_object_swap.py auto-person-mask {video_path.name} --composite-plate <swapped.png>'\n"
        f"               so your face and foreground stay 100% sharp over the edited background."
    )


def cmd_gemini_plate_edit(args: argparse.Namespace) -> None:
    from PIL import Image

    plate_path = Path(args.input_plate).resolve()
    if not plate_path.exists():
        raise FileNotFoundError(f"Input clean plate not found: {plate_path}")

    with Image.open(plate_path) as im:
        orig_w, orig_h = im.size

    aspect_ratio = args.aspect_ratio or pick_closest_aspect_ratio(orig_w, orig_h)
    prompt = (args.prompt or DEFAULT_PLATE_PROMPT).strip()
    out_png = (
        Path(args.out).resolve()
        if args.out
        else plate_path.with_name(f"{plate_path.stem}_swapped.png")
    )
    out_png.parent.mkdir(parents=True, exist_ok=True)

    ref_paths = [Path(p).resolve() for p in (args.ref_image or [])]
    for rp in ref_paths:
        if not rp.exists():
            raise FileNotFoundError(f"Reference image not found: {rp}")

    if args.dry_run:
        plan = {
            "model": args.model,
            "inputPlate": str(plate_path),
            "plateResolution": f"{orig_w}x{orig_h}",
            "aspectRatio": aspect_ratio,
            "imageSize": args.image_size,
            "referenceImages": [str(rp) for rp in ref_paths],
            "prompt": prompt,
            "outputPlate": str(out_png),
            "matchInputDimensions": not args.no_match_size,
        }
        print("=== Gemini Plate Edit (Dry Run) ===")
        print(json.dumps(plan, indent=2))
        return

    require_gemini_api_key()
    try:
        from google import genai
        from google.genai import types
    except ImportError as exc:
        raise RuntimeError(
            "google-genai SDK is missing in this Python environment. "
            "Install with: uv pip install --python tools/.venv/Scripts/python.exe -U google-genai"
        ) from exc

    input_parts: list[dict[str, Any]] = [
        {
            "type": "image",
            "data": base64.b64encode(plate_path.read_bytes()).decode("ascii"),
            "mime_type": detect_image_mime(plate_path),
        }
    ]
    for rp in ref_paths:
        input_parts.append(
            {
                "type": "image",
                "data": base64.b64encode(rp.read_bytes()).decode("ascii"),
                "mime_type": detect_image_mime(rp),
            }
        )
    input_parts.append({"type": "text", "text": prompt})

    client = genai.Client(http_options=types.HttpOptions(timeout=300 * 1000))
    print(f"Editing clean plate via {args.model} ({orig_w}x{orig_h}, ratio={aspect_ratio}, size={args.image_size})...")
    interaction = client.interactions.create(
        model=args.model,
        input=input_parts,
        response_format={
            "type": "image",
            "aspect_ratio": aspect_ratio,
            "image_size": args.image_size,
            "delivery": "inline",
        },
    )

    if getattr(interaction, "output_text", None):
        print(f"Model note: {interaction.output_text}")

    out_img = getattr(interaction, "output_image", None)
    if out_img is None:
        raise RuntimeError("Gemini interaction returned no output_image.")

    raw_bytes: bytes | None = None
    data_val = getattr(out_img, "data", None)
    if data_val:
        if isinstance(data_val, (bytes, bytearray)):
            raw_bytes = bytes(data_val)
        else:
            raw_bytes = base64.b64decode(data_val)
    elif getattr(out_img, "uri", None):
        raw_bytes = client.files.download(file=out_img.uri)

    if not raw_bytes:
        raise RuntimeError("Gemini output_image contained neither inline data nor a downloadable URI.")

    with Image.open(io.BytesIO(raw_bytes)) as generated:
        rgb = generated.convert("RGB")
        if not args.no_match_size and rgb.size != (orig_w, orig_h):
            rgb = rgb.resize((orig_w, orig_h), Image.Resampling.LANCZOS)
        rgb.save(out_png, format="PNG")

    print(f"Edited clean plate saved: {out_png} ({orig_w}x{orig_h} PNG)")


def ensure_segmenter_model(model_path: Path) -> Path:
    """Locate or download MediaPipe's lightweight selfie_segmenter.tflite (~244 KB)."""
    if model_path.exists() and model_path.stat().st_size > 10_000:
        return model_path
    model_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"Downloading MediaPipe selfie segmenter model (~244 KB) -> {model_path}...")
    urllib.request.urlretrieve(SELFIE_SEGMENTER_URL, model_path)
    return model_path


def parse_swap_box(box_str: str | None, width: int, height: int) -> tuple[int, int, int, int] | None:
    """Parse x,y,w,h (normalized <=1.0 or pixels) into clamped pixel rectangle (x0, y0, x1, y1)."""
    if not box_str:
        return None
    parts = [float(p.strip()) for p in box_str.split(",")]
    if len(parts) != 4:
        raise ValueError("--swap-box must have 4 comma-separated numbers: x,y,w,h")
    x, y, w, h = parts
    is_norm = all(0.0 <= v <= 1.0 for v in parts)
    if is_norm:
        x0 = int(round(x * width))
        y0 = int(round(y * height))
        x1 = int(round((x + w) * width))
        y1 = int(round((y + h) * height))
    else:
        x0 = int(round(x))
        y0 = int(round(y))
        x1 = int(round(x + w))
        y1 = int(round(y + h))
    x0 = max(0, min(width - 1, x0))
    y0 = max(0, min(height - 1, y0))
    x1 = max(x0 + 1, min(width, x1))
    y1 = max(y0 + 1, min(height, y1))
    return (x0, y0, x1, y1)


def soft_sigmoid_mask(prob: np.ndarray, threshold: float, softness: float) -> np.ndarray:
    """Map [0, 1] probability confidence to smooth [0, 1] alpha mask."""
    if softness <= 1e-4:
        return (prob >= threshold).astype(np.float32)
    low = max(0.0, threshold - softness)
    high = min(1.0, threshold + softness)
    if high <= low + 1e-4:
        return (prob >= threshold).astype(np.float32)
    t = np.clip((prob - low) / (high - low), 0.0, 1.0)
    # Smoothstep curve for clean anti-aliased edge falloff
    return (t * t * (3.0 - 2.0 * t)).astype(np.float32)


def cmd_auto_person_mask(args: argparse.Namespace) -> None:
    require_numpy()
    import cv2

    video_path = Path(args.input_video).resolve()
    if not video_path.exists():
        raise FileNotFoundError(f"Input video not found: {video_path}")

    ffmpeg_bin = find_media_bin("ffmpeg")
    ffprobe_bin = find_media_bin("ffprobe")
    meta = probe_video(ffprobe_bin, video_path)
    w, h = meta["width"], meta["height"]
    fps = meta["fps"]

    out_mask = (
        Path(args.out_mask).resolve()
        if args.out_mask
        else video_path.with_name(f"{video_path.stem}_person_mask.mp4")
    )
    out_mask.parent.mkdir(parents=True, exist_ok=True)

    plate_path: Path | None = None
    if args.composite_plate:
        plate_path = Path(args.composite_plate).resolve()
        if not plate_path.exists():
            raise FileNotFoundError(f"Composite plate PNG not found: {plate_path}")

    ref_bg_small: np.ndarray | None = None
    if args.ref_plate:
        ref_path = Path(args.ref_plate).resolve()
        if not ref_path.exists():
            raise FileNotFoundError(f"Reference plate not found: {ref_path}")
        ref_img = cv2.imread(str(ref_path), cv2.IMREAD_COLOR)
        if ref_img is None:
            raise RuntimeError(f"Failed to read reference plate: {ref_path}")
    else:
        ref_img = None

    backend = args.backend
    segmenter = None
    mp = None

    if backend in {"auto", "mediapipe"}:
        try:
            import mediapipe as mp_mod
            from mediapipe.tasks import python as mp_python
            from mediapipe.tasks.python import vision

            model_path = ensure_segmenter_model(Path(args.model_path).resolve())
            opts = vision.ImageSegmenterOptions(
                base_options=mp_python.BaseOptions(model_asset_path=str(model_path)),
                running_mode=vision.RunningMode.VIDEO,
                output_confidence_masks=True,
                output_category_mask=False,
            )
            segmenter = vision.ImageSegmenter.create_from_options(opts)
            mp = mp_mod
            backend = "mediapipe"
        except Exception as exc:
            if backend == "mediapipe":
                raise RuntimeError(f"MediaPipe segmenter initialization failed: {exc}") from exc
            print(f"[warn] MediaPipe unavailable ({exc}); falling back to OpenCV diff segmenter.", file=sys.stderr)
            backend = "diff"

    swap_rect = parse_swap_box(args.swap_box, w, h)
    seg_w = min(w, max(128, int(args.seg_width)))
    seg_h = max(64, int(round((h * seg_w / max(1, w)) / 2.0) * 2))

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Failed to open video stream via OpenCV: {video_path}")

    if backend == "diff" and ref_img is not None:
        ref_bg_small = cv2.resize(ref_img, (seg_w, seg_h), interpolation=cv2.INTER_AREA).astype(np.float32)

    # Estimate static background via temporal median of first few frames if diff mode has no ref_img
    if backend == "diff" and ref_bg_small is None:
        sample_frames: list[np.ndarray] = []
        total_est = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 30
        idxs = np.linspace(0, max(0, total_est - 1), num=min(9, max(1, total_est)), dtype=int)
        for idx in idxs:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
            ok, fr = cap.read()
            if ok:
                sample_frames.append(cv2.resize(fr, (seg_w, seg_h), interpolation=cv2.INTER_AREA))
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        if sample_frames:
            ref_bg_small = np.median(np.stack(sample_frames, axis=0), axis=0).astype(np.float32)

    encode_cmd = [
        ffmpeg_bin,
        "-y",
        "-v",
        "warning",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "gray",
        "-s",
        f"{w}x{h}",
        "-r",
        f"{fps:.6f}",
        "-i",
        "-",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "16",
        "-pix_fmt",
        "yuv420p",
        str(out_mask),
    ]
    ff_proc = subprocess.Popen(encode_cmd, stdin=subprocess.PIPE)
    assert ff_proc.stdin is not None

    ema_alpha = max(0.05, min(1.0, 1.0 - float(args.temporal_smooth)))
    prev_mask_small: np.ndarray | None = None
    morph_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    dilate_px = max(0, int(args.dilate))
    dilate_kernel = (
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (dilate_px * 2 + 1, dilate_px * 2 + 1))
        if dilate_px > 0
        else None
    )
    feather_sigma = max(0.0, float(args.feather))

    frame_idx = 0
    print(f"Generating person matte ({w}x{h} @ {fps:.2f}fps, backend={backend}, infer={seg_w}x{seg_h})...")
    try:
        while True:
            ok, bgr = cap.read()
            if not ok:
                break

            small_bgr = cv2.resize(bgr, (seg_w, seg_h), interpolation=cv2.INTER_AREA)

            if backend == "mediapipe" and segmenter is not None and mp is not None:
                small_rgb = cv2.cvtColor(small_bgr, cv2.COLOR_BGR2RGB)
                mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=small_rgb)
                ts_ms = int(round((frame_idx * 1000.0) / max(1.0, fps)))
                res = segmenter.segment_for_video(mp_img, ts_ms)
                conf = res.confidence_masks[0].numpy_view().squeeze().astype(np.float32)
                raw_mask = soft_sigmoid_mask(conf, args.threshold, args.softness)
            else:
                assert ref_bg_small is not None
                diff = np.linalg.norm(small_bgr.astype(np.float32) - ref_bg_small, axis=2)
                raw_mask = np.clip((diff - 18.0) / 28.0, 0.0, 1.0).astype(np.float32)

            # Morphological cleanup + gentle edge safety dilation
            binary_u8 = (raw_mask * 255.0).astype(np.uint8)
            binary_u8 = cv2.morphologyEx(binary_u8, cv2.MORPH_CLOSE, morph_kernel)
            if dilate_kernel is not None:
                binary_u8 = cv2.dilate(binary_u8, dilate_kernel, iterations=1)
            cleaned = np.maximum(raw_mask, binary_u8.astype(np.float32) / 255.0 * 0.85)

            # Temporal EMA smoothing to remove edge chatter
            if prev_mask_small is None:
                smoothed = cleaned
            else:
                smoothed = ema_alpha * cleaned + (1.0 - ema_alpha) * prev_mask_small
            prev_mask_small = smoothed

            full_mask = cv2.resize(smoothed, (w, h), interpolation=cv2.INTER_LINEAR)
            if feather_sigma > 0.0:
                full_mask = cv2.GaussianBlur(full_mask, (0, 0), sigmaX=feather_sigma, sigmaY=feather_sigma)

            # Lock pixels outside --swap-box to 1.0 (100% foreground preserved)
            if swap_rect is not None:
                x0, y0, x1, y1 = swap_rect
                box_protected = np.ones((h, w), dtype=np.float32)
                box_protected[y0:y1, x0:x1] = full_mask[y0:y1, x0:x1]
                full_mask = box_protected

            matte_u8 = np.clip(np.round(full_mask * 255.0), 0, 255).astype(np.uint8)
            if args.invert:
                matte_u8 = 255 - matte_u8

            ff_proc.stdin.write(matte_u8.tobytes())
            frame_idx += 1
    finally:
        cap.release()
        if segmenter is not None:
            segmenter.close()
        if ff_proc.stdin:
            ff_proc.stdin.close()
        ret = ff_proc.wait()
        if ret != 0:
            raise RuntimeError(f"ffmpeg matte encoding failed with exit code {ret}")

    print(f"Person matte saved ({frame_idx} frames): {out_mask}")

    if plate_path is None:
        return

    out_mp4 = (
        Path(args.out).resolve()
        if args.out
        else video_path.with_name(f"{video_path.stem}_swapped.mp4")
    )
    out_mp4.parent.mkdir(parents=True, exist_ok=True)

    matte_neg = ",negate" if args.invert else ""
    filter_complex = (
        f"[0:v]format=rgba[fg_rgb];"
        f"[2:v]scale={w}:{h}:flags=bilinear,format=gray{matte_neg}[matte];"
        f"[fg_rgb][matte]alphamerge[fg];"
        f"[1:v]scale={w}:{h}:flags=lanczos,format=rgba[bg];"
        f"[bg][fg]overlay=0:0:eof_action=pass:shortest=1,format=yuv420p[vout]"
    )

    comp_cmd = [
        ffmpeg_bin,
        "-y",
        "-v",
        "warning",
        "-i",
        str(video_path),
        "-framerate",
        f"{fps:.6f}",
        "-loop",
        "1",
        "-i",
        str(plate_path),
        "-i",
        str(out_mask),
        "-filter_complex",
        filter_complex,
        "-map",
        "[vout]",
        *(["-map", "0:a", "-c:a", "copy"] if meta["hasAudio"] else ["-an"]),
        "-r",
        f"{fps:.6f}",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "17",
        "-pix_fmt",
        "yuv420p",
        "-shortest",
        str(out_mp4),
    ]
    print(f"Compositing real foreground over edited plate -> {out_mp4}...")
    subprocess.run(comp_cmd, check=True)
    print(f"Composited object swap complete -> {out_mp4}")


def cmd_composite_plate(args: argparse.Namespace) -> None:
    video_path = Path(args.input_video).resolve()
    plate_path = Path(args.plate).resolve()
    mask_path = Path(args.mask).resolve()
    for p, label in ((video_path, "input video"), (plate_path, "edited plate"), (mask_path, "mask PNG")):
        if not p.exists():
            raise FileNotFoundError(f"Missing {label}: {p}")

    ffmpeg_bin = find_media_bin("ffmpeg")
    ffprobe_bin = find_media_bin("ffprobe")
    meta = probe_video(ffprobe_bin, video_path)

    out_mp4 = (
        Path(args.out).resolve()
        if args.out
        else video_path.with_name(f"{video_path.stem}_swapped.mp4")
    )
    out_mp4.parent.mkdir(parents=True, exist_ok=True)

    sigma = max(0.0, float(args.feather))
    w, h = meta["width"], meta["height"]
    blur_op = f",gblur=sigma={sigma:.2f}" if sigma > 0 else ""

    filter_complex = (
        f"[1:v]scale={w}:{h}:flags=lanczos,format=rgba[plate];"
        f"[2:v]scale={w}:{h}:flags=bilinear,format=gray{blur_op}[mask];"
        f"[plate][mask]alphamerge[patch];"
        f"[0:v][patch]overlay=0:0:shortest=1,format=yuv420p[vout]"
    )

    cmd = [
        ffmpeg_bin,
        "-y",
        "-v",
        "warning",
        "-i",
        str(video_path),
        "-framerate",
        f"{meta['fps']:.6f}",
        "-loop",
        "1",
        "-i",
        str(plate_path),
        "-framerate",
        f"{meta['fps']:.6f}",
        "-loop",
        "1",
        "-i",
        str(mask_path),
        "-filter_complex",
        filter_complex,
        "-map",
        "[vout]",
        *(["-map", "0:a", "-c:a", "copy"] if meta["hasAudio"] else ["-an"]),
        "-r",
        f"{meta['fps']:.6f}",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "17",
        "-pix_fmt",
        "yuv420p",
        "-shortest",
        str(out_mp4),
    ]
    subprocess.run(cmd, check=True)
    print(f"Composited static object swap -> {out_mp4}")


def cmd_omni_edit(args: argparse.Namespace) -> None:
    video_path = Path(args.input_video).resolve()
    if not video_path.exists():
        raise FileNotFoundError(f"Input video not found: {video_path}")

    duration = int(args.duration)
    if duration < 3 or duration > 15:
        raise ValueError(
            f"Gemini Omni 1.2 Flash video editing supports 3 to 15 seconds (got {duration}s)."
        )

    ffmpeg_bin = find_media_bin("ffmpeg")
    ffprobe_bin = find_media_bin("ffprobe")
    meta = probe_video(ffprobe_bin, video_path)

    start_sec = max(0.0, float(args.start))
    if meta["durationSec"] > 0 and start_sec >= meta["durationSec"]:
        raise ValueError(
            f"--start ({start_sec}s) exceeds input duration ({meta['durationSec']:.2f}s)."
        )

    out_mp4 = (
        Path(args.out).resolve()
        if args.out
        else video_path.with_name(f"{video_path.stem}_omni_swapped.mp4")
    )
    out_mp4.parent.mkdir(parents=True, exist_ok=True)
    prepped_clip = out_mp4.with_name(f"{video_path.stem}_omni_src_{duration}s.mp4")

    max_w = 1920 if args.resolution in {"1080p", "4k"} else 1280
    scale_filter = f"scale='min({max_w},iw)':-2:flags=lanczos,format=yuv420p"

    prep_cmd = [
        ffmpeg_bin,
        "-y",
        "-v",
        "warning",
        "-ss",
        f"{start_sec:.3f}",
        "-t",
        str(duration),
        "-i",
        str(video_path),
        "-vf",
        scale_filter,
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "18",
        *(["-an"] if (args.strip_audio or not meta["hasAudio"]) else ["-c:a", "aac", "-b:a", "192k"]),
        str(prepped_clip),
    ]

    prompt = (args.prompt or DEFAULT_OMNI_PROMPT).strip()
    if "keep everything else the same" not in prompt.lower():
        prompt = f"{prompt.rstrip('.')} Keep everything else the same."

    gen_cmd = [
        sys.executable,
        str(SKILL_GENERATE_VIDEO),
        prompt,
        "--video",
        str(prepped_clip),
        "--duration",
        str(duration),
        "--resolution",
        args.resolution,
        "--aspect-ratio",
        args.aspect_ratio,
        "--output",
        str(out_mp4),
    ]
    if args.ref_image:
        ref_path = Path(args.ref_image).resolve()
        if not ref_path.exists():
            raise FileNotFoundError(f"Reference image not found: {ref_path}")
        gen_cmd.extend(["--image", str(ref_path)])
    if args.strip_audio:
        gen_cmd.append("--strip-audio")

    manifest_path = out_mp4.with_suffix(".omni-job.json")
    manifest = {
        "model": "gemini-omni-1.2-flash",
        "sourceVideo": str(video_path),
        "preppedClip": str(prepped_clip),
        "outputVideo": str(out_mp4),
        "startSec": start_sec,
        "durationSec": duration,
        "resolution": args.resolution,
        "aspectRatio": args.aspect_ratio,
        "stripAudio": bool(args.strip_audio),
        "referenceImage": str(Path(args.ref_image).resolve()) if args.ref_image else None,
        "prompt": prompt,
        "limits": {
            "maxClipSec": 15,
            "regionalRestriction": "Video upload editing is unavailable in EEA, Switzerland, UK, and select US states.",
        },
        "prepFfmpegCommand": prep_cmd,
        "omniSkillCommand": gen_cmd,
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    def format_cmd(cmd_parts: list[str]) -> str:
        if os.name == "nt":
            return subprocess.list2cmdline(cmd_parts)
        return " ".join(shlex.quote(x) for x in cmd_parts)

    print("=== Gemini Omni 1.2 Flash Video Object-Swap Workflow ===")
    print("Note: Supports 3-15s clips; unavailable in EEA/Switzerland/UK/select US states.")
    print(f"Manifest saved: {manifest_path}")
    print("\n1) Prepare 3-15s clip:")
    print("  " + format_cmd(prep_cmd))
    print("\n2) Run Gemini Omni 1.2 Flash edit (requires GEMINI_API_KEY & google-genai >= 2.30.1):")
    print("  " + format_cmd(gen_cmd))

    if not args.run:
        print("\nDry run complete. Re-run with --run to execute both commands.")
        return

    require_gemini_api_key()
    if not SKILL_GENERATE_VIDEO.exists():
        raise FileNotFoundError(
            f"gemini-omni-flash-api script not found: {SKILL_GENERATE_VIDEO}"
        )

    try:
        import google.genai  # noqa: F401
    except ImportError as exc:
        raise RuntimeError(
            "google-genai SDK is missing in this Python environment. "
            "Install it with: uv pip install --python tools/.venv/Scripts/python.exe -U google-genai"
        ) from exc

    print("\nRunning clip prep with ffmpeg...")
    subprocess.run(prep_cmd, check=True)

    env = os.environ.copy()
    ffmpeg_dir = str(Path(ffmpeg_bin).parent)
    env["PATH"] = f"{ffmpeg_dir}{os.pathsep}{env.get('PATH', '')}"

    print("Running gemini-omni-1.2-flash video edit...")
    subprocess.run(gen_cmd, check=True, env=env)
    print(f"Completed Omni swap -> {out_mp4}")


def cmd_export_person_matte(args: argparse.Namespace) -> None:
    """Export a temporally smoothed RGBA alpha presenter video (.webm VP9 or ProRes 4444 .mov)."""

    video_path = Path(args.input_video).resolve()
    if not args.dry_run and not video_path.exists():
        raise FileNotFoundError(f"Input video not found: {video_path}")

    ffmpeg_bin = find_media_bin("ffmpeg")
    ffprobe_bin = find_media_bin("ffprobe")
    meta = (
        probe_video(ffprobe_bin, video_path)
        if video_path.exists()
        else {
            "width": 1920,
            "height": 1080,
            "fps": 30.0,
            "durationSec": 10.0,
            "nbFrames": 300,
            "hasAudio": True,
        }
    )
    w, h = meta["width"], meta["height"]
    fps = meta["fps"]

    codec = args.codec
    if codec == "auto":
        if args.out and str(args.out).lower().endswith(".mov"):
            codec = "prores"
        else:
            codec = "webm"

    default_name = "aroll_person_alpha.mov" if codec == "prores" else "aroll_person_alpha.webm"
    out_alpha = Path(args.out).resolve() if args.out else video_path.with_name(default_name)
    out_alpha.parent.mkdir(parents=True, exist_ok=True)

    start_sec = max(0.0, float(args.start))
    dur_sec = float(args.duration) if args.duration is not None else None

    if codec == "prores":
        codec_args = [
            "-c:v",
            "prores_ks",
            "-profile:v",
            "4444",
            "-pix_fmt",
            "yuva444p10le",
            "-vendor",
            "apl0",
            "-bits_per_mb",
            "8000",
        ]
    else:
        codec_args = [
            "-c:v",
            "libvpx-vp9",
            "-pix_fmt",
            "yuva420p",
            "-b:v",
            "0",
            "-crf",
            "22",
            "-row-mt",
            "1",
            "-deadline",
            "good",
            "-cpu-used",
            "2",
            "-auto-alt-ref",
            "0",
        ]

    audio_input_args: list[str] = []
    audio_map_args: list[str] = ["-an"]
    if args.keep_audio and meta["hasAudio"]:
        if start_sec > 0:
            audio_input_args.extend(["-ss", f"{start_sec:.3f}"])
        if dur_sec is not None:
            audio_input_args.extend(["-t", f"{dur_sec:.3f}"])
        audio_input_args.extend(["-i", str(video_path)])
        audio_map_args = [
            "-map",
            "0:v:0",
            "-map",
            "1:a:0",
            "-c:a",
            "pcm_s16le" if codec == "prores" else "libopus",
            "-shortest",
        ]

    encode_cmd = [
        ffmpeg_bin,
        "-y",
        "-v",
        "warning",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "bgra",
        "-s",
        f"{w}x{h}",
        "-r",
        f"{fps:.6f}",
        "-i",
        "-",
        *audio_input_args,
        *codec_args,
        *audio_map_args,
        str(out_alpha),
    ]

    if args.dry_run:
        plan = {
            "command": "export-person-matte",
            "inputVideo": str(video_path),
            "outputAlphaVideo": str(out_alpha),
            "codec": codec,
            "resolution": f"{w}x{h}",
            "fps": round(fps, 3),
            "temporalSmooth": args.temporal_smooth,
            "featherSigma": args.feather,
            "keepAudio": bool(args.keep_audio),
            "ffmpegEncodeCommand": encode_cmd,
        }
        print("=== Alpha Presenter Matte Export (Dry Run) ===")
        print(json.dumps(plan, indent=2))
        return

    require_numpy()
    import cv2

    backend = args.backend
    segmenter = None
    mp = None
    if backend in {"auto", "mediapipe"}:
        try:
            import mediapipe as mp_mod
            from mediapipe.tasks import python as mp_python
            from mediapipe.tasks.python import vision

            model_path = ensure_segmenter_model(Path(args.model_path).resolve())
            opts = vision.ImageSegmenterOptions(
                base_options=mp_python.BaseOptions(model_asset_path=str(model_path)),
                running_mode=vision.RunningMode.VIDEO,
                output_confidence_masks=True,
                output_category_mask=False,
            )
            segmenter = vision.ImageSegmenter.create_from_options(opts)
            mp = mp_mod
            backend = "mediapipe"
        except Exception as exc:
            if backend == "mediapipe":
                raise RuntimeError(f"MediaPipe segmenter initialization failed: {exc}") from exc
            print(
                f"[warn] MediaPipe unavailable ({exc}); falling back to OpenCV diff segmenter.",
                file=sys.stderr,
            )
            backend = "diff"

    seg_w = min(w, max(128, int(args.seg_width)))
    seg_h = max(64, int(round((h * seg_w / max(1, w)) / 2.0) * 2))

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Failed to open video stream via OpenCV: {video_path}")

    ref_bg_small: np.ndarray | None = None
    if backend == "diff":
        if args.ref_plate:
            rp = Path(args.ref_plate).resolve()
            if not rp.exists():
                raise FileNotFoundError(f"Reference plate not found: {rp}")
            ref_img = cv2.imread(str(rp), cv2.IMREAD_COLOR)
            if ref_img is not None:
                ref_bg_small = cv2.resize(
                    ref_img, (seg_w, seg_h), interpolation=cv2.INTER_AREA
                ).astype(np.float32)
        if ref_bg_small is None:
            samples_list: list[np.ndarray] = []
            total_est = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 30
            idxs = np.linspace(0, max(0, total_est - 1), num=min(9, max(1, total_est)), dtype=int)
            for idx in idxs:
                cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
                ok, fr = cap.read()
                if ok:
                    samples_list.append(cv2.resize(fr, (seg_w, seg_h), interpolation=cv2.INTER_AREA))
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            if samples_list:
                ref_bg_small = np.median(np.stack(samples_list, axis=0), axis=0).astype(np.float32)

    if start_sec > 0:
        cap.set(cv2.CAP_PROP_POS_MSEC, start_sec * 1000.0)
    max_frames = int(round(dur_sec * fps)) if dur_sec is not None else None

    ff_proc = subprocess.Popen(encode_cmd, stdin=subprocess.PIPE)
    assert ff_proc.stdin is not None

    ema_alpha = max(0.05, min(1.0, 1.0 - float(args.temporal_smooth)))
    prev_mask_small: np.ndarray | None = None
    morph_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    dilate_px = max(0, int(args.dilate))
    dilate_kernel = (
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (dilate_px * 2 + 1, dilate_px * 2 + 1))
        if dilate_px > 0
        else None
    )
    feather_sigma = max(0.0, float(args.feather))
    despill = max(0.0, min(0.5, float(args.despill)))

    frame_idx = 0
    print(
        f"Exporting alpha presenter matte ({w}x{h} @ {fps:.2f}fps, codec={codec}, backend={backend}) -> {out_alpha}..."
    )
    try:
        while True:
            if max_frames is not None and frame_idx >= max_frames:
                break
            ok, bgr = cap.read()
            if not ok:
                break

            small_bgr = cv2.resize(bgr, (seg_w, seg_h), interpolation=cv2.INTER_AREA)
            if backend == "mediapipe" and segmenter is not None and mp is not None:
                small_rgb = cv2.cvtColor(small_bgr, cv2.COLOR_BGR2RGB)
                mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=small_rgb)
                ts_ms = int(round((frame_idx * 1000.0) / max(1.0, fps)))
                res = segmenter.segment_for_video(mp_img, ts_ms)
                conf = res.confidence_masks[0].numpy_view().squeeze().astype(np.float32)
                raw_mask = soft_sigmoid_mask(conf, args.threshold, args.softness)
            else:
                assert ref_bg_small is not None
                diff = np.linalg.norm(small_bgr.astype(np.float32) - ref_bg_small, axis=2)
                raw_mask = np.clip((diff - 18.0) / 28.0, 0.0, 1.0).astype(np.float32)

            binary_u8 = (raw_mask * 255.0).astype(np.uint8)
            binary_u8 = cv2.morphologyEx(binary_u8, cv2.MORPH_CLOSE, morph_kernel)
            if dilate_kernel is not None:
                binary_u8 = cv2.dilate(binary_u8, dilate_kernel, iterations=1)
            cleaned = np.maximum(raw_mask, binary_u8.astype(np.float32) / 255.0 * 0.85)

            smoothed = (
                cleaned
                if prev_mask_small is None
                else ema_alpha * cleaned + (1.0 - ema_alpha) * prev_mask_small
            )
            prev_mask_small = smoothed

            full_mask = cv2.resize(smoothed, (w, h), interpolation=cv2.INTER_LINEAR)
            if feather_sigma > 0.0:
                full_mask = cv2.GaussianBlur(
                    full_mask, (0, 0), sigmaX=feather_sigma, sigmaY=feather_sigma
                )

            alpha_u8 = np.clip(np.round(full_mask * 255.0), 0, 255).astype(np.uint8)
            fg_bgr = bgr
            if despill > 0.0:
                edge_band = ((full_mask > 0.04) & (full_mask < 0.72)).astype(np.float32)
                atten = 1.0 - despill * edge_band[..., None]
                fg_bgr = np.clip(bgr.astype(np.float32) * atten, 0, 255).astype(np.uint8)

            bgra = np.dstack((fg_bgr, alpha_u8))
            ff_proc.stdin.write(bgra.tobytes())
            frame_idx += 1
    finally:
        cap.release()
        if segmenter is not None:
            segmenter.close()
        if ff_proc.stdin:
            ff_proc.stdin.close()
        ret = ff_proc.wait()
        if ret != 0:
            raise RuntimeError(f"ffmpeg alphapresenter encoding failed with exit code {ret}")

    print(
        f"Alpha presenter matte exported ({frame_idx} frames): {out_alpha}\n"
        f"  Ready for Remotion <PresenterDepthStage presenterAlphaSrc=\"{out_alpha.name}\"> "
        f"and DaVinci 'export-fcpxml.mjs --person-alpha {out_alpha.name}'."
    )


READING_ROOM_PROP_THEMES: list[dict[str, Any]] = [
    {
        "id": "sovereign-fiscal-ledger",
        "title": "Sovereign Debt & Treasury Ledger",
        "lut": "editorial-warm",
        "keywords": [
            r"treasury",
            r"table\s*9",
            r"national\s+debt",
            r"bondholders?",
            r"withholding",
            r"40\.5\s*trillion",
            r"2\.1\s*trillion",
        ],
        "bookshelfProps": [
            "cloth-bound U.S. Treasury Monthly Statement & CBO Forecast volumes",
            "aged brass banker's balance scale on middle walnut shelf",
            "linen archival box files labeled 'FISCAL RECEIPTS'",
        ],
        "deskProps": ["fountain pen resting beside a cream ledger pad"],
    },
    {
        "id": "household-mortgage-balance",
        "title": "Household Balance Sheet & Fixed Debt",
        "lut": "austin-august-heat",
        "keywords": [
            r"claire",
            r"mortgage",
            r"3,?400",
            r"thirty-year\s+loan",
            r"irving\s+fisher",
            r"debt\s+deflation",
            r"escrow",
            r"underwater",
        ],
        "bookshelfProps": [
            "architectural timber house elevation model on middle walnut shelf",
            "1933 Irving Fisher 'Debt-Deflation' hardcover monograph",
            "framed vintage residential plat blueprint",
        ],
        "deskProps": ["cast-iron house key weight on cream blotter corner"],
    },
    {
        "id": "statutory-dividend-court",
        "title": "Statutory Dividend & Judicial Veto",
        "lut": "archival-parchment",
        "keywords": [
            r"alaska",
            r"permanent\s+fund",
            r"veto\s+pen",
            r"wielechowski",
            r"supreme\s+court",
            r"escape\s+hatch\s+number\s+one",
            r"social\s+security",
        ],
        "bookshelfProps": [
            "buckram-bound state reporter legal volumes (Alaska & Federal)",
            "turned walnut judicial gavel on brass cradle",
            "vertical archival statute binders",
        ],
        "deskProps": ["uncapped black ebonite fountain pen on blotting paper"],
    },
    {
        "id": "compute-scrip-wallets",
        "title": "Compute Credits & Company Scrip History",
        "lut": "midnight-desk",
        "keywords": [
            r"universal\s+basic\s+compute",
            r"tokens?",
            r"uber",
            r"cloud\s+credits?",
            r"scrip",
            r"paint\s+creek",
            r"island\s+creek",
            r"shenzhen",
        ],
        "bookshelfProps": [
            "matte anodized server heatsink fin module beside hardcover books",
            "shadow-box display of 1912 West Virginia brass coal scrip tokens",
            "1938 Fair Labor Standards Act archival volume",
        ],
        "deskProps": ["stacked brass tokens beside a brushed aluminum SSD sled"],
    },
    {
        "id": "grid-watts-transformers",
        "title": "Physical Power Grid, Substations & Rationing",
        "lut": "blueprint-cyanotype",
        "keywords": [
            r"gigawatts?",
            r"terawatt-hours?",
            r"\bpjm\b",
            r"269\.92",
            r"833\s*percent",
            r"three\s+mile\s+island",
            r"transformers?",
            r"copper",
            r"ration\s+points",
        ],
        "bookshelfProps": [
            "vintage glass-dome analog induction watt-hour meter on walnut shelf",
            "coiled heavy-gauge bare copper busbar specimen",
            "1941 UK Ministry of Food cloth ration ledger",
        ],
        "deskProps": ["ceramic high-voltage porcelain insulator paperweight"],
    },
    {
        "id": "epilogue-reading-room-verdict",
        "title": "The Reading Room Verdict & Synthesis",
        "lut": "kodak-2383-print",
        "keywords": [
            r"allowance",
            r"two\s+hundred\s+years",
            r"unwritten\s+truce",
            r"one\s+signature",
            r"next\s+video",
        ],
        "bookshelfProps": [
            "warm walnut library shelf of classic economic history hardcovers",
            "soft warm-brass library banker's lamp glow (2700K)",
            "closed archival leather portfolio",
        ],
        "deskProps": ["closed moleskine notebook and brass bookmark"],
    },
]


def format_mmss(seconds: float) -> str:
    s = max(0, int(round(seconds)))
    return f"{s // 60:02d}:{s % 60:02d}"


def score_prop_theme(text: str) -> dict[str, Any]:
    best = READING_ROOM_PROP_THEMES[0]
    best_hits = -1
    for theme in READING_ROOM_PROP_THEMES:
        hits = sum(len(re.findall(pat, text, flags=re.IGNORECASE)) for pat in theme["keywords"])
        if hits > best_hits:
            best_hits = hits
            best = theme
    return best


def split_script_into_acts(raw_text: str, target_acts: int = 6) -> list[dict[str, Any]]:
    cleaned = raw_text.replace("\r\n", "\n").strip()
    heading_matches = list(re.finditer(r"^#{1,3}\s+(.+)$", cleaned, flags=re.MULTILINE))
    if len(heading_matches) >= 2:
        acts: list[dict[str, Any]] = []
        for idx, m in enumerate(heading_matches):
            start = m.end()
            end = heading_matches[idx + 1].start() if idx + 1 < len(heading_matches) else len(cleaned)
            body = cleaned[start:end].strip()
            if body:
                acts.append({"heading": m.group(1).strip(), "text": body})
        if acts:
            return acts

    paragraphs = [p.strip() for p in re.split(r"\n\s*\n+", cleaned) if p.strip()]
    if not paragraphs:
        return []

    act_count = max(1, min(target_acts, len(paragraphs)))
    chunk_size = max(1, round(len(paragraphs) / act_count))
    acts = []
    for idx in range(act_count):
        p_start = idx * chunk_size
        p_end = len(paragraphs) if idx == act_count - 1 else min(len(paragraphs), (idx + 1) * chunk_size)
        if p_start >= len(paragraphs):
            break
        slice_paras = paragraphs[p_start:p_end]
        acts.append(
            {
                "heading": f"Act {idx + 1} (Paragraphs {p_start + 1}-{p_end})",
                "text": "\n\n".join(slice_paras),
                "paragraphRange": [p_start + 1, p_end],
            }
        )
    return acts


def cmd_suggest_props(args: argparse.Namespace) -> None:
    """Analyze script act breaks to recommend chapter-specific Reading Room prop swaps."""
    script_arg = args.script or args.script_pos
    if not script_arg:
        raise ValueError("Provide --script <path> (e.g., --script scripts/video_01_the_allowance.md).")

    script_path = Path(script_arg).resolve()
    if not script_path.exists():
        raise FileNotFoundError(f"Script file not found: {script_path}")

    raw_text = script_path.read_text(encoding="utf-8")
    wpm = max(80, int(args.wpm))
    acts = split_script_into_acts(raw_text, target_acts=max(2, int(args.acts)))

    cursor_sec = 0.0
    recommendations: list[dict[str, Any]] = []

    for i, act in enumerate(acts):
        words = act["text"].split()
        dur_sec = (len(words) / wpm) * 60.0
        theme = score_prop_theme(act["text"])
        shelf_str = ", ".join(theme["bookshelfProps"][:2])
        prompt = (
            f"Replace the background appliance on the right with a warm walnut wooden Reading Room "
            f"bookshelf holding {shelf_str}. Keep the speaker, desk, wall color, shadows, and "
            f"2700K key lighting identical."
        )
        recommendations.append(
            {
                "chapter": i + 1,
                "actLabel": act["heading"],
                "timeWindow": f"{format_mmss(cursor_sec)} - {format_mmss(cursor_sec + dur_sec)}",
                "startSec": round(cursor_sec, 1),
                "endSec": round(cursor_sec + dur_sec, 1),
                "wordCount": len(words),
                "themeId": theme["id"],
                "themeTitle": theme["title"],
                "recommendedLut": theme["lut"],
                "recommendedSwapBox": "0.55,0.0,0.45,1.0",
                "bookshelfProps": theme["bookshelfProps"],
                "deskProps": theme["deskProps"],
                "geminiPlatePrompt": prompt,
            }
        )
        cursor_sec += dur_sec

    payload = {
        "script": str(script_path),
        "estimatedDuration": format_mmss(cursor_sec),
        "wpm": wpm,
        "chapters": recommendations,
    }

    if args.out:
        out_json = Path(args.out).resolve()
        out_json.parent.mkdir(parents=True, exist_ok=True)
        out_json.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    if args.json:
        print(json.dumps(payload, indent=2))
        return

    print(f"=== Reading Room Chapter Prop Recommendations ({script_path.name}) ===")
    print(f"Estimated Runtime: {format_mmss(cursor_sec)} @ {wpm} WPM | Chapters: {len(recommendations)}\n")
    for rec in recommendations:
        print(f"[Chapter {rec['chapter']}] {rec['timeWindow']} — {rec['themeTitle']} ({rec['actLabel']})")
        print(f"  LUT & Swap Box : {rec['recommendedLut']}.cube | --swap-box {rec['recommendedSwapBox']}")
        print(f"  Bookshelf Props: {'; '.join(rec['bookshelfProps'])}")
        print(f"  Desk Accent    : {'; '.join(rec['deskProps'])}")
        print(f"  Plate Prompt   : --prompt \"{rec['geminiPlatePrompt']}\"\n")
    if args.out:
        print(f"Saved JSON prop manifest -> {Path(args.out).resolve()}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Background object-swap workflow for Yuza's studio A-roll (GTX 1650 safe)."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # 1. extract-plate
    p_extract = sub.add_parser(
        "extract-plate",
        help="Extract the sharpest frame from a video as a lossless PNG clean plate.",
    )
    p_extract.add_argument("input_video", help="Source A-roll video path.")
    p_extract.add_argument(
        "--out", default=None, help="Output PNG path (default: <stem>_clean_plate.png)."
    )
    p_extract.add_argument(
        "--samples",
        type=int,
        default=24,
        help="Number of frames to scan for sharpness (default: 24).",
    )
    p_extract.add_argument(
        "--start", type=float, default=0.0, help="Window start in seconds (default: 0)."
    )
    p_extract.add_argument(
        "--duration",
        type=float,
        default=None,
        help="Window duration in seconds (default: full video).",
    )
    p_extract.set_defaults(func=cmd_extract_plate)

    # 2. gemini-plate-edit
    p_plate = sub.add_parser(
        "gemini-plate-edit",
        help="Edit an extracted clean plate PNG using Gemini Nano Banana 2.1 or Gemini 3 Pro Image.",
    )
    p_plate.add_argument("input_plate", help="Clean plate PNG/JPG path.")
    p_plate.add_argument(
        "--prompt",
        default=None,
        help="Background swap instruction (default: replace fridge with walnut bookshelf).",
    )
    p_plate.add_argument(
        "--model",
        choices=["gemini-nano-banana-2.1", "gemini-3-pro-image", "gemini-3.1-flash-lite-image"],
        default="gemini-nano-banana-2.1",
        help="Gemini image editing model (default: gemini-nano-banana-2.1).",
    )
    p_plate.add_argument(
        "--aspect-ratio",
        default=None,
        help="Output aspect ratio (default: matched automatically from plate dimensions).",
    )
    p_plate.add_argument(
        "--image-size",
        choices=["1K", "2K", "4K"],
        default="2K",
        help="Gemini output size tier (default: 2K).",
    )
    p_plate.add_argument(
        "--ref-image",
        action="append",
        default=[],
        help="Optional style/object reference image path (can repeat).",
    )
    p_plate.add_argument(
        "--out",
        default=None,
        help="Output edited PNG path (default: <stem>_swapped.png).",
    )
    p_plate.add_argument(
        "--no-match-size",
        action="store_true",
        help="Keep model's raw pixel dimensions instead of resizing to match input plate.",
    )
    p_plate.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned Gemini Interactions API request without calling the API.",
    )
    p_plate.set_defaults(func=cmd_gemini_plate_edit)

    # 3. auto-person-mask
    p_mask = sub.add_parser(
        "auto-person-mask",
        help="Generate a temporally smoothed person matte MP4 across full-length tripod A-roll (and optionally composite over an edited plate).",
    )
    p_mask.add_argument("input_video", help="Source locked-off tripod A-roll video.")
    p_mask.add_argument(
        "--out-mask",
        default=None,
        help="Output grayscale matte MP4 path (default: <stem>_person_mask.mp4).",
    )
    p_mask.add_argument(
        "--composite-plate",
        default=None,
        help="Optional edited plate PNG (e.g. room_swapped.png) to composite behind the person in one pass.",
    )
    p_mask.add_argument(
        "--out",
        default=None,
        help="Output composited MP4 path when --composite-plate is used (default: <stem>_swapped.mp4).",
    )
    p_mask.add_argument(
        "--backend",
        choices=["auto", "mediapipe", "diff"],
        default="auto",
        help="Segmentation backend: mediapipe selfie segmenter, OpenCV diff, or auto (default: auto).",
    )
    p_mask.add_argument(
        "--model-path",
        default=str(DEFAULT_SEGMENTER_MODEL),
        help="Path to MediaPipe .tflite segmenter model (auto-downloaded if missing).",
    )
    p_mask.add_argument(
        "--ref-plate",
        default=None,
        help="Optional clean background plate PNG for diff backend reference.",
    )
    p_mask.add_argument(
        "--seg-width",
        type=int,
        default=512,
        help="Internal segmentation width in pixels for fast CPU inference (default: 512).",
    )
    p_mask.add_argument(
        "--threshold",
        type=float,
        default=0.45,
        help="Foreground confidence midpoint in [0, 1] (default: 0.45).",
    )
    p_mask.add_argument(
        "--softness",
        type=float,
        default=0.18,
        help="Smoothstep transition band around threshold (default: 0.18).",
    )
    p_mask.add_argument(
        "--temporal-smooth",
        type=float,
        default=0.65,
        help="Temporal EMA smoothing factor in [0, 0.95] (default: 0.65).",
    )
    p_mask.add_argument(
        "--feather",
        type=float,
        default=5.0,
        help="Spatial Gaussian feather sigma in pixels (default: 5.0).",
    )
    p_mask.add_argument(
        "--dilate",
        type=int,
        default=2,
        help="Foreground dilation radius in inference pixels to protect hair/edges (default: 2).",
    )
    p_mask.add_argument(
        "--swap-box",
        default=None,
        help="Optional x,y,w,h region (0..1 normalized or pixels) restricting background reveal to the swapped prop zone.",
    )
    p_mask.add_argument(
        "--invert",
        action="store_true",
        help="Write inverted matte (white = background, black = person).",
    )
    p_mask.set_defaults(func=cmd_auto_person_mask)

    # 4. composite-plate
    p_comp = sub.add_parser(
        "composite-plate",
        help="Composite an edited plate onto a locked-off tripod clip using a static black/white mask PNG.",
    )
    p_comp.add_argument("input_video", help="Source locked-off tripod video.")
    p_comp.add_argument("--plate", required=True, help="Edited clean plate PNG.")
    p_comp.add_argument(
        "--mask",
        required=True,
        help="Grayscale mask PNG (white = edited plate region, black = original video).",
    )
    p_comp.add_argument("--out", default=None, help="Output MP4 path.")
    p_comp.add_argument(
        "--feather",
        type=float,
        default=6.0,
        help="Gaussian blur radius in pixels for mask edge feathering (default: 6.0).",
    )
    p_comp.set_defaults(func=cmd_composite_plate)

    # 5. omni-edit (with omni-command alias)
    p_omni = sub.add_parser(
        "omni-edit",
        aliases=["omni-command"],
        help="Build or run a Gemini Omni 1.2 Flash video edit for 3-15s moving-camera clips.",
    )
    p_omni.add_argument("input_video", help="Source video path.")
    p_omni.add_argument("--prompt", default=None, help="Object-swap edit prompt.")
    p_omni.add_argument(
        "--ref-image",
        default=None,
        help="Optional edited plate or bookshelf reference PNG.",
    )
    p_omni.add_argument(
        "--start", type=float, default=0.0, help="Clip start time in seconds (default: 0)."
    )
    p_omni.add_argument(
        "--duration",
        type=int,
        default=10,
        help="Target clip duration in seconds, 3-15s (default: 10).",
    )
    p_omni.add_argument(
        "--resolution",
        choices=["360p", "720p", "1080p", "4k"],
        default="720p",
        help="Gemini Omni output resolution (default: 720p).",
    )
    p_omni.add_argument(
        "--aspect-ratio",
        choices=["16:9", "9:16"],
        default="16:9",
        help="Output aspect ratio (default: 16:9).",
    )
    p_omni.add_argument(
        "--strip-audio",
        action="store_true",
        help="Strip original audio before upload (otherwise Gemini Omni preserves it).",
    )
    p_omni.add_argument("--out", default=None, help="Output MP4 path.")
    p_omni.add_argument(
        "--run",
        action="store_true",
        help="Execute ffmpeg clip prep and Gemini Omni 1.2 Flash edit immediately.",
    )
    p_omni.set_defaults(func=cmd_omni_edit)

    # 6. export-person-matte
    p_alpha = sub.add_parser(
        "export-person-matte",
        help="Export a temporally smoothed RGBA alpha presenter video (.webm VP9 or ProRes 4444 .mov) for Depth Sandwich.",
    )
    p_alpha.add_argument("input_video", help="Source locked-off tripod A-roll video.")
    p_alpha.add_argument(
        "--out",
        default=None,
        help="Output alpha video path (default: aroll_person_alpha.webm or .mov).",
    )
    p_alpha.add_argument(
        "--codec",
        choices=["auto", "webm", "prores"],
        default="auto",
        help="Alpha codec: webm (VP9 yuva420p) or prores (ProRes 4444 yuva444p10le). Default: auto.",
    )
    p_alpha.add_argument(
        "--backend",
        choices=["auto", "mediapipe", "diff"],
        default="auto",
        help="Segmentation backend: mediapipe, diff, or auto (default: auto).",
    )
    p_alpha.add_argument(
        "--model-path",
        default=str(DEFAULT_SEGMENTER_MODEL),
        help="Path to MediaPipe selfie_segmenter.tflite (git-ignored, auto-downloaded if missing).",
    )
    p_alpha.add_argument(
        "--ref-plate",
        default=None,
        help="Optional clean background plate PNG for diff fallback.",
    )
    p_alpha.add_argument(
        "--seg-width",
        type=int,
        default=512,
        help="Internal segmentation width in pixels (default: 512).",
    )
    p_alpha.add_argument(
        "--threshold",
        type=float,
        default=0.45,
        help="Foreground confidence midpoint in [0, 1] (default: 0.45).",
    )
    p_alpha.add_argument(
        "--softness",
        type=float,
        default=0.18,
        help="Smoothstep transition band around threshold (default: 0.18).",
    )
    p_alpha.add_argument(
        "--temporal-smooth",
        type=float,
        default=0.68,
        help="Temporal EMA smoothing factor in [0, 0.95] (default: 0.68).",
    )
    p_alpha.add_argument(
        "--feather",
        type=float,
        default=3.5,
        help="Spatial Gaussian edge feather sigma in pixels (default: 3.5).",
    )
    p_alpha.add_argument(
        "--dilate",
        type=int,
        default=2,
        help="Foreground dilation radius in inference pixels (default: 2).",
    )
    p_alpha.add_argument(
        "--despill",
        type=float,
        default=0.15,
        help="Edge halo attenuation factor in [0, 0.5] (default: 0.15).",
    )
    p_alpha.add_argument(
        "--start",
        type=float,
        default=0.0,
        help="Optional start offset in seconds (default: 0.0).",
    )
    p_alpha.add_argument(
        "--duration",
        type=float,
        default=None,
        help="Optional duration cap in seconds (default: full video).",
    )
    p_alpha.add_argument(
        "--keep-audio",
        action="store_true",
        help="Include source audio stream (default: muted so V3 presenter track never double-plays A1).",
    )
    p_alpha.add_argument(
        "--dry-run",
        action="store_true",
        help="Print FFmpeg alpha encoding pipeline without running segmentation.",
    )
    p_alpha.set_defaults(func=cmd_export_person_matte)

    # 7. suggest-props
    p_props = sub.add_parser(
        "suggest-props",
        help="Analyze script act breaks to recommend chapter-specific Reading Room bookshelf/desk prop swaps.",
    )
    p_props.add_argument(
        "script_pos",
        nargs="?",
        default=None,
        help="Optional positional path to spoken script (.md / .txt).",
    )
    p_props.add_argument(
        "--script",
        default=None,
        help="Path to spoken script (.md / .txt).",
    )
    p_props.add_argument(
        "--acts",
        type=int,
        default=6,
        help="Target chapter count when script has no markdown headings (default: 6).",
    )
    p_props.add_argument(
        "--wpm",
        type=int,
        default=150,
        help="Estimated speaking rate in words per minute (default: 150).",
    )
    p_props.add_argument(
        "--out",
        default=None,
        help="Optional output JSON manifest path.",
    )
    p_props.add_argument(
        "--json",
        action="store_true",
        help="Print raw JSON output to stdout.",
    )
    p_props.set_defaults(func=cmd_suggest_props)

    args = parser.parse_args()
    try:
        args.func(args)
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
