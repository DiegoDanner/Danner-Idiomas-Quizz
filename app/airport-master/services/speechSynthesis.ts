import { playAirportChime, playSeatbeltChime } from './soundEffects';

interface SpeechOptions {
  rate?: number;
  pitch?: number;
  voiceStyle?: 'gate' | 'customs' | 'captain' | 'standard';
  includeChime?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

class AirportSpeechService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getSpeakingStatus(): boolean {
    return this.isSpeaking;
  }

  public stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  /**
   * Play an authentic airport PA announcement:
   * 1. Rings the airport chime
   * 2. Speaks the announcement with airport PA pacing and British/American accent options
   */
  public async playAnnouncement(text: string, options: SpeechOptions = {}): Promise<void> {
    this.stop();

    if (options.includeChime !== false) {
      if (options.voiceStyle === 'captain') {
        playSeatbeltChime();
        await new Promise((r) => setTimeout(r, 600));
      } else {
        await playAirportChime();
      }
    }

    if (!this.isSupported()) {
      options.onStart?.();
      await new Promise((r) => setTimeout(r, 2000));
      options.onEnd?.();
      return;
    }

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Enforce English language fallback specifically for mobile browsers that default to system language
      utterance.lang = 'en-US';

      // Find an English voice (en-US or en-GB)
      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find((v) => v.lang === 'en-GB' || v.name.includes('British') || v.name.includes('UK')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        null;

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      // Voice style parameters for authentic airport PA feel
      if (options.voiceStyle === 'captain') {
        utterance.pitch = 0.9;
        utterance.rate = 0.92;
      } else if (options.voiceStyle === 'gate') {
        utterance.pitch = 1.05;
        utterance.rate = 0.95;
      } else if (options.voiceStyle === 'customs') {
        utterance.pitch = 0.95;
        utterance.rate = 0.9;
      } else {
        utterance.pitch = options.pitch ?? 1.0;
        utterance.rate = options.rate ?? 0.95;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        options.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        options.onError?.();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Speak a single vocabulary term or definition clearly for practice.
   */
  public speakTerm(term: string, onEnd?: () => void): void {
    this.stop();
    if (!this.isSupported()) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(term);
    utterance.lang = 'en-US'; // Enforce English on mobile devices
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find((v) => v.lang.startsWith('en')) || null;
    if (enVoice) utterance.voice = enVoice;
    utterance.rate = 0.9;
    utterance.onend = () => onEnd?.();
    window.speechSynthesis.speak(utterance);
  }
}

export const airportSpeech = new AirportSpeechService();
