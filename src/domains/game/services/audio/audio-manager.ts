/**
 * Hand-rolled WebAudio: a synthesized engine loop and PS1-flavored SFX.
 * Everything is generated — no audio files to license or download.
 * The context is created inside the PRESS START gesture (autoplay-safe).
 */

import type { SfxName } from "@/domains/game/types";

const MASTER_VOLUME = 0.5;

class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted = false;

  private engine: {
    osc1: OscillatorNode;
    osc2: OscillatorNode;
    filter: BiquadFilterNode;
    gain: GainNode;
  } | null = null;

  /** Must be called from a user gesture. Safe to call repeatedly. */
  unlock(muted: boolean) {
    this.muted = muted;
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = muted ? 0 : MASTER_VOLUME;
    this.master.connect(this.ctx.destination);

    // 1s of white noise, reused by every noise-based effect.
    const length = this.ctx.sampleRate;
    this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.ctx || !this.master) return;
    this.master.gain.linearRampToValueAtTime(
      muted ? 0 : MASTER_VOLUME,
      this.ctx.currentTime + 0.1,
    );
  }

  startEngine() {
    if (!this.ctx || !this.master || this.engine) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = "sawtooth";
    osc2.type = "sawtooth";
    osc1.frequency.value = 85;
    osc2.frequency.value = 87; // slight detune for thickness
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 500;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.0;
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    osc1.start();
    osc2.start();
    gain.gain.linearRampToValueAtTime(0.07, this.ctx.currentTime + 0.3);
    this.engine = { osc1, osc2, filter, gain };
  }

  updateEngine(speed: number, turbo: boolean) {
    if (!this.ctx || !this.engine) return;
    const t = this.ctx.currentTime;
    const pitch = 85 + Math.abs(speed) * 5.5 + (turbo ? 40 : 0);
    this.engine.osc1.frequency.setTargetAtTime(pitch, t, 0.08);
    this.engine.osc2.frequency.setTargetAtTime(pitch * 1.02, t, 0.08);
    this.engine.filter.frequency.setTargetAtTime(
      450 + Math.abs(speed) * 35 + (turbo ? 600 : 0),
      t,
      0.1,
    );
  }

  stopEngine() {
    if (!this.ctx || !this.engine) return;
    const { osc1, osc2, gain } = this.engine;
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);
    osc1.stop(this.ctx.currentTime + 0.2);
    osc2.stop(this.ctx.currentTime + 0.2);
    this.engine = null;
  }

  play(name: SfxName) {
    if (!this.ctx || !this.master || this.muted) return;
    const t = this.ctx.currentTime;
    switch (name) {
      case "menuMove":
        // metallic clank, like swinging signs
        this.noise(0.07, 1600, 0.22, t);
        this.tone("square", 150, 105, 0.08, 0.12, t);
        break;
      case "menuConfirm":
        // heavier metal hit + falling whoosh
        this.noise(0.22, 900, 0.32, t);
        this.tone("sawtooth", 250, 75, 0.24, 0.16, t);
        this.tone("square", 95, 60, 0.18, 0.14, t + 0.03);
        break;
      case "mg":
        this.noise(0.05, 1800, 0.16, t);
        break;
      case "missile":
        this.tone("sawtooth", 620, 110, 0.45, 0.14, t);
        this.noise(0.4, 900, 0.1, t);
        break;
      case "explosion":
        this.noise(0.7, 380, 0.5, t);
        this.tone("sine", 70, 38, 0.6, 0.4, t);
        break;
      case "hit":
        this.noise(0.12, 700, 0.25, t);
        this.tone("square", 95, 70, 0.1, 0.18, t);
        break;
    }
  }

  private tone(
    type: OscillatorType,
    from: number,
    to: number,
    duration: number,
    volume: number,
    start: number,
  ) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + duration);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  private noise(
    duration: number,
    cutoff: number,
    volume: number,
    start: number,
  ) {
    if (!this.ctx || !this.master || !this.noiseBuffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(start, Math.random() * 0.4, duration + 0.05);
  }
}

export const audio = new AudioManager();
