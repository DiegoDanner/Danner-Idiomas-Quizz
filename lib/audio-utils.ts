/**
 * Audio processing utilities for Gemini Live API
 * Handles PCM 16kHz mono audio capture and playback
 */

export class AudioStreamer {
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private nextStartTime: number = 0;
  private isPlaying: boolean = false;

  constructor(private onAudioData: (base64Data: string) => void) {}

  async startCapture() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (!this.audioContext) {
        console.warn('AudioContext was closed before capture started');
        return;
      }

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      
      // Using ScriptProcessorNode for simplicity in this environment
      // 4096 buffer size at 16kHz is ~250ms
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
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
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  playAudioChunk(base64Data: string) {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000, // Gemini Live output is usually 24kHz
      });
    }

    const pcmData = this.base64ToArrayBuffer(base64Data);
    const floatData = this.pcmToFloat32(pcmData);
    
    const audioBuffer = this.audioContext.createBuffer(1, floatData.length, 24000);
    audioBuffer.getChannelData(0).set(floatData);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    const currentTime = this.audioContext.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    this.isPlaying = true;
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
