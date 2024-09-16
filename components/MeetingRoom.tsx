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

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [isListening, setIsListening] = useState<boolean>(false); // Estado de escucha
  const [prediction, setPrediction] = useState<string | null>(null); // Predicción recibida del backend
  const [recording, setRecording] = useState<boolean>(false);
  const [recognizedWord, setRecognizedWord] = useState<string | null>(null); // Estado para la palabra reconocida
  const { useCallCallingState } = useCallStateHooks();
  const [microphoneEnabled, setMicrophoneEnabled] = useState<boolean>(true); // Estado para verificar si el micrófono está activado

  const callingState = useCallCallingState();

  // Función para obtener el GIF correspondiente a una palabra
  const getGifForWord = (word: string) => {
    const sanitizedWord = word.toLowerCase().trim();
    const gifPath = `/gif/${sanitizedWord}.gif`; // Ruta esperada del GIF
    console.log('Ruta del GIF:', gifPath); // Verifica la ruta del GIF en la consola
    return gifPath;
  };

  // Función para capturar una imagen de la cámara y enviarla al backend para la predicción
  const startRecordingAndPredict = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(chunks, { type: 'video/mp4' });
        const formData = new FormData();
        formData.append('file', videoBlob, 'señas.mp4');

        // Enviar el video al backend
        const response = await fetch('http://localhost:8000/lsp/recognize-actions-from-video/', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        setPrediction(result.prediction); // Actualiza la predicción
      };

      // Empezar la grabación y detener después de 5 segundos
      mediaRecorder.start();
      setRecording(true);

      setTimeout(() => {
        mediaRecorder.stop();
        setRecording(false);
      }, 5000); // Grabar por 5 segundos
    });
  };

  // Inicializar el reconocimiento de voz en español
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Speech Recognition API no es compatible');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'es-ES'; // Cambia el idioma a español
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onstart = () => {
      console.log('Reconocimiento de voz iniciado');
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!microphoneEnabled) return; // No hacer nada si el micrófono está apagado

      const results = Array.from(event.results);
      const lastResult = results[results.length - 1];
      if (lastResult && lastResult[0]) {
        let transcript = lastResult[0].transcript.trim();

        // Eliminar cualquier signo de puntuación adicional
        transcript = transcript.replace(/[.,!?]/g, '').toLowerCase();

        console.log('Transcripción limpia:', transcript);
        setRecognizedWord(transcript); // Actualiza la palabra reconocida

        // Desaparece el GIF después de 8 segundos
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
      recognition.start(); // Reinicia automáticamente el reconocimiento de voz
    };

    if (callingState === CallingState.JOINED && microphoneEnabled) {
      recognition.start();
    } else {
      recognition.stop();
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
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Mostrar el GIF en un recuadro al costado si la palabra reconocida coincide y no está grabando */}
      {recognizedWord && !recording && (
        <div className="absolute top-10 right-10 p-4 bg-gray-800 rounded-lg shadow-lg">
          <img
            src={getGifForWord(recognizedWord)}
            alt={`GIF for ${recognizedWord}`}
            className="w-48 h-48" // Ajusta el tamaño del GIF
            onError={(e) => {
              // Cambiar la imagen a no.png si el GIF no se encuentra
              const imgElement = e.target as HTMLImageElement;
              imgElement.src = '/gif/no.png';
            }}
          />
        </div>
      )}
      {/* Mostrar la predicción obtenida del backend */}
      {prediction && (
        <div className="absolute top-20 right-10 p-4 bg-gray-800 rounded-lg shadow-lg">
          <p>Predicción: {prediction}</p>
        </div>
      )}

      {/* Botón para grabar video y predecir, ahora al lado izquierdo */}
      <div className="absolute top-32 left-10 p-4"> {/* Cambié "right-10" por "left-10" */}
        <button
          onClick={startRecordingAndPredict}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          disabled={recording} // Deshabilitar el botón mientras se está grabando
        >
          {recording ? 'Grabando...' : 'Grabar Señal'}
        </button>
      </div>

      {/* Controles de videollamada */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls onLeave={() => router.push(`/`)} />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
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
                <DropdownMenuSeparator className="border-dark-1" />
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
