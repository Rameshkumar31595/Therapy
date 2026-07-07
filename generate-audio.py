# ═══════════════════════════════════════════════════════════
# THERAPY VOICE GUIDE — AUDIO GENERATION
#
# No keys, no accounts, no monthly cost.
#
#   English → Kokoro (open-weights, warm female voice "af_heart",
#             fully offline after a one-time model download)
#   Telugu  → Microsoft Azure Neural voice te-IN-ShrutiNeural via
#             edge-tts (free, no API key; needs internet while
#             generating). Native Telugu female voice with natural
#             prosody — far beyond any open offline Telugu model.
#             Offline fallbacks (Indic Parler-TTS / MMS) remain
#             below but are only used if the network is down.
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

# English (Azure Neural via edge-tts): en-US-AriaNeural is an exceptionally
# warm, empathetic, and natural voice. We use a slow rate for a soothing tone,
# and phonetic replacements to ensure Ayurvedic terms are pronounced perfectly.
EDGE_VOICE_EN = "en-US-AriaNeural"
EDGE_RATE_EN = "-14%"
EDGE_PITCH_EN = "-4Hz"

# English fallback (Kokoro)
KOKORO_VOICE = "af_heart"
KOKORO_SPEED = 0.88

# Telugu (Azure Neural via edge-tts): te-IN-ShrutiNeural is the
# native Telugu female neural voice. The settings below are the
# "premium wellness consultant" recipe — sample 3 of the
# confident-delivery audition in audio/te-samples: mature depth,
# moderate deliberate pacing, firm sentence endings, strong vocal
# presence, and just a trace of warmth (calm and assured, never
# breathy or announcement-like).
EDGE_VOICE = "te-IN-ShrutiNeural"
EDGE_RATE = "-10%"     # moderate, deliberate — confident, not rushed
EDGE_PITCH = "-4Hz"    # slightly deeper = mature, trustworthy

TE_PARA_PAUSE = (0.9, 1.2)    # seconds between paragraphs (randomized)
TE_DOTS_PAUSE = (0.5, 0.7)    # seconds at "…" breathing marks
TE_LEAD_IN = 0.35             # room tone before the first word
TE_TAIL = 0.6                 # room tone after the last word
TE_PEAK = 0.91                # full presence, just under the EN level
ROOM_TONE_LEVEL = 0.0004      # barely-audible bed so pauses feel alive
WARMTH_MIX = 0.15             # trace of warmth; higher = softer/darker

# Telugu offline fallback (Indic Parler-TTS): the voice is
# *described* in words. Tweak freely — keep "calm / warm / slow /
# female" for the therapist character. A fixed seed keeps the same
# voice across all six files.
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


def write_mp3(path, wav, sr, peak_target=0.92):
    path.parent.mkdir(parents=True, exist_ok=True)
    peak = float(np.max(np.abs(wav))) or 1.0
    wav = (wav / peak) * peak_target   # simple, consistent loudness
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


def _english_edge(jobs):
    import asyncio
    import io
    import edge_tts

    log(f"  using Azure Neural voice {EDGE_VOICE_EN} "
        f"(rate {EDGE_RATE_EN}, pitch {EDGE_PITCH_EN}) via edge-tts")

    def finalize(phrase):
        # Phonetic replacements for US English TTS to pronounce Indian/Sanskrit words correctly
        pronunciations = {
            "Sushruta": "Soosh-roo-thah",
            "Ayurveda": "Ah-yoor-vay-dah",
            "Ayurvedic": "Ah-yoor-vay-dic",
            "Padaabhyanga": "Pah-dahb-hyang-gah",
            "Abhyanga": "Abb-hyang-gah",
            "Shirodhara": "Shee-roh-dhah-rah",
            "Pizhichil": "Pee-zhee-chill",
            "Potli": "Poat-lee",
            "potlis": "Poat-lees",
            "marma": "mahr-mah",
            "Marma": "mahr-mah",
            "Narasaraopet": "Nah-rah-sah-row-pet",
            "Palnadu": "Pahl-nah-doo",
        }
        for word, phonetic in pronunciations.items():
            phrase = re.sub(r'\b' + re.escape(word) + r'\b', phonetic, phrase)
        
        return phrase if re.search(r"[.!?।]$", phrase) else phrase + "."

    async def synth(phrase):
        stream = edge_tts.Communicate(
            finalize(phrase), EDGE_VOICE_EN, rate=EDGE_RATE_EN, pitch=EDGE_PITCH_EN)
        buf = io.BytesIO()
        async for chunk in stream.stream():
            if chunk["type"] == "audio":
                buf.write(chunk["data"])
        buf.seek(0)
        wav, sr = sf.read(buf, dtype="float32")
        if wav.ndim > 1:
            wav = wav.mean(axis=1)
        return wav, sr

    async def run_all():
        for therapy, text in jobs:
            log(f"• {therapy} (en)")
            rng = np.random.default_rng(PARLER_SEED)
            sr = 24000
            parts = [_room_tone(TE_LEAD_IN, sr, rng)]
            for pi, phrases in enumerate(split_script(text)):
                if pi > 0:
                    parts.append(_room_tone(rng.uniform(*TE_PARA_PAUSE), sr, rng))
                for si, phrase in enumerate(phrases):
                    if si > 0:
                        parts.append(_room_tone(rng.uniform(*TE_DOTS_PAUSE), sr, rng))
                    wav, sr = await synth(phrase)
                    parts.append(wav)
            parts.append(_room_tone(TE_TAIL, sr, rng))
            wav = _warmth(np.concatenate(parts))
            write_mp3(AUDIO_DIR / "en" / f"{therapy}.mp3", wav, sr, peak_target=TE_PEAK)

    asyncio.run(run_all())


def make_english(jobs):
    try:
        _english_edge(jobs)
        return
    except Exception as e:
        log(f"  ✗ Azure Neural (edge-tts) failed: {e}")
        log("  Falling back to offline Kokoro models.")

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
# Preferred: Azure Neural voice te-IN-ShrutiNeural via edge-tts —
# a native Telugu female voice with natural pronunciation and
# intonation. Free, no key; needs internet during generation.
# Offline fallbacks (in order): AI4Bharat Indic Parler-TTS (gated
# Hugging Face repo — accept the license once at
# https://huggingface.co/ai4bharat/indic-parler-tts and run
# huggingface-cli login), then facebook/mms-tts-tel (open, but
# noticeably robotic — last resort only).
MMS_MODEL = "facebook/mms-tts-tel"
MMS_SPEAKING_RATE = 0.92   # < 1.0 = slower, calmer


def make_telugu(jobs):
    try:
        _telugu_edge(jobs)
        return
    except Exception as e:
        log(f"  ✗ Azure Neural (edge-tts) failed: {e}")
        log("  This engine needs internet access. Falling back to the")
        log("  offline models — quality will be noticeably lower.")
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


def _room_tone(seconds, sr, rng):
    """Barely-audible brown-ish noise — pauses feel human, not digital."""
    n = int(seconds * sr)
    x = np.cumsum(rng.standard_normal(n)).astype(np.float32)
    x -= x.mean()
    peak = float(np.max(np.abs(x))) or 1.0
    return (x / peak) * ROOM_TONE_LEVEL


def _warmth(wav, mix=WARMTH_MIX, alpha=0.25):
    """Blend in a one-pole low-passed copy: rounds off the digital sheen."""
    if mix <= 0:
        return wav
    lp = np.empty_like(wav)
    acc = 0.0
    for i, v in enumerate(wav):
        acc = alpha * v + (1 - alpha) * acc
        lp[i] = acc
    return (1 - mix) * wav + mix * lp


def _telugu_edge(jobs):
    import asyncio
    import io

    import edge_tts

    log(f"  using Azure Neural voice {EDGE_VOICE} "
        f"(rate {EDGE_RATE}, pitch {EDGE_PITCH}) via edge-tts")

    def finalize(phrase):
        # Phrases split at "…" lose their terminal punctuation and
        # would be voiced with an unfinished, rising contour. A final
        # period makes every phrase close with a confident fall.
        return phrase if re.search(r"[.!?।]$", phrase) else phrase + "."

    async def synth(phrase):
        stream = edge_tts.Communicate(
            finalize(phrase), EDGE_VOICE, rate=EDGE_RATE, pitch=EDGE_PITCH)
        buf = io.BytesIO()
        async for chunk in stream.stream():
            if chunk["type"] == "audio":
                buf.write(chunk["data"])
        buf.seek(0)
        wav, sr = sf.read(buf, dtype="float32")
        if wav.ndim > 1:
            wav = wav.mean(axis=1)
        return wav, sr

    async def run_all():
        for therapy, text in jobs:
            log(f"• {therapy} (te)")
            # Seeded per file: pause lengths vary humanly within a
            # track but are identical on every regeneration.
            rng = np.random.default_rng(PARLER_SEED)
            sr = 24000
            parts = [_room_tone(TE_LEAD_IN, sr, rng)]
            for pi, phrases in enumerate(split_script(text)):
                if pi > 0:
                    parts.append(_room_tone(
                        rng.uniform(*TE_PARA_PAUSE), sr, rng))
                for si, phrase in enumerate(phrases):
                    if si > 0:
                        parts.append(_room_tone(
                            rng.uniform(*TE_DOTS_PAUSE), sr, rng))
                    wav, sr = await synth(phrase)
                    parts.append(wav)
            parts.append(_room_tone(TE_TAIL, sr, rng))
            wav = _warmth(np.concatenate(parts))
            write_mp3(AUDIO_DIR / "te" / f"{therapy}.mp3",
                      wav, sr, peak_target=TE_PEAK)

    asyncio.run(run_all())


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
