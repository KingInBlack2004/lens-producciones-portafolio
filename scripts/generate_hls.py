import os
import subprocess
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
print("Using ffmpeg:", ffmpeg)

PROJECTS = [
    {
        "id": "es-no-amar",
        "input": "raw_videos/VID_20260725_121258_440.mp4",
        "is_vertical": True,
    },
    {
        "id": "empiccc-flow-fest",
        "input": "raw_videos/empiccc-flow-fest.mp4",
        "is_vertical": False,
    },
    {
        "id": "llibo-la-melanina",
        "input": "raw_videos/llibo-la-melanina.mp4",
        "is_vertical": True,
    },
]

for p in PROJECTS:
    pid = p["id"]
    inp = p["input"]
    is_vert = p["is_vertical"]
    out_dir = os.path.join("public", "videos", "hls", pid)
    os.makedirs(out_dir, exist_ok=True)

    print(f"\n==========================================")
    print(f"Processing HLS for: {pid}")
    print(f"==========================================")

    # Resolution scaling filters guaranteeing even dimensions
    if is_vert:
        scale_1080 = "scale=w=1080:h=-2,pad=ceil(iw/2)*2:ceil(ih/2)*2"
        scale_720 = "scale=w=720:h=-2,pad=ceil(iw/2)*2:ceil(ih/2)*2"
        res_1080_str = "1080x1920"
        res_720_str = "720x1280"
    else:
        scale_1080 = "scale=w=-2:h=1080,pad=ceil(iw/2)*2:ceil(ih/2)*2"
        scale_720 = "scale=w=-2:h=720,pad=ceil(iw/2)*2:ceil(ih/2)*2"
        res_1080_str = "1920x1080"
        res_720_str = "1280x720"

    # 1. Generate 1080p HLS
    print(f"[{pid}] Encoding 1080p variant...")
    cmd_1080 = [
        ffmpeg, "-y",
        "-i", inp,
        "-vf", f"{scale_1080},fps=30",
        "-c:v", "libx264",
        "-preset", "fast",
        "-profile:v", "high",
        "-level", "4.1",
        "-b:v", "2200k",
        "-maxrate", "2500k",
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
        "-hls_segment_filename", os.path.join(out_dir, "1080p_%03d.ts"),
        os.path.join(out_dir, "1080p.m3u8")
    ]
    subprocess.run(cmd_1080, check=True)

    # 2. Generate 720p HLS
    print(f"[{pid}] Encoding 720p variant...")
    cmd_720 = [
        ffmpeg, "-y",
        "-i", inp,
        "-vf", f"{scale_720},fps=30",
        "-c:v", "libx264",
        "-preset", "fast",
        "-profile:v", "main",
        "-level", "3.1",
        "-b:v", "1100k",
        "-maxrate", "1400k",
        "-bufsize", "2000k",
        "-g", "60",
        "-keyint_min", "60",
        "-sc_threshold", "0",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "128k",
        "-ar", "44100",
        "-ac", "2",
        "-hls_time", "2",
        "-hls_playlist_type", "vod",
        "-hls_segment_filename", os.path.join(out_dir, "720p_%03d.ts"),
        os.path.join(out_dir, "720p.m3u8")
    ]
    subprocess.run(cmd_720, check=True)

    # 3. Create master.m3u8
    master_path = os.path.join(out_dir, "master.m3u8")
    master_content = (
        "#EXTM3U\n"
        "#EXT-X-VERSION:3\n"
        f'#EXT-X-STREAM-INF:BANDWIDTH=2660000,RESOLUTION={res_1080_str},FRAME-RATE=30.000,NAME="1080p"\n'
        "1080p.m3u8\n"
        f'#EXT-X-STREAM-INF:BANDWIDTH=1228000,RESOLUTION={res_720_str},FRAME-RATE=30.000,NAME="720p"\n'
        "720p.m3u8\n"
    )
    with open(master_path, "w", encoding="utf-8") as f:
        f.write(master_content)

    print(f"[{pid}] master.m3u8 created successfully!")

print("\nALL HLS STREAMS GENERATED SUCCESSFULLY!")
