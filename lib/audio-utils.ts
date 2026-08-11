/**
 * Audio processing utilities for Gemini Live API
 * Handles PCM 16kHz mono audio capture and playback
 */

export class AudioStreamer {
  private captureContext: AudioContext | null = null;
  private playbackContext: AudioContext | null = null;

  private destination: MediaStreamAudioDestinationNode | null = null;
  private audioElement: HTMLAudioElement | null = null;

  private processor: ScriptProcessorNode | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  private gainNode: GainNode | null = null;
  private volume: number = 1.0;

  private nextStartTime: number = 0;
  private isPlaying: boolean = false;
  private onSpeechEnd: (() => void) | null = null;
  private speechEndTimeout: any = null;
  private onAudioData: (data: string) => void;
  private activeSources: Set<AudioBufferSourceNode> = new Set();

  constructor(callback: (data: string) => void) {
    this.onAudioData = (d: string) => callback(d);
  }

  setSpeechEndCallback(callback: () => void) {
    this.onSpeechEnd = callback;
  }

  stopPlayback() {
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // ignore
      }
    });
    this.activeSources.clear();
    this.nextStartTime = 0;
  }

  /**
   * Initializes the AudioContexts. Must be called from a user gesture.
   */
  async init() {
    if (!this.captureContext) {
      this.captureContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 16000,
      });
      console.log(`[Live] Capture AudioContext sampleRate: ${this.captureContext.sampleRate}`);
    }

    if (!this.playbackContext) {
      this.playbackContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive',
      });
      console.log(`[Live] Playback AudioContext sampleRate: ${this.playbackContext.sampleRate}`);

      // Mobile audio routing trick
      this.destination = this.playbackContext.createMediaStreamDestination();
      this.audioElement = new Audio();
      this.audioElement.id = 'gemini-live-audio-output';
      this.audioElement.style.display = 'none';
      this.audioElement.setAttribute('playsinline', 'true');
      this.audioElement.setAttribute('autoplay', 'true');
      document.body.appendChild(this.audioElement);

      this.audioElement.srcObject = this.destination.stream;
      this.audioElement.volume = 1.0;
      this.audioElement.play().catch(() => {});
    }

    if (!this.gainNode && this.playbackContext) {
      this.gainNode = this.playbackContext.createGain();
      this.gainNode.gain.value = this.volume;

      if (this.destination) {
        this.gainNode.connect(this.destination);
      } else {
        this.gainNode.connect(this.playbackContext.destination);
      }
    }

    if (this.captureContext.state === 'suspended') {
      await this.captureContext.resume();
    }
    if (this.playbackContext.state === 'suspended') {
      await this.playbackContext.resume();
    }
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.gainNode && this.playbackContext) {
      this.gainNode.gain.setTargetAtTime(volume, this.playbackContext.currentTime, 0.1);
    }
  }

  async startCapture() {
    try {
      await this.init();
      
      if (!this.captureContext) return;

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      if (!this.captureContext || !this.stream) return;
      this.source = this.captureContext.createMediaStreamSource(this.stream);
      this.processor = this.captureContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = this.float32ToPcm(inputData);
        const base64Data = this.arrayBufferToBase64(pcmData);
        this.onAudioData(base64Data);
      };

      this.source.connect(this.processor);
      this.processor.connect(this.captureContext.destination);
    } catch (error) {
      console.error('Error starting audio capture:', error);
      throw error;
    }
  }

  stopCapture() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.srcObject = null;
      this.audioElement.remove();
      this.audioElement = null;
    }
    if (this.captureContext && this.captureContext.state !== 'closed') {
      this.captureContext.close();
      this.captureContext = null;
    }
    if (this.playbackContext && this.playbackContext.state !== 'closed') {
      this.playbackContext.close();
      this.playbackContext = null;
    }
    this.gainNode = null;
    this.destination = null;
    if (this.speechEndTimeout) {
      clearTimeout(this.speechEndTimeout);
    }
  }

  async playAudioChunk(base64Data: string) {
    await this.init();
    if (!this.playbackContext) return;

    if (this.audioElement && this.audioElement.paused) {
      this.audioElement.play().catch(() => {});
    }

    const pcmData = this.base64ToArrayBuffer(base64Data);
    const floatData = this.pcmToFloat32(pcmData);
    
    const audioBuffer = this.playbackContext.createBuffer(1, floatData.length, 24000);
    audioBuffer.getChannelData(0).set(floatData);

    const source = this.playbackContext.createBufferSource();
    source.buffer = audioBuffer;



    if (this.gainNode) {
      source.connect(this.gainNode);
    } else {
      source.connect(this.playbackContext.destination);
    }

    const currentTime = this.playbackContext.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }
    console.log(`[Playback] PCM length: ${floatData.length}, contextRate: ${this.playbackContext.sampleRate}, bufferRate: ${audioBuffer.sampleRate}, queue: ${this.activeSources.size}, start: ${this.nextStartTime}, current: ${currentTime}`);


    this.activeSources.add(source);
    source.onended = () => {
      this.activeSources.delete(source);
    };

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    this.isPlaying = true;

    if (this.speechEndTimeout) {
      clearTimeout(this.speechEndTimeout);
    }
    const delay = (this.nextStartTime - currentTime) * 1000;
    this.speechEndTimeout = setTimeout(() => {
      this.isPlaying = false;
      if (this.onSpeechEnd) {
        this.onSpeechEnd();
      }
    }, delay);
  }

  private float32ToPcm(float32Array: Float32Array): ArrayBuffer {
    const pcmArray = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      pcmArray[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return pcmArray.buffer;
  }

  private pcmToFloat32(pcmBuffer: ArrayBuffer): Float32Array {
    const pcmArray = new Int16Array(pcmBuffer);
    const floatArray = new Float32Array(pcmArray.length);
    for (let i = 0; i < pcmArray.length; i++) {
      floatArray[i] = pcmArray[i] / 0x8000;
    }
    return floatArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
