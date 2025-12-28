
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

export interface ConnectionCallbacks {
  onOpen: () => void;
  onClose: (event: CloseEvent) => void;
  onError: (error: ErrorEvent) => void;
  onTranscription: (sender: 'user' | 'gemini', text: string) => void;
}

export class GeminiLiveService {
  private session: any;
  private audioContext: AudioContext | null = null;
  private inputAudioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private nextStartTime: number = 0;
  private sources: Set<AudioBufferSourceNode> = new Set();
  private frameInterval: number | null = null;
  
  private micEnabled: boolean = true;
  private camEnabled: boolean = true;

  constructor() {}

  setMicEnabled(enabled: boolean) {
    this.micEnabled = enabled;
  }

  setCamEnabled(enabled: boolean) {
    this.camEnabled = enabled;
  }

  async connect(callbacks: ConnectionCallbacks) {
    // Initialize AI inside connect to ensure freshest API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    } catch (err) {
      console.error("Permissions denied", err);
      throw err;
    }

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          callbacks.onOpen();
          this.startAudioStreaming(sessionPromise);
          this.startVideoStreaming(sessionPromise);
        },
        onmessage: async (message: LiveServerMessage) => {
          this.handleServerMessage(message, callbacks);
        },
        onerror: (e: ErrorEvent) => callbacks.onError(e),
        onclose: (e: CloseEvent) => callbacks.onClose(e),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'You are a high-energy, friendly AI stream companion. Engage with the streamer and viewers based on what you see and hear. Keep responses relatively short and punchy.',
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    });

    this.session = await sessionPromise;
  }

  private startAudioStreaming(sessionPromise: Promise<any>) {
    if (!this.inputAudioContext || !this.stream) return;

    const source = this.inputAudioContext.createMediaStreamSource(this.stream);
    const scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    scriptProcessor.onaudioprocess = (e) => {
      if (!this.micEnabled) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createPcmBlob(inputData);
      
      sessionPromise.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    source.connect(scriptProcessor);
    scriptProcessor.connect(this.inputAudioContext.destination);
  }

  private startVideoStreaming(sessionPromise: Promise<any>) {
    if (!this.stream) return;
    
    const videoEl = document.createElement('video');
    videoEl.srcObject = this.stream;
    videoEl.play();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    this.frameInterval = window.setInterval(async () => {
      if (!this.camEnabled || !ctx) return;

      try {
        canvas.width = videoEl.videoWidth || 640;
        canvas.height = videoEl.videoHeight || 480;
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            const base64Data = await this.blobToBase64(blob);
            sessionPromise.then(session => {
              session.sendRealtimeInput({
                media: { data: base64Data, mimeType: 'image/jpeg' }
              });
            });
          }
        }, 'image/jpeg', 0.6);
      } catch (e) {
        console.error("Frame capture failed", e);
      }
    }, 1000); // 1 FPS
  }

  private async handleServerMessage(message: LiveServerMessage, callbacks: ConnectionCallbacks) {
    if (message.serverContent?.inputTranscription) {
      callbacks.onTranscription('user', message.serverContent.inputTranscription.text);
    }
    if (message.serverContent?.outputTranscription) {
      callbacks.onTranscription('gemini', message.serverContent.outputTranscription.text);
    }

    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (audioData && this.audioContext) {
      this.nextStartTime = Math.max(this.nextStartTime, this.audioContext.currentTime);
      const buffer = await this.decodeAudioData(this.decodeBase64(audioData), this.audioContext, 24000, 1);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(this.nextStartTime);
      
      this.nextStartTime += buffer.duration;
      this.sources.add(source);
      source.onended = () => this.sources.delete(source);
    }

    if (message.serverContent?.interrupted) {
      this.sources.forEach(s => s.stop());
      this.sources.clear();
      this.nextStartTime = 0;
    }
  }

  private createPcmBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: this.encodeBase64(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  private encodeBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  }

  disconnect() {
    if (this.session) {
      this.session.close();
    }
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
    }
    this.sources.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    this.sources.clear();
    this.audioContext?.close();
    this.inputAudioContext?.close();
  }
}
