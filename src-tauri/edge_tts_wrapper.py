#!/usr/bin/env python3
"""Edge TTS wrapper — handles long text chunking, TTS, and MP3 concatenation with volume boost."""
import argparse
import sys
import os
import tempfile
import shutil
from edge_tts import Communicate
import asyncio

def split_text(text: str, chunk_size: int = 2500) -> list[str]:
    """Split text into chunks, breaking at sentence boundaries when possible."""
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end < len(text):
            for sep in ['。', '！', '？', '，', '. ', '! ', '? ', ', ']:
                last_sep = text.rfind(sep, start, end)
                if last_sep > start:
                    end = last_sep + 1
                    break
        chunks.append(text[start:end])
        start = end
    return chunks

def main():
    parser = argparse.ArgumentParser(description='Edge TTS')
    parser.add_argument('--text', required=True)
    parser.add_argument('--voice', required=True)
    parser.add_argument('--rate', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--chunksize', type=int, default=2500)
    args = parser.parse_args()

    text = args.text.strip()
    if not text:
        print("ERROR: empty text", file=sys.stderr)
        sys.exit(1)

    try:
        chunks = split_text(text, args.chunksize)

        # Generate temp files for all chunks
        with tempfile.TemporaryDirectory() as tmpdir:
            temp_files = []
            for i, chunk in enumerate(chunks):
                temp_path = os.path.join(tmpdir, f"chunk_{i:03d}.mp3")
                asyncio.run(Communicate(text=chunk, voice=args.voice, rate=args.rate).save(temp_path))
                temp_files.append(temp_path)

            try:
                from pydub import AudioSegment
                combined = AudioSegment.empty()
                for f in temp_files:
                    combined += AudioSegment.from_mp3(f)

                combined.export(args.output, format="mp3")
            except ImportError:
                # pydub not available: use ffmpeg directly
                import subprocess
                subprocess.run([
                    "ffmpeg", "-y", "-i", temp_files[0],
                    args.output
                ], check=True, capture_output=True)

        print(args.output)

    except Exception as e:
        print(f"ERROR:{e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
