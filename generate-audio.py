# ═══════════════════════════════════════════════════════════
# THERAPY VOICE GUIDE — FULLY LOCAL AUDIO GENERATION
#
# No cloud APIs, no keys, no monthly cost. Models download once
# (from public open-source releases) and everything afterwards
# runs offline on this machine.
#
#   English → Kokoro (open-weights, warm female voice "af_heart")
#   Telugu  → AI4Bharat Indic Parler-TTS (best open Telugu voice)
#
# Reads the narration text from narration/scripts.json and writes
# MP3s exactly where the website's player looks for them:
#
#     audio/en/<therapy>.mp3
#     audio/te/<therapy>.mp3
#
# ── Setup (once) ───────────────────────────────────────────
#     py -3.12 -m venv "$env:LOCALAPPDATA\SushrutaTTS\venv"
#     & "$env:LOCALAPPDATA\SushrutaTTS\venv\Scripts\pip" install -r requirements-tts.txt
#
# ── Generate ───────────────────────────────────────────────
#     & "$env:LOCALAPPDATA\SushrutaTTS\venv\Scripts\python" generate-audio.py            # everything
#     & "$env:LOCALAPPDATA\SushrutaTTS\venv\Scripts\python" generate-audio.py en         # English only
#     & "$env:LOCALAPPDATA\SushrutaTTS\venv\Scripts\python" generate-audio.py te potli   # one Telugu file
#
# The "…" marks in the scripts become real breathing pauses;
# paragraph breaks become longer rests. That pacing is a large
# part of what makes the result sound like a person, not a TTS.
# ═══════════════════════════════════════════════════════════
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf

# Windows consoles often default to cp1252, which can't print ✓/✗
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

# Use the Windows certificate store for TLS. Without this, model
# downloads can fail with CERTIFICATE_VERIFY_FAILED when antivirus
# or a proxy inspects HTTPS traffic.
try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

ROOT = Path(__file__).resolve().parent
SCRIPTS_FILE = ROOT / "narration" / "scripts.json"
AUDIO_DIR = ROOT / "audio"
MODELS_DIR = Path(os.environ.get("LOCALAPPDATA", ROOT)) / "SushrutaTTS" / "models"

# ── Voice configuration ─────────────────────────────────────
# English (Kokoro): af_heart is the warmest female voice; also
# try af_bella or af_nicole. speed < 1.0 = calmer, slower.
KOKORO_VOICE = "af_heart"
KOKORO_SPEED = 0.88

# Telugu (Indic Parler-TTS): the voice is *described* in words.
# Tweak freely — keep "calm / warm / slow / female" for the
# therapist character. A fixed seed keeps the same voice across
# all six files.
PARLER_MODEL = "ai4bharat/indic-parler-tts"
PARLER_DESCRIPTION = (
    "Anjali speaks in a warm, calm and soothing female voice, "
    "at a slow, unhurried pace, with a gentle and reassuring tone. "
    "Very clear audio with no background noise."
)
PARLER_SEED = 42

PAUSE_SHORT = 0.40   # seconds of silence for "…" inside a paragraph
PAUSE_LONG = 0.70    # seconds of silence between paragraphs
MP3_SAMPLERATE_NOTE = "MP3 written via soundfile (bundled libsndfile)"

# Kokoro open-weights model files (public GitHub release, ~340 MB once)
KOKORO_FILES = {
    "kokoro-v1.0.onnx":
        "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx",
    "voices-v1.0.bin":
        "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin",
}


def log(*args):
    print(*args, flush=True)


def silence(seconds, sr):
    return np.zeros(int(seconds * sr), dtype=np.float32)


def split_script(text):
    """-> list of paragraphs, each a list of '…'-separated phrases."""
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    return [[s.strip() for s in re.split(r"…|\.\.\.", p) if s.strip()]
            for p in paragraphs]


def assemble(chunks_per_paragraph, sr):
    """Join phrase audio with breathing pauses; returns one array."""
    parts = []
    for pi, phrases in enumerate(chunks_per_paragraph):
        if pi > 0:
            parts.append(silence(PAUSE_LONG, sr))
        for si, wav in enumerate(phrases):
            if si > 0:
                parts.append(silence(PAUSE_SHORT, sr))
            parts.append(wav)
    return np.concatenate(parts) if parts else silence(0.1, sr)


def write_mp3(path, wav, sr):
    path.parent.mkdir(parents=True, exist_ok=True)
    peak = float(np.max(np.abs(wav))) or 1.0
    wav = (wav / peak) * 0.92          # simple, consistent loudness
    sf.write(str(path), wav, sr, format="MP3")
    kb = path.stat().st_size // 1024
    log(f"  ✓ {path.relative_to(ROOT)}  ({kb} KB, {len(wav)/sr:.0f}s)")


# ── English engine: Kokoro ──────────────────────────────────
def download_kokoro_models():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    for name, url in KOKORO_FILES.items():
        dest = MODELS_DIR / name
        if dest.exists() and dest.stat().st_size > 0:
            continue
        log(f"  downloading {name} (one-time)…")
        tmp = dest.with_suffix(dest.suffix + ".part")
        urllib.request.urlretrieve(url, tmp)
        tmp.replace(dest)


def make_english(jobs):
    from kokoro_onnx import Kokoro

    download_kokoro_models()
    log(f"  loading Kokoro (voice: {KOKORO_VOICE}, speed: {KOKORO_SPEED})")
    kokoro = Kokoro(str(MODELS_DIR / "kokoro-v1.0.onnx"),
                    str(MODELS_DIR / "voices-v1.0.bin"))

    for therapy, text in jobs:
        log(f"• {therapy} (en)")
        rendered, sr = [], 24000
        for phrases in split_script(text):
            row = []
            for phrase in phrases:
                samples, sr = kokoro.create(
                    phrase, voice=KOKORO_VOICE, speed=KOKORO_SPEED, lang="en-us")
                row.append(samples.astype(np.float32))
            rendered.append(row)
        write_mp3(AUDIO_DIR / "en" / f"{therapy}.mp3", assemble(rendered, sr), sr)


# ── Telugu engines ──────────────────────────────────────────
# Preferred: AI4Bharat Indic Parler-TTS (best open Telugu voice).
# It is a *gated* Hugging Face repo — free, but you must accept
# the license once at https://huggingface.co/ai4bharat/indic-parler-tts
# and log in (huggingface-cli login). Until then, we fall back to
# facebook/mms-tts-tel, which is open and needs no account.
MMS_MODEL = "facebook/mms-tts-tel"
MMS_SPEAKING_RATE = 0.92   # < 1.0 = slower, calmer


def make_telugu(jobs):
    try:
        _telugu_parler(jobs)
    except Exception as e:
        msg = str(e).lower()
        if "gated" in msg or "401" in msg or "restricted" in msg:
            log("  Indic Parler-TTS is gated (needs a one-time free Hugging Face")
            log("  license acceptance + login). Falling back to " + MMS_MODEL + ".")
            _telugu_mms(jobs)
        else:
            raise


def _telugu_mms(jobs):
    import torch
    from transformers import AutoTokenizer, VitsModel

    log(f"  loading {MMS_MODEL} (first run downloads ~150 MB)…")
    model = VitsModel.from_pretrained(MMS_MODEL)
    tokenizer = AutoTokenizer.from_pretrained(MMS_MODEL)
    model.speaking_rate = MMS_SPEAKING_RATE
    sr = model.config.sampling_rate

    for therapy, text in jobs:
        log(f"• {therapy} (te)")
        rendered = []
        for phrases in split_script(text):
            row = []
            for phrase in phrases:
                torch.manual_seed(PARLER_SEED)  # keep delivery consistent
                inputs = tokenizer(phrase, return_tensors="pt")
                with torch.no_grad():
                    wav = model(**inputs).waveform
                row.append(wav.squeeze().cpu().numpy().astype(np.float32))
            rendered.append(row)
        write_mp3(AUDIO_DIR / "te" / f"{therapy}.mp3", assemble(rendered, sr), sr)


def _telugu_parler(jobs):
    import torch
    from parler_tts import ParlerTTSForConditionalGeneration
    from transformers import AutoTokenizer

    log(f"  loading {PARLER_MODEL} (first run downloads the model)…")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = ParlerTTSForConditionalGeneration.from_pretrained(PARLER_MODEL).to(device)
    tokenizer = AutoTokenizer.from_pretrained(PARLER_MODEL)
    desc_tokenizer = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
    sr = model.config.sampling_rate

    desc_ids = desc_tokenizer(PARLER_DESCRIPTION, return_tensors="pt").to(device)

    for therapy, text in jobs:
        log(f"• {therapy} (te)  [CPU generation is slow — please wait]")
        rendered = []
        for phrases in split_script(text):
            row = []
            for phrase in phrases:
                torch.manual_seed(PARLER_SEED)  # same voice in every chunk/file
                prompt_ids = tokenizer(phrase, return_tensors="pt").to(device)
                with torch.no_grad():
                    generation = model.generate(
                        input_ids=desc_ids.input_ids,
                        attention_mask=desc_ids.attention_mask,
                        prompt_input_ids=prompt_ids.input_ids,
                        prompt_attention_mask=prompt_ids.attention_mask,
                    )
                row.append(generation.cpu().numpy().squeeze().astype(np.float32))
            rendered.append(row)
        write_mp3(AUDIO_DIR / "te" / f"{therapy}.mp3", assemble(rendered, sr), sr)


# ── Main ────────────────────────────────────────────────────
def main():
    scripts = json.loads(SCRIPTS_FILE.read_text(encoding="utf-8"))

    args = [a.lower() for a in sys.argv[1:]]
    langs = [l for l in ("en", "te") if not args or l in args or
             not any(a in ("en", "te") for a in args)]
    wanted = [a for a in args if a not in ("en", "te")]
    therapies = [t for t in scripts if not wanted or t in wanted]

    if wanted and not therapies:
        log("Unknown therapy. Available:", ", ".join(scripts))
        sys.exit(1)

    log(f"Generating: {', '.join(therapies)}  |  languages: {', '.join(langs)}\n")

    failures = []
    if "en" in langs:
        try:
            make_english([(t, scripts[t]["en"]) for t in therapies])
        except Exception as e:
            failures.append(f"English: {e}")
            log(f"  ✗ English engine failed: {e}")
    if "te" in langs:
        try:
            make_telugu([(t, scripts[t]["te"]) for t in therapies])
        except Exception as e:
            failures.append(f"Telugu: {e}")
            log(f"  ✗ Telugu engine failed: {e}")

    if failures:
        log("\nFinished with errors — see above. The website plays whatever "
            "files exist; missing ones show the 'audio file missing' notice.")
        sys.exit(1)
    log("\nAll done. Open the website and press “Listen to Therapy”.")


if __name__ == "__main__":
    main()
