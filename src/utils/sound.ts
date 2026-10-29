// Utilitário de geração de áudio em memória (WAV data URI)
// Permite reproduzir sons com 100% de compatibilidade em celulares (incluindo iPhone no Safari/Chrome)

function createWavDataUri(sampleRate: number, samples: Float32Array): string {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * 1 * 2)
  view.setUint32(28, sampleRate * 2, true);
  // block align
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  // Converte ArrayBuffer em Base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Gera som de ponto curto (bip ascendente)
function generatePointWav(isTeamA: boolean): string {
  const sampleRate = 22050;
  const duration = 0.12;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);
  const startFreq = isTeamA ? 587.33 : 523.25;
  const endFreq = isTeamA ? 880 : 783.99;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = i / numSamples;
    const currentFreq = startFreq + (endFreq - startFreq) * progress;
    const envelope = Math.max(0, 1 - progress);
    samples[i] = Math.sin(2 * Math.PI * currentFreq * t) * envelope * 0.45;
  }
  return createWavDataUri(sampleRate, samples);
}

// Gera som de Set Point (dois tons de alerta)
function generateSetPointWav(): string {
  const sampleRate = 22050;
  const duration = 0.28;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let val = 0;
    if (t < 0.12) {
      const p = t / 0.12;
      val = Math.sin(2 * Math.PI * 659.25 * t) * (1 - p);
    } else if (t >= 0.14) {
      const p = (t - 0.14) / 0.14;
      val = Math.sin(2 * Math.PI * 880 * (t - 0.14)) * (1 - p);
    }
    samples[i] = val * 0.45;
  }
  return createWavDataUri(sampleRate, samples);
}

// Gera apito de vitória (acorde ascendente festivo)
function generateWhistleWav(): string {
  const sampleRate = 22050;
  const duration = 0.45;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);
  const notes = [523.25, 659.25, 783.99, 1046.5];
  const step = 0.08;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let val = 0;
    const noteIdx = Math.min(notes.length - 1, Math.floor(t / step));
    const noteTime = t - noteIdx * step;
    const freq = notes[noteIdx];
    const decay = noteIdx === notes.length - 1 ? 0.21 : step;
    const env = Math.max(0, 1 - noteTime / decay);

    // Onda triangular/seno composta para som mais encorpado
    val = (Math.sin(2 * Math.PI * freq * t) * 0.7 + Math.sin(2 * Math.PI * freq * 2 * t) * 0.3) * env;
    samples[i] = val * 0.5;
  }
  return createWavDataUri(sampleRate, samples);
}

class SoundEffects {
  private ctx: AudioContext | null = null;
  private isUnlocked = false;

  // Cache dos áudios WAV pré-gerados
  private pointAWav: string | null = null;
  private pointBWav: string | null = null;
  private setPointWav: string | null = null;
  private victoryWav: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initListeners();
    }
  }

  public get unlocked(): boolean {
    return this.isUnlocked;
  }

  private initListeners() {
    const unlockHandler = () => {
      this.unlock();
    };

    ['touchstart', 'touchend', 'click', 'keydown'].forEach((eventName) => {
      window.addEventListener(eventName, unlockHandler, { once: true, passive: true });
    });
  }

  public unlock() {
    if (typeof window === 'undefined') return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!this.ctx && AudioCtx) {
        this.ctx = new AudioCtx();
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      // Toca um buffer silencioso para ativar a saída de som no iOS
      if (this.ctx) {
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
      }

      this.isUnlocked = true;
    } catch {
      // Ignora erro de unlock
    }
  }

  // Toca usando elemento de áudio HTML5 (garantia de funcionamento no iOS / Safari / Chrome)
  private playHtmlAudio(dataUri: string) {
    try {
      const audio = new Audio(dataUri);
      audio.volume = 0.8;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback se o navegador rejeitar autoplay
        });
      }
    } catch {
      // Fallback silencioso
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playPoint(isTeamA = true) {
    this.unlock();

    // No mobile (iOS e outros), o elemento Audio com Data URI é o mais confiável
    if (!this.pointAWav) this.pointAWav = generatePointWav(true);
    if (!this.pointBWav) this.pointBWav = generatePointWav(false);

    const uri = isTeamA ? this.pointAWav : this.pointBWav;
    this.playHtmlAudio(uri);

    // Também dispara no AudioContext se estiver ativo
    const ctx = this.getContext();
    if (ctx && ctx.state === 'running') {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isTeamA ? 587.33 : 523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(isTeamA ? 880 : 783.99, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } catch {
        // Ignora
      }
    }
  }

  playSetPoint() {
    this.unlock();

    if (!this.setPointWav) this.setPointWav = generateSetPointWav();
    this.playHtmlAudio(this.setPointWav);

    const ctx = this.getContext();
    if (ctx && ctx.state === 'running') {
      try {
        const now = ctx.currentTime;
        [659.25, 880].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);

          gain.gain.setValueAtTime(0.2, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.18);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.18);
        });
      } catch {
        // Ignora
      }
    }
  }

  playWhistleVictory() {
    this.unlock();

    if (!this.victoryWav) this.victoryWav = generateWhistleWav();
    this.playHtmlAudio(this.victoryWav);

    const ctx = this.getContext();
    if (ctx && ctx.state === 'running') {
      try {
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const start = now + idx * 0.07;
          const duration = idx === notes.length - 1 ? 0.35 : 0.12;

          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.22, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(start);
          osc.stop(start + duration);
        });
      } catch {
        // Ignora
      }
    }
  }
}

export const soundFX = new SoundEffects();
