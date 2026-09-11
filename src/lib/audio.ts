import type { NoiseId, SoundId } from "@/lib/types";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseNodes: { source: AudioBufferSourceNode; gain: GainNode; filter: BiquadFilterNode } | null =
  null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  audio();
}

export function setMasterVolume(v: number) {
  const c = audio();
  if (!c || !master) return;
  master.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), c.currentTime, 0.05);
}

function envGain(c: AudioContext, start: number, peak: number, attack: number, decay: number) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
  return g;
}

function tone(
  c: AudioContext,
  dest: AudioNode,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  peak: number,
) {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  const g = envGain(c, start, peak, 0.012, dur);
  o.connect(g);
  g.connect(dest);
  o.start(start);
  o.stop(start + dur + 0.05);
}

export function playSound(id: SoundId, volume = 0.7) {
  const c = audio();
  if (!c || !master) return;
  const t = c.currentTime + 0.01;
  const bus = c.createGain();
  bus.gain.value = volume;
  bus.connect(master);

  switch (id) {
    case "chime":
      tone(c, bus, 784, t, 0.55, "sine", 0.28);
      tone(c, bus, 1175, t + 0.08, 0.7, "sine", 0.22);
      tone(c, bus, 1568, t + 0.16, 0.85, "triangle", 0.12);
      break;
    case "bell": {
      const o = c.createOscillator();
      const m = c.createOscillator();
      const mg = c.createGain();
      mg.gain.value = 680;
      m.frequency.value = 420;
      m.connect(mg);
      mg.connect(o.frequency);
      o.frequency.setValueAtTime(640, t);
      const g = envGain(c, t, 0.3, 0.008, 1.1);
      o.connect(g);
      g.connect(bus);
      o.start(t);
      m.start(t);
      o.stop(t + 1.2);
      m.stop(t + 1.2);
      tone(c, bus, 1280, t, 0.4, "sine", 0.08);
      break;
    }
    case "ding":
      tone(c, bus, 1320, t, 0.22, "sine", 0.32);
      tone(c, bus, 1760, t + 0.04, 0.28, "triangle", 0.14);
      break;
    case "wood":
      tone(c, bus, 180, t, 0.08, "triangle", 0.4);
      tone(c, bus, 420, t, 0.05, "square", 0.08);
      break;
    case "beep":
      tone(c, bus, 880, t, 0.12, "square", 0.12);
      tone(c, bus, 880, t + 0.16, 0.12, "square", 0.12);
      break;
    case "success":
      tone(c, bus, 523, t, 0.22, "sine", 0.22);
      tone(c, bus, 659, t + 0.1, 0.26, "sine", 0.22);
      tone(c, bus, 784, t + 0.2, 0.45, "triangle", 0.26);
      tone(c, bus, 1046, t + 0.32, 0.7, "sine", 0.16);
      break;
  }
}

function noiseBuffer(c: AudioContext, kind: Exclude<NoiseId, "off">) {
  const len = c.sampleRate * 2;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  let b0 = 0,
    b1 = 0,
    b2 = 0;
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (kind === "white") {
      data[i] = white * 0.35;
    } else if (kind === "pink") {
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.052691;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.08;
    } else if (kind === "brown" || kind === "fan") {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 2.4 + white * 0.04;
    }
  }
  return buf;
}

export function startNoise(kind: NoiseId, volume = 0.25) {
  stopNoise();
  if (kind === "off") return;
  const c = audio();
  if (!c || !master) return;
  const source = c.createBufferSource();
  source.buffer = noiseBuffer(c, kind);
  source.loop = true;
  const filter = c.createBiquadFilter();
  if (kind === "rain") {
    filter.type = "highpass";
    filter.frequency.value = 400;
  } else if (kind === "fan") {
    filter.type = "lowpass";
    filter.frequency.value = 280;
  } else if (kind === "brown") {
    filter.type = "lowpass";
    filter.frequency.value = 800;
  } else {
    filter.type = "lowpass";
    filter.frequency.value = 8000;
  }
  const gain = c.createGain();
  gain.gain.value = volume;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start();
  noiseNodes = { source, gain, filter };
}

export function setNoiseVolume(v: number) {
  const c = audio();
  if (!c || !noiseNodes) return;
  noiseNodes.gain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), c.currentTime, 0.05);
}

export function stopNoise() {
  if (!noiseNodes) return;
  try {
    noiseNodes.source.stop();
    noiseNodes.source.disconnect();
    noiseNodes.gain.disconnect();
    noiseNodes.filter.disconnect();
  } catch {
    /* already stopped */
  }
  noiseNodes = null;
}

export const SOUND_LABELS: Record<SoundId, string> = {
  chime: "Soft chime",
  bell: "Bell",
  ding: "Bright ding",
  wood: "Wood tap",
  beep: "Digital beep",
  success: "Success",
};

export const NOISE_LABELS: Record<NoiseId, string> = {
  off: "Off",
  white: "White",
  pink: "Pink",
  brown: "Brown",
  rain: "Rain",
  fan: "Fan",
};
