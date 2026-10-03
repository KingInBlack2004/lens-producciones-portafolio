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

base_dir = os.path.abspath(".")

for p in PROJECTS:
    pid = p["id"]
    inp = os.path.join(base_dir, p["input"])
    is_vert = p["is_vertical"]
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
    print(f"Generating Ultra-Fluid TS Streams for: {pid}")
    print(f"==========================================")

    # Force square pixels (setsar=1) and exact standard dimensions
    if is_vert:
        scale_1080 = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1"
        scale_720 = "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1"
    else:
        scale_1080 = "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1"
        scale_720 = "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1"

    # 1. 1080p Stream (for PC / Desktop / Tablets)
    print(f"[{pid}] Encoding 1080p desktop stream (MPEG-TS)...")
    cmd_1080 = [
        ffmpeg, "-y",
        "-i", inp,
        "-vf", scale_1080,
        "-r", "30",
        "-c:v", "libx264",
        "-preset", "fast",
        "-profile:v", "high",
        "-level", "4.1",
        "-b:v", "2200k",
        "-maxrate", "2600k",
        "-bufsize", "4000k",
        "-g", "60",
        "-keyint_min", "60",
        "-sc_threshold", "0",
        "-pix_fmt", "yuv420p",
        "-color_range", "tv",
        "-colorspace", "bt709",
        "-color_trc", "bt709",
        "-color_primaries", "bt709",
        "-af", "aresample=async=1",
        "-c:a", "aac",
        "-b:a", "160k",
        "-ar", "48000",
        "-ac", "2",
        "-avoid_negative_ts", "make_zero",
        "-hls_time", "2",
        "-hls_playlist_type", "vod",
        "-hls_segment_filename", "seg_1080p_%03d.ts",
        "1080p.m3u8"
    ]
    subprocess.run(cmd_1080, cwd=out_dir, check=True)

    # 2. 720p HLS Stream (Main profile, level 3.1, 0 B-frames, 2s MPEG-TS segments)
    print(f"[{pid}] Encoding 720p mobile stream (MPEG-TS)...")
    cmd_720 = [
        ffmpeg, "-y",
        "-i", inp,
        "-vf", scale_720,
        "-r", "30",
        "-c:v", "libx264",
        "-preset", "fast",
        "-profile:v", "main",
        "-level", "3.1",
        "-bf", "0",
        "-b:v", "1100k",
        "-maxrate", "1400k",
        "-bufsize", "2000k",
        "-g", "60",
        "-keyint_min", "60",
        "-sc_threshold", "0",
        "-pix_fmt", "yuv420p",
        "-color_range", "tv",
        "-colorspace", "bt709",
        "-color_trc", "bt709",
        "-color_primaries", "bt709",
        "-af", "aresample=async=1",
        "-c:a", "aac",
        "-b:a", "128k",
        "-ar", "48000",
        "-ac", "2",
        "-avoid_negative_ts", "make_zero",
        "-hls_time", "2",
        "-hls_playlist_type", "vod",
        "-hls_segment_filename", "seg_720p_%03d.ts",
        "720p.m3u8"
    ]
    subprocess.run(cmd_720, cwd=out_dir, check=True)

    # 3. Direct FastStart MP4 (Main profile, level 3.1, 0 B-frames, SAR 1:1, bt709 color tags)
    print(f"[{pid}] Encoding mobile.mp4 direct hardware stream...")
    cmd_mobile = [
        ffmpeg, "-y",
        "-i", inp,
        "-vf", scale_720,
        "-r", "30",
        "-c:v", "libx264",
        "-preset", "fast",
        "-profile:v", "main",
        "-level", "3.1",
        "-bf", "0",
        "-b:v", "1100k",
        "-maxrate", "1400k",
        "-bufsize", "2000k",
        "-g", "60",
        "-keyint_min", "60",
        "-sc_threshold", "0",
        "-pix_fmt", "yuv420p",
        "-color_range", "tv",
        "-colorspace", "bt709",
        "-color_trc", "bt709",
        "-color_primaries", "bt709",
        "-af", "aresample=async=1",
        "-c:a", "aac",
        "-b:a", "128k",
        "-ar", "48000",
        "-ac", "2",
        "-avoid_negative_ts", "make_zero",
        "-movflags", "+faststart",
        os.path.join(out_dir, "mobile.mp4")
    ]
    subprocess.run(cmd_mobile, check=True)

    # 4. Master playlist (index.m3u8) with accurate CODECS descriptors
    res_720 = "720x1280" if is_vert else "1280x720"
    res_1080 = "1080x1920" if is_vert else "1920x1080"
    master_content = f"""#EXTM3U
#EXT-X-VERSION:3
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-STREAM-INF:BANDWIDTH=1400000,AVERAGE-BANDWIDTH=1200000,RESOLUTION={res_720},CODECS="avc1.4d401f,mp4a.40.2",NAME="720p"
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2600000,AVERAGE-BANDWIDTH=2300000,RESOLUTION={res_1080},CODECS="avc1.640029,mp4a.40.2",NAME="1080p"
1080p.m3u8
"""
    with open(os.path.join(out_dir, "index.m3u8"), "w", encoding="utf-8") as mf:
        mf.write(master_content)

    print(f"[{pid}] 1080p, 720p (TS), mobile.mp4, and index.m3u8 created in {out_dir}!")

print("\nALL STREAMS GENERATED SUCCESSFULLY!")
