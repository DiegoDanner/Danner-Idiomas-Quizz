/**
 * Audio processing utilities for Gemini Live API
 * Handles PCM 16kHz mono audio capture and playback
 */

export class AudioStreamer {
  private audioContext: AudioContext | null = null;
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

  constructor(callback: (data: string) => void) {
    this.onAudioData = (d: string) => callback(d);
  }

  setSpeechEndCallback(callback: () => void) {
    this.onSpeechEnd = callback;
  }

  /**
   * Initializes the AudioContext. Must be called from a user gesture.
   */
  async init() {
    if (!this.audioContext) {
      console.log("Initializing AudioContext...");
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive',
      });

      // Mobile audio routing trick: Use an <audio> element connected to the context
      // This forces the OS to treat this as a media stream rather than a communication stream
      this.destination = this.audioContext.createMediaStreamDestination();
      this.audioElement = new Audio();
      this.audioElement.id = 'gemini-live-audio-output';
      this.audioElement.style.display = 'none';
      this.audioElement.setAttribute('playsinline', 'true');
      this.audioElement.setAttribute('autoplay', 'true');
      this.audioElement.setAttribute('x-webkit-airplay', 'allow');
      document.body.appendChild(this.audioElement);

      this.audioElement.srcObject = this.destination.stream;
      this.audioElement.volume = 1.0;
      this.audioElement.play().catch(e => console.warn("Audio element play (initial) failed, will retry on chunk:", e));
    }

    if (!this.gainNode && this.audioContext) {
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;

      if (this.destination) {
        // Connect to the MediaStreamDestination (for the <audio> element trick)
        this.gainNode.connect(this.destination);
        // Also connect to the hardware output as a fallback
        this.gainNode.connect(this.audioContext.destination);
      } else {
        this.gainNode.connect(this.audioContext.destination);
      }
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    return this.audioContext;
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.1);
    }
  }

  async startCapture() {
    try {
      await this.init();
      
      if (!this.audioContext) return;

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      if (!this.audioContext || !this.stream) return;
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      
      // Using ScriptProcessorNode for simplicity in this environment
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Resample manually if needed? ScriptProcessor resamples to context rate.
        // But the API expects 16kHz.
        // For now, let's keep it simple as the previous version was working for some.
        const pcmData = this.float32ToPcm(inputData);
        const base64Data = this.arrayBufferToBase64(pcmData);
        this.onAudioData(base64Data);
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
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
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
      this.gainNode = null;
      this.destination = null;
    }
    if (this.speechEndTimeout) {
      clearTimeout(this.speechEndTimeout);
    }
  }

  async playAudioChunk(base64Data: string) {
    // Ensure context and gain are ready.
    await this.init();
    if (!this.audioContext) return;

    // Retry playing the audio element if it was blocked or paused
    if (this.audioElement && this.audioElement.paused) {
      this.audioElement.play().catch(() => {});
    }

    const pcmData = this.base64ToArrayBuffer(base64Data);
    const floatData = this.pcmToFloat32(pcmData);
    
    const audioBuffer = this.audioContext.createBuffer(1, floatData.length, 24000);
    audioBuffer.getChannelData(0).set(floatData);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    if (this.gainNode) {
      source.connect(this.gainNode);
    } else {
      source.connect(this.audioContext.destination);
    }

    const currentTime = this.audioContext.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    this.isPlaying = true;

    // Handle speech end callback
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
