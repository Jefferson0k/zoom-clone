// speech-recognition.d.ts

interface SpeechRecognitionResult {
    transcript: string;
  }
  
  interface SpeechRecognitionResultList extends Array<SpeechRecognitionResult> {}
  
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
  
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }
  
  declare class SpeechRecognition {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
  
    start(): void;
    stop(): void;
    abort(): void;
  
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
  }
  
  declare const webkitSpeechRecognition: typeof SpeechRecognition;
  