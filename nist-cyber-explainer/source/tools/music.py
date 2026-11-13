"""Synthesize the background track: an original, upbeat corporate cue.

Everything is generated from scratch with numpy (no samples, no loops from
anywhere else), so the track is royalty-free and fully reproducible.

    python3 source/tools/music.py [seconds] [out.wav]

D major, 104 BPM. Piano chords, plucked arpeggio, warm pad, bass, light drums.
Sections follow the video: soft intro, build, main groove, a lighter
breakdown in the middle, a lift, and a ringing final chord.
"""
import sys
import wave
import pathlib
import numpy as np

SR = 44100
BPM = 104.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
ROOT = pathlib.Path(__file__).resolve().parents[1]

DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 306.0
OUT = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "assets" / "music.wav"

rng = np.random.default_rng(7)
N = int((DUR + 4) * SR)
L = np.zeros(N, np.float32)
R = np.zeros(N, np.float32)
# separate buses so the pad and bass can "breathe" with the kick
padL = np.zeros(N, np.float32)
padR = np.zeros(N, np.float32)
duck = np.ones(N, np.float32)
verbL = np.zeros(N, np.float32)
verbR = np.zeros(N, np.float32)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


def put(bufL, bufR, t0, sig, pan=0.0, gain=1.0, send=0.0):
    i = int(round(t0 * SR))
    if i >= N:
        return
    sig = sig[: N - i] * gain
    gl = np.cos((pan + 1) * np.pi / 4)
    gr = np.sin((pan + 1) * np.pi / 4)
    bufL[i : i + len(sig)] += sig * gl
    bufR[i : i + len(sig)] += sig * gr
    if send:
        verbL[i : i + len(sig)] += sig * gl * send
        verbR[i : i + len(sig)] += sig * gr * send


def env_adr(n, a, d_rate, rel_at=None, rel=0.08):
    t = np.arange(n) / SR
    e = np.minimum(1.0, t / max(a, 1e-4)) * np.exp(-t * d_rate)
    if rel_at is not None:
        k = t > rel_at
        e[k] *= np.exp(-(t[k] - rel_at) / rel)
    return e.astype(np.float32)


# ---------------- instruments ----------------
def piano(m, dur, vel):
    f = hz(m)
    n = int((dur + 1.2) * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for h in range(1, 9):
        fh = f * h * (1 + 0.0004 * h * h)
        if fh > 9000:
            break
        amp = (1.0 / h ** 1.4) * (1.1 if h == 2 else 1.0)
        s += amp * np.sin(2 * np.pi * fh * t + rng.uniform(0, 6.28)) * np.exp(-t * (1.6 + 0.9 * h))
    a = np.minimum(1, t / 0.004)
    rel = np.where(t > dur, np.exp(-(t - dur) / 0.25), 1.0)
    hammer = rng.standard_normal(n) * np.exp(-t * 90) * 0.04
    return ((s * a * rel + hammer) * vel * 0.22).astype(np.float32)


def pluck(m, vel):
    f = hz(m)
    n = int(0.7 * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for h in (1, 2, 3, 4, 5):
        s += (1.0 / h ** 1.8) * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (7 + 6 * h))
    s *= np.minimum(1, t / 0.002)
    return (s * vel * 0.16).astype(np.float32)


def pad_voice(m, dur):
    f = hz(m)
    n = int((dur + 1.0) * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for det in (-0.07, 0.0, 0.07):
        ff = f * 2 ** (det / 12)
        for h in range(1, 7):
            s += (1.0 / h ** 1.6) * np.sin(2 * np.pi * ff * h * t + rng.uniform(0, 6.28))
    att = np.minimum(1, t / 0.7)
    rel = np.where(t > dur, np.exp(-(t - dur) / 0.6), 1.0)
    trem = 1 + 0.06 * np.sin(2 * np.pi * 0.25 * t)
    return (s * att * rel * trem * 0.018).astype(np.float32)


def bass(m, dur, vel):
    f = hz(m)
    n = int((dur + 0.15) * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    e = np.minimum(1, t / 0.006) * np.exp(-t * 2.2)
    e = np.where(t > dur, e * np.exp(-(t - dur) / 0.04), e)
    return (s * e * vel * 0.24).astype(np.float32)


def kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 46 + 95 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5) + 0.25 * rng.standard_normal(n) * np.exp(-t * 250)
    return (s * 0.55).astype(np.float32)


def bandnoise(n, lo, hi):
    x = rng.standard_normal(n)
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(n, 1 / SR)
    X[(fr < lo) | (fr > hi)] = 0
    y = np.fft.irfft(X, n)
    return y / (np.abs(y).max() + 1e-9)


def clap():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    nz = bandnoise(n, 900, 5200)
    e = np.zeros(n)
    for k, d in enumerate((0.0, 0.011, 0.022)):
        e += np.where(t >= d, np.exp(-(t - d) * (140 if k < 2 else 18)), 0)
    return (nz * e * 0.22).astype(np.float32)


def hat(open_=False):
    n = int((0.25 if open_ else 0.08) * SR)
    t = np.arange(n) / SR
    nz = bandnoise(n, 7000, 16000)
    return (nz * np.exp(-t * (14 if open_ else 60)) * 0.09).astype(np.float32)


def shaker():
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    nz = bandnoise(n, 5000, 12000)
    e = np.minimum(1, t / 0.02) * np.exp(-t * 45)
    return (nz * e * 0.035).astype(np.float32)


def swell(len_s):
    n = int(len_s * SR)
    t = np.arange(n) / SR
    nz = bandnoise(n, 2000, 12000)
    return (nz * (t / len_s) ** 2.4 * 0.06).astype(np.float32)


KICK, CLAP, HAT, OHAT, SHK = kick(), clap(), hat(), hat(True), shaker()

# ---------------- harmony ----------------
# chords as (bass root midi, voicing midi notes)
D = (38, [62, 66, 69, 74])
A = (45, [61, 64, 69, 73])
Bm = (47, [62, 66, 71, 74])
G = (43, [62, 67, 71, 74])
Fsm = (42, [61, 66, 69, 73])
Em = (40, [62, 67, 71, 76])
PROG_A = [D, A, Bm, G]
PROG_B = [G, A, Fsm, Bm]
PROG_C = [Bm, G, D, A]

# section plan: (bars, progression, layers)
# layers: p=piano, a=arp, d=pad, b=bass, k=kick, c=clap, h=hats, s=shaker
PLAN = [
    (4, PROG_A, "pd"),
    (8, PROG_A, "pdah"),
    (16, PROG_A, "pdabkchs"),
    (8, PROG_B, "pdabkchs"),
    (16, PROG_A, "pdabkchs"),
    (8, PROG_C, "pdas"),          # breakdown
    (8, PROG_C, "pdabhs"),        # rebuild
    (16, PROG_A, "pdabkchs"),
    (8, PROG_B, "pdabkchs"),
    (16, PROG_A, "pdabkchs"),
    (8, PROG_C, "pdabhs"),
    (16, PROG_A, "pdabkchs"),
    (8, PROG_B, "pdabkch"),
]

bars_needed = int(np.ceil((DUR - 4.5) / BAR))
seq = []
for bars, prog, lay in PLAN:
    for b in range(bars):
        seq.append((prog[b % len(prog)], lay, b == bars - 1))
seq = seq[:bars_needed]
# keep the last two bars thinning out into the final chord
END_T = len(seq) * BAR

ARP_PAT = [0, 1, 2, 3, 2, 1, 2, 3]
BASS_PAT = [(0.0, 0.45), (1.0, 0.4), (1.5, 0.4), (2.5, 0.45), (3.0, 0.4), (3.5, 0.35)]
PIANO_HITS = [(0.0, 1.4, 1.0), (1.5, 1.0, 0.75), (2.5, 1.4, 0.85)]

for i, (ch, lay, last_of_section) in enumerate(seq):
    t0 = i * BAR
    root, voice = ch
    nb = len(seq)
    if "d" in lay:
        for m in voice[:3]:
            put(padL, padR, t0, pad_voice(m, BAR), pan=rng.uniform(-0.5, 0.5), send=0.5)
        put(padL, padR, t0, pad_voice(root + 12, BAR), send=0.4)
    if "p" in lay:
        for off, d, v in PIANO_HITS:
            for j, m in enumerate(voice):
                put(L, R, t0 + off * BEAT + j * 0.006, piano(m, d * BEAT, v * rng.uniform(0.85, 1.0)),
                    pan=-0.25 + 0.17 * j, send=0.35)
    if "a" in lay:
        for k in range(8):
            m = voice[ARP_PAT[k]] + 12
            put(L, R, t0 + k * BEAT / 2, pluck(m, 0.9 if k % 2 == 0 else 0.65),
                pan=0.55 if k % 2 else -0.55, send=0.45)
    if "b" in lay:
        for off, d in BASS_PAT:
            put(padL, padR, t0 + off * BEAT, bass(root, d * BEAT, 1.0 if off == 0 else 0.8))
    if "k" in lay:
        for b in (0, 2) + ((2.5,) if i % 4 == 3 else ()):
            tt = t0 + b * BEAT
            put(L, R, tt, KICK)
            j = int(tt * SR)
            dl = int(0.28 * SR)
            if j < N:
                seg = 1 - 0.35 * np.exp(-np.arange(min(dl, N - j)) / SR * 9)
                duck[j : j + len(seg)] = np.minimum(duck[j : j + len(seg)], seg)
    if "c" in lay:
        for b in (1, 3):
            put(L, R, t0 + b * BEAT, CLAP, pan=0.05, send=0.3)
    if "h" in lay:
        for k in range(8):
            if k % 2 == 1:
                put(L, R, t0 + k * BEAT / 2, OHAT if (k == 7 and i % 2) else HAT, pan=0.3, gain=1.0)
            else:
                put(L, R, t0 + k * BEAT / 2, HAT, pan=0.3, gain=0.5)
    if "s" in lay:
        for k in range(16):
            put(L, R, t0 + k * BEAT / 4, SHK, pan=-0.35, gain=1.0 if k % 4 == 2 else 0.55)
    # cymbal-style swell into each new section
    if last_of_section and i < nb - 1:
        sw = swell(BAR)
        put(L, R, t0, sw, pan=-0.2, send=0.3)
        put(L, R, t0, sw[::-1][::-1] * 0.8, pan=0.2)

# final ringing chord
tf = END_T
for j, m in enumerate(D[1] + [50]):
    put(L, R, tf + j * 0.01, piano(m, 3.2, 0.9), pan=-0.3 + 0.12 * j, send=0.6)
for m in D[1][:3]:
    put(padL, padR, tf, pad_voice(m, 2.6), send=0.6)
put(padL, padR, tf, bass(D[0], 2.0, 0.9))
put(L, R, tf, KICK, gain=0.8)

# ---------------- mix ----------------
L += padL * duck
R += padR * duck


def reverb(x, seconds=2.4, seed=1):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-t * 3.2)
    ir[: int(0.012 * SR)] = 0  # predelay
    # darken the tail
    IR = np.fft.rfft(ir)
    fr = np.fft.rfftfreq(n, 1 / SR)
    IR *= 1 / (1 + (fr / 5000) ** 2)
    ir = np.fft.irfft(IR, n)
    ir /= np.sqrt((ir ** 2).sum())
    blk = 1 << 18
    nfft = 1 << int(np.ceil(np.log2(blk + n)))
    H = np.fft.rfft(ir, nfft)
    out = np.zeros(len(x) + n)
    for s0 in range(0, len(x), blk):
        seg = x[s0 : s0 + blk]
        y = np.fft.irfft(np.fft.rfft(seg, nfft) * H, nfft)[: len(seg) + n]
        out[s0 : s0 + len(y)] += y
    return out[: len(x)].astype(np.float32)


L += reverb(verbL, seed=1) * 0.55
R += reverb(verbR, seed=2) * 0.55

# gentle fade-in and fade-out
t = np.arange(N) / SR
fade = np.clip(t / 1.5, 0, 1) * np.clip((DUR + 3.5 - t) / 3.0, 0, 1)
L *= fade
R *= fade

# glue: soft saturation, then set level for "background" use
mix = np.stack([L, R], 1)
mix /= np.abs(mix).max() + 1e-9
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
rms = np.sqrt((mix[int(20 * SR) : int(DUR * SR)] ** 2).mean())
target = 10 ** (-17.5 / 20)
mix *= target / rms
pk = np.abs(mix).max()
if pk > 0.89:
    mix *= 0.89 / pk
mix = mix[: int((DUR + 3.5) * SR)]

OUT.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(OUT), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
print("wrote %s  %.1fs  bars=%d" % (OUT, len(mix) / SR, len(seq)))
