// Pure browser Web Audio API synthesizer for study ambient sounds (no external files needed)
class StudyAudioEngine {
  private ctx: AudioContext | null = null;
  private currentSourceNodes: any[] = [];
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private currentType: string = 'none';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(type: 'rain' | 'whitenoise' | 'lofi' | 'binaural', volume = 0.5) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);
    this.currentType = type;
    this.isPlaying = true;

    if (type === 'whitenoise') {
      this.playBrownNoise();
    } else if (type === 'rain') {
      this.playRain();
    } else if (type === 'lofi') {
      this.playLofiDrone();
    } else if (type === 'binaural') {
      this.playBinauralBeat();
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, volume * 0.4)), this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    this.currentSourceNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.currentSourceNodes = [];
    this.isPlaying = false;
    this.currentType = 'none';
  }

  public getStatus() {
    return { isPlaying: this.isPlaying, type: this.currentType };
  }

  private playBrownNoise() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // gain compensation
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    whiteNoise.start();
    this.currentSourceNodes.push(whiteNoise, filter);
  }

  private playRain() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.gainNode);
    noise.start();
    this.currentSourceNodes.push(noise, filter);
  }

  private playLofiDrone() {
    if (!this.ctx || !this.gainNode) return;
    // Harmonic warm drone frequencies (C minor 9th: C3, G3, Eb4, Bb4)
    const freqs = [130.81, 196.0, 311.13, 466.16];
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.gainNode) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle detuning for analog warmth
      osc.detune.setValueAtTime((idx % 2 === 0 ? 3 : -3) * (idx + 1), this.ctx.currentTime);

      oscGain.gain.setValueAtTime(0.12 / freqs.length, this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(this.gainNode);
      osc.start();
      this.currentSourceNodes.push(osc, oscGain);
    });
  }

  private playBinauralBeat() {
    if (!this.ctx || !this.gainNode) return;
    // Base 200 Hz carrier with 10 Hz alpha wave difference for focus
    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();
    const merger = this.ctx.createChannelMerger(2);

    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(216, this.ctx.currentTime); // Left ear

    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(226, this.ctx.currentTime); // Right ear (10Hz alpha difference)

    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(this.gainNode);

    oscL.start();
    oscR.start();
    this.currentSourceNodes.push(oscL, oscR, merger);
  }
}

export const studyAudio = new StudyAudioEngine();
