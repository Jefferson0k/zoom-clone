import { useState, useEffect } from 'react';

export const useSpeechRecognition = () => {
  const [speechText, setSpeechText] = useState<string>('');

  const startRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSpeechText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event);
    };

    recognition.start();
  };

  useEffect(() => {
    startRecognition();  // Iniciar automáticamente cuando el componente se monta
  }, []);

  return { speechText };
};
