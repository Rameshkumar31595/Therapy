# Therapy Voice Guide — Local (Offline) Audio Pipeline

The narration audio is generated **entirely on this machine** with open-source
models — no cloud APIs, no API keys, no monthly costs. Models download once
from public open-source releases; after that, generation works offline.

The website itself never generates anything: it only plays pre-made MP3s,
lazily, when a visitor taps **Listen to Therapy / థెరపీ వినండి**.

## File contract (the only thing the website depends on)

```
audio/<lang>/<therapy>.mp3
```

| Therapy id     | English file               | Telugu file                |
|----------------|----------------------------|----------------------------|
| padaabhyanga   | audio/en/padaabhyanga.mp3  | audio/te/padaabhyanga.mp3  |
| abhyanga45     | audio/en/abhyanga45.mp3    | audio/te/abhyanga45.mp3    |
| abhyanga60     | audio/en/abhyanga60.mp3    | audio/te/abhyanga60.mp3    |
| potli          | audio/en/potli.mp3         | audio/te/potli.mp3         |
| shirodhara     | audio/en/shirodhara.mp3    | audio/te/shirodhara.mp3    |
| pizhichil      | audio/en/pizhichil.mp3     | audio/te/pizhichil.mp3     |

Drop in files with these names from ANY source and the player uses them.

## The voices

| Language | Engine | Why |
|----------|--------|-----|
| English  | **Kokoro** (open weights, Apache-2.0, ONNX) | The most natural small open TTS available; warm female voice `af_heart`, runs fast on CPU. Model ~340 MB, downloaded once to `%LOCALAPPDATA%\SushrutaTTS\models`. |
| Telugu   | **Azure Neural `te-IN-ShrutiNeural`** via `edge-tts` (free, no API key) | A native Telugu (India) female neural voice — natural pronunciation, correct sentence intonation, no English accent. Far beyond any open offline Telugu model. Needs internet **only while generating**; the website still just plays local MP3s. Offline fallbacks (Indic Parler-TTS, then MMS) kick in automatically if the network is down, at noticeably lower quality. |

The scripts in `scripts.json` use `…` pauses and paragraph breaks; the
generator turns those into real silences (0.45 s / 0.85 s), which is a big
part of the calm therapist feel. Edit the text there and regenerate.

## Setup (once)

Use Python 3.12 and keep the venv OUTSIDE OneDrive (faster, no sync churn):

```powershell
py -3.12 -m venv "$env:LOCALAPPDATA\SushrutaTTS\venv"
& "$env:LOCALAPPDATA\SushrutaTTS\venv\Scripts\pip" install -r requirements-tts.txt
```

## Generate

```powershell
$py = "$env:LOCALAPPDATA\SushrutaTTS\venv\Scripts\python"
& $py generate-audio.py              # all 12 files
& $py generate-audio.py en           # English only (fast)
& $py generate-audio.py te           # Telugu only (slow on CPU — minutes per file)
& $py generate-audio.py te potli     # a single file
```

## Tuning for maximum naturalness

- **English voice:** change `KOKORO_VOICE` in `generate-audio.py`
  (`af_heart` is warmest; `af_bella`, `af_nicole` are alternatives) and
  `KOKORO_SPEED` (0.85–0.95; lower = calmer).
- **Telugu voice:** the "premium wellness consultant" recipe lives in the
  constants at the top of `generate-audio.py` — `EDGE_RATE` (`-10%`;
  lower = slower/softer, higher = brisker), `EDGE_PITCH` (`-4Hz`), the
  pause ranges `TE_PARA_PAUSE` / `TE_DOTS_PAUSE`, `WARMTH_MIX`
  (0 = brightest, 0.35 = soft) and `TE_PEAK` (loudness). `EDGE_VOICE` is
  `te-IN-ShrutiNeural`, the native Telugu female neural voice. Audition
  samples are kept in `audio/te-samples/`: A/B/C = the earlier softness
  audition; 1/2/3 = the confident-delivery audition
  (1 = warm professional, 2 = confident expert,
  3 = premium consultant ← chosen).
- Listen on a phone speaker — that's what most visitors use.
- If a word is mispronounced (e.g. *Pizhichil*), respell it phonetically in
  `scripts.json` and regenerate just that file.
