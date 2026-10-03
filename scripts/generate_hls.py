import os
import subprocess
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
print("Using ffmpeg:", ffmpeg)

PROJECTS = [
    {
        "id": "es-no-amar",
        "input": "raw_videos/VID_20260725_121258_440.mp4",
        "scale": "scale=w=1080:h=1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2",
        "bitrate": "2000k",
        "maxrate": "2400k",
    },
    {
        "id": "empiccc-flow-fest",
        "input": "raw_videos/empiccc-flow-fest.mp4",
        "scale": "scale=w=1920:h=1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2",
        "bitrate": "2200k",
        "maxrate": "2600k",
    },
    {
        "id": "llibo-la-melanina",
        "input": "raw_videos/llibo-la-melanina.mp4",
        "scale": "scale=w=1080:h=1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2",
        "bitrate": "2000k",
        "maxrate": "2400k",
    },
]

base_dir = os.path.abspath(".")

for p in PROJECTS:
    pid = p["id"]
    inp = os.path.join(base_dir, p["input"])
    scale = p["scale"]
    b_rate = p["bitrate"]
    max_rate = p["maxrate"]
    out_dir = os.path.join(base_dir, "public", "videos", "hls", pid)
    
    # Clean previous files in directory
    if os.path.exists(out_dir):
        for f in os.listdir(out_dir):
            try:
                os.remove(os.path.join(out_dir, f))
            except Exception:
                pass
    os.makedirs(out_dir, exist_ok=True)

    print(f"\n==========================================")
    print(f"Generating fMP4 HLS for: {pid}")
    print(f"==========================================")

    cmd = [
        ffmpeg, "-y",
        "-i", inp,
        "-vf", f"{scale},fps=30",
        "-c:v", "libx264",
        "-preset", "fast",
        "-profile:v", "high",
        "-level", "4.1",
        "-b:v", b_rate,
        "-maxrate", max_rate,
        "-bufsize", "3500k",
        "-g", "60",
        "-keyint_min", "60",
        "-sc_threshold", "0",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "160k",
        "-ar", "44100",
        "-ac", "2",
        "-hls_time", "2",
        "-hls_playlist_type", "vod",
        "-hls_segment_type", "fmp4",
        "-hls_fmp4_init_filename", "init.mp4",
        "-hls_segment_filename", "seg_%03d.m4s",
        "index.m3u8"
    ]
    subprocess.run(cmd, cwd=out_dir, check=True)
    print(f"[{pid}] index.m3u8 (fMP4) generated successfully with init.mp4 in {out_dir}!")

# Remove leftover root init.mp4 if present
if os.path.exists("init.mp4"):
    os.remove("init.mp4")

print("\nALL fMP4 HLS STREAMS GENERATED SUCCESSFULLY!")
