'use client';

import { useState, useEffect } from 'react';
import RotatingAvatarCanvas from "@/components/RotatingAvatarCanvas";
import { ThreeDots } from 'react-loader-spinner';

const AvatarPage = () => {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number>(1); // Inicializa con el ID del avatar predeterminado

  useEffect(() => {
    // Simula la carga de los avatares durante 2 segundos
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAvatarClick = (id: number) => {
    console.log(`Avatar seleccionado: ${id}`);
    setSelected(id); // Establece el avatar seleccionado de forma interna
  };

  return (
    <section className="flex flex-col gap-10 text-white">
      <h1 className="text-3xl font-bold">Avatares</h1>

      {/* Lista de avatares */}
      <div className="flex gap-10">
        <div
          className={`avatar-card ${selected === 1 ? 'selected' : ''}`}
          onClick={() => handleAvatarClick(1)}
        >
          {loading ? (
            <div className="loading-card flex-center">
              <ThreeDots
                height="120"
                width="120"
                radius="9"
                color="#ffffff"
                ariaLabel="three-dots-loading"
              />
            </div>
          ) : (
            <RotatingAvatarCanvas avatarId={1} />
          )}
        </div>
        <div
          className={`avatar-card ${selected === 2 ? 'selected' : ''}`}
          onClick={() => handleAvatarClick(2)}
        >
          {loading ? (
            <div className="loading-card flex-center">
              <ThreeDots
                height="120"
                width="120"
                radius="9"
                color="#ffffff"
                ariaLabel="three-dots-loading"
              />
            </div>
          ) : (
            <RotatingAvatarCanvas avatarId={2} />
          )}
        </div>
      </div>
    </section>
  );
};

export default AvatarPage;
