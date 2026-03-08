# generate_instagram.py
# Tuned for a single 40 GB GPU (e.g. A100-40, A6000, RTX 6000 Ada)
import subprocess
import sys
import os
import shutil
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def find_torchrun():
    torchrun = shutil.which("torchrun")
    if torchrun:
        return torchrun
    candidate = os.path.join(os.path.dirname(sys.executable), "torchrun")
    if os.path.isfile(candidate):
        return candidate
    raise FileNotFoundError(
        "torchrun not found. Make sure PyTorch is installed and the venv is activated."
    )


def generate_instagram_video(
    prompt: str,
    output_name: str = None,
    # ── 480p + SR is the sweet spot for 40 GB:
    #    480p base inference (~18 GB peak) + SR upscale → effective ~960p quality
    #    720p base alone needs ~38 GB, leaving no headroom for SR
    resolution: str = "480p",
    aspect_ratio: str = "9:16",
    seed: int = 42,
    num_frames: int = 49,  # Vid Length
    sr: bool = False,
    rewrite: bool = False,
    cfg_distilled: bool = False,
    # ── offloading: always True on 40 GB ─────────────────────────────────
    offloading: bool = True,
    group_offloading: bool = True,
    # overlap=False: prevents VRAM spikes from prefetching next layer while
    # current layer is still live. Slower inference but safe on 40 GB.
    overlap_group_offloading: bool = False,
    # ── cache: deepcache is stable with group offloading ──────────────────
    # taylorcache hooks into layer internals; those layers may already be
    # offloaded to CPU when the hook fires → OOM spike or runtime error.
    # deepcache skips entire transformer blocks cleanly with no such issue.
    enable_cache: bool = True,
    cache_type: str = "deepcache",
    cache_start_step: int = 11,
    cache_end_step: int = 45,
    total_steps: int = 50,
    cache_step_interval: int = 4,
    num_inference_steps: int = 25, # edit this one
    dtype: str = "bf16",
    save_pre_sr_video: bool = False,
):
    if output_name is None:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_name = os.path.join(SCRIPT_DIR, "outputs", f"instagram_{ts}.mp4")
    os.makedirs(os.path.dirname(output_name), exist_ok=True)

    model_path      = os.path.join(SCRIPT_DIR, "ckpts")
    generate_script = os.path.join(SCRIPT_DIR, "generate.py")

    if not os.path.isdir(model_path):
        raise FileNotFoundError(f"Model directory not found: {model_path}")
    if not os.path.isfile(generate_script):
        raise FileNotFoundError(f"generate.py not found at: {generate_script}")

    torchrun = find_torchrun()

    def b(val: bool) -> str:
        return "true" if val else "false"

    cmd = [
        torchrun, "--nproc_per_node=1",
        generate_script,
        "--prompt",                   prompt,
        "--resolution",               resolution,
        "--model_path",               model_path,
        "--aspect_ratio",             aspect_ratio,
        "--video_length",             str(num_frames),
        "--seed",                     str(seed),
        "--output_path",              output_name,
        "--save_generation_config",   "true",
        "--sr",                       b(sr),
        "--save_pre_sr_video",        b(save_pre_sr_video),
        "--rewrite",                  b(rewrite),
        "--cfg_distilled",            b(cfg_distilled),
        "--dtype",                    dtype,
        "--num_inference_steps",      str(num_inference_steps),
        "--offloading",               b(offloading),
        "--group_offloading",         b(group_offloading),
        "--overlap_group_offloading", b(overlap_group_offloading),
        "--enable_cache",             b(enable_cache),
        "--cache_type",               cache_type,
        "--cache_start_step",         str(cache_start_step),
        "--cache_end_step",           str(cache_end_step),
        "--total_steps",              str(total_steps),
        "--cache_step_interval",      str(cache_step_interval),
    ]

    effective_res = "~960p" if (sr and resolution == "480p") else resolution
    print(f"\n🎬  Prompt          : {prompt}")
    print(f"📐  Base resolution : {resolution}  →  effective output: {effective_res}")
    print(f"🎞️   Frames          : {num_frames}  |  steps: {num_inference_steps}")
    print(f"💾  offload={offloading}  group_offload={group_offloading}  overlap={overlap_group_offloading}")
    print(f"⚡  cache={enable_cache} ({cache_type})  SR={sr}")
    print(f"📄  Output          : {output_name}")
    print(f"\n⏳  Running inference...\n{'─'*60}\n")

    subprocess.run(cmd, check=True, cwd=SCRIPT_DIR)

    print(f"\n{'─'*60}")
    print(f"✅  Saved to: {output_name}")
    return output_name


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Generate an Instagram Reel with HunyuanVideo-1.5 (40 GB GPU profile)"
    )
    parser.add_argument("prompt", nargs="?",
                        default="A sunset over the ocean, cinematic, golden hour")
    parser.add_argument("--output",       default=None)
    parser.add_argument("--resolution",   default="480p", choices=["480p", "720p"],
                        help="480p recommended for 40 GB GPU. 720p will OOM with SR enabled.")
    parser.add_argument("--aspect_ratio", default="9:16")
    parser.add_argument("--seed",         type=int, default=42)
    parser.add_argument("--frames", type=int, default=49)
    parser.add_argument("--steps",  type=int, default=25)
    parser.add_argument("--no_sr",  action="store_true", default=True,
                        help="Disable super-resolution (saves ~8 GB peak VRAM)")
    parser.add_argument("--no_cache",     action="store_true",
                        help="Disable deepcache (slower but max quality)")
    parser.add_argument("--cache_type",   default="deepcache",
                        choices=["deepcache", "teacache"],
                        help="taylorcache conflicts with group offloading on 40 GB GPUs")
    parser.add_argument("--overlap_offload", action="store_true",
                        help="Enable overlap group offloading (faster but higher VRAM peak)")

    args = parser.parse_args()

    generate_instagram_video(
        prompt=args.prompt,
        output_name=args.output,
        resolution=args.resolution,
        aspect_ratio=args.aspect_ratio,
        seed=args.seed,
        num_frames=args.frames,
        num_inference_steps=args.steps,
        sr=not args.no_sr,
        enable_cache=not args.no_cache,
        cache_type=args.cache_type,
        overlap_group_offloading=args.overlap_offload,
    )