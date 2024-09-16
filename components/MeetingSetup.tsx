'use client';
import { useEffect, useState } from 'react';
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';

import Alert from './Alert';
import { Button } from './ui/button';

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  // Obtener los hooks de estado de la llamada
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  
  // Determinar si la llamada ha empezado o terminado
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();

  if (!call) {
    throw new Error(
      'useStreamCall debe usarse dentro de un componente StreamCall.',
    );
  }

  // Control de micrófono y cámara
  const [isMicCamToggled, setIsMicCamToggled] = useState(false);

  useEffect(() => {
    if (isMicCamToggled) {
      call.camera?.disable();
      call.microphone?.disable();
    } else {
      call.camera?.enable();
      call.microphone?.enable();
    }
  }, [isMicCamToggled, call]);

  // Si la llamada no ha comenzado aún
  if (callTimeNotArrived) {
    return (
      <Alert
        title={`Su reunión aún no ha comenzado. Está programada para ${callStartsAt ? new Date(callStartsAt).toLocaleString() : 'desconocido'}`}
      />
    );
  }

  // Si la llamada ha terminado
  if (callHasEnded) {
    return (
      <Alert
        title="La llamada ha sido terminada por el anfitrión."
        iconUrl="/icons/call-ended.svg"
      />
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
      <h1 className="text-center text-2xl font-bold">Configuración</h1>
      <VideoPreview />
      <div className="flex h-16 items-center justify-center gap-3">
        <label className="flex items-center justify-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={isMicCamToggled}
            onChange={(e) => setIsMicCamToggled(e.target.checked)}
          />
          Únase con el micrófono y la cámara apagados
        </label>
        <DeviceSettings />
      </div>
      <Button
        className="rounded-md bg-green-500 px-4 py-2.5"
        onClick={() => {
          call.join();
          setIsSetupComplete(true);
        }}
      >
        Unirse a la reunión
      </Button>
    </div>
  );
};

export default MeetingSetup;