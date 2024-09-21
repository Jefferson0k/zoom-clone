'use client';
import { useState, useEffect } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: any;
}

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = Boolean(searchParams.get('personal'));
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [recognizedWord, setRecognizedWord] = useState<string | null>(null);
  const { useCallCallingState } = useCallStateHooks();
  const [microphoneEnabled] = useState<boolean>(true);

  const callingState = useCallCallingState();

  const getGifForWord = (word: string) => {
    const sanitizedWord = word.toLowerCase().trim();
    const gifPath = `/gif/${encodeURIComponent(sanitizedWord)}.gif`; // Usa encodeURIComponent para manejar caracteres especiales
    console.log('Ruta del GIF:', gifPath);
    return gifPath;
  };

  const startRecordingAndPredict = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Array<Blob> = [];
  
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
  
      mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(chunks, { type: 'video/mp4' });
        const formData = new FormData();
        formData.append('file', videoBlob, 'señas.mp4');
  
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lsp/recognize-actions-from-video/`, {
            method: 'POST',
            body: formData,
          });
  
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
  
          const result = await response.json();
          console.log('Predicción recibida:', result.action);
          setPrediction(result.action);
  
          // Reproducir el audio correspondiente
          playAudioForAction(result.action);
        } catch (error) {
          console.error('Error al enviar el video:', error);
          setPrediction('Error en la predicción');
        }
      };
  
      mediaRecorder.start();
      setRecording(true);
  
      setTimeout(() => {
        mediaRecorder.stop();
        setRecording(false);
      }, 5000); // 10 segundos de grabación
    });
  };
  
  const playAudioForAction = (action: string) => {
    const audioPath = `/audios/${action}.mp3`;
    const audio = new Audio(audioPath);
    audio.oncanplaythrough = () => {
      audio.play().catch(e => console.error('Error al reproducir el audio:', e));
    };
    audio.onerror = () => {
      console.error(`No se pudo cargar el audio para la acción: ${action}`);
    };
  };

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Speech Recognition API no es compatible');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onstart = () => {
      console.log('Reconocimiento de voz iniciado');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!microphoneEnabled) return;

      const results = Array.from(event.results);
      const lastResult = results[results.length - 1];
      if (lastResult && lastResult[0]) {
        const transcript = lastResult[0].transcript.trim().replace(/[.,!?]/g, '').toLowerCase();
        console.log('Transcripción limpia:', transcript);
        setRecognizedWord(transcript);

        setTimeout(() => {
          setRecognizedWord(null);
        }, 8000);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Error en el reconocimiento de voz:', event.error);
    };

    recognition.onend = () => {
      console.log('Reconocimiento de voz terminado');
      if (callingState === CallingState.JOINED && microphoneEnabled) {
        recognition.start();
      }
    };

    if (callingState === CallingState.JOINED && microphoneEnabled) {
      recognition.start();
    }

    return () => {
      recognition.stop();
    };
  }, [callingState, microphoneEnabled]);

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {recognizedWord && !recording && (
  <div className="image-container">
    <img
      src={getGifForWord(recognizedWord)}
      alt={`GIF for ${recognizedWord}`}
      width={500}
      height={300}
      onError={(e) => {
        const imgElement = e.target as HTMLImageElement;
        imgElement.src = '/gif/no.png'; // Asegúrate de que esta ruta sea correcta
      }}
      className="image-size"
    />
  </div>
)}
 
      {prediction && (
        <div className="prediction-container">
          <p>Predicción: {prediction}</p>
        </div>
      )}

      <div className="absolute left-10 top-32 p-4">
      <button
          onClick={startRecordingAndPredict}
          className="btn-recording"
          disabled={recording}
        >
          {recording ? 'Grabando...' : 'Grabar Señal'}
        </button>
      </div>

      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls onLeave={() => router.push(`/`)} />

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <LayoutList size={20} className="text-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }
                >
                  {item}
                </DropdownMenuItem>
                {index < 2 && <DropdownMenuSeparator className="border-dark-1" />}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;