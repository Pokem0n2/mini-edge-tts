#!/usr/bin/env python3
"""
Mini Edge TTS - Python script for generating TTS audio.
This script is bundled with the Tauri app and called via subprocess.
"""
import sys
import asyncio
import argparse
import os


async def generate_tts(text: str, voice: str, rate: str, output: str):
    """Generate TTS audio using edge-tts."""
    try:
        import edge_tts
    except ImportError:
        print("ERROR: edge_tts not installed. Run: pip install edge-tts", file=sys.stderr)
        sys.exit(1)

    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(output)
    print(f"SUCCESS: {output}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description="Mini Edge TTS")
    parser.add_argument("--text", required=True, help="Text to convert")
    parser.add_argument("--voice", required=True, help="Voice name")
    parser.add_argument("--rate", default="+0%", help="Rate string (e.g. +10%, -20%)")
    parser.add_argument("--output", required=True, help="Output MP3 path")
    args = parser.parse_args()

    asyncio.run(generate_tts(args.text, args.voice, args.rate, args.output))


if __name__ == "__main__":
    main()
