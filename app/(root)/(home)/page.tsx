'use client';

import { useEffect, useState } from 'react';
import MeetingTypeList from '@/components/MeetingTypeList';
import { useGetCalls } from '@/hooks/useGetCalls';

const Home = () => {
  const now = new Date();
  const { upcomingCalls } = useGetCalls();
  const [nextMeetingTime, setNextMeetingTime] = useState<string | null>(null);

  useEffect(() => {
    if (upcomingCalls && upcomingCalls.length > 0) {
      // Ordenar las reuniones próximas por la hora de inicio, asegurándose de que `startsAt` esté definido
      const sortedMeetings = [...upcomingCalls].sort((a, b) =>
        new Date(a.state.startsAt ?? '').getTime() - new Date(b.state.startsAt ?? '').getTime()
      );

      // Obtener la primera reunión próxima
      const nextMeeting = sortedMeetings[0];

      if (nextMeeting && nextMeeting.state.startsAt) {
        // Formatear la hora de inicio de la próxima reunión con AM/PM
        const formattedTime = new Date(nextMeeting.state.startsAt).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true, // Mostrar AM/PM
        });

        // Obtener "AM" o "PM" en mayúsculas
        const [time, period] = formattedTime.split(' ');
        setNextMeetingTime(`${time} ${period.toUpperCase()}`);
      }
    }
  }, [upcomingCalls]);

  const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
  const [currentTime, currentPeriod] = time.split(' ');
  const date = new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' }).format(now);

  return (
    <section className="flex size-full flex-col gap-5 text-white">
      <div className="h-[303px] w-full rounded-[20px] bg-hero bg-cover">
        <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
          <h2 className="glassmorphism max-w-[273px] rounded py-2 text-center text-base font-normal">
            {nextMeetingTime ? (
              <>Próxima reunión a las: <strong>{nextMeetingTime}</strong></>
            ) : (
              'No hay reuniones próximas'
            )}
          </h2>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl">{currentTime} <span className="text-2xl">{currentPeriod.toUpperCase()}</span></h1>
            <p className="text-lg font-medium text-sky-1 lg:text-2xl">{date}</p>
          </div>
        </div>
      </div>

      <MeetingTypeList />
    </section>
  );
};

export default Home;

