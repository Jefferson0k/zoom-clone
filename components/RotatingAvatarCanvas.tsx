'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Avatar3D } from './Avatar3D';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';

interface RotatingAvatarCanvasProps {
  avatarId: number;
}

const RotatingAvatarCanvas: React.FC<RotatingAvatarCanvasProps> = ({ avatarId }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);

  const handleAvatarClick = () => {
    setSelectedAvatar(avatarId);
    console.log(`Avatar seleccionado: ${avatarId}`);
  };

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 2, 5], fov: 30 }}
        className="full-size"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight
          position={[15, 15, 15]}
          angle={0.3}
          penumbra={0.5}
          intensity={2}
          castShadow
        />
        <PerspectiveCamera
          makeDefault
          position={[0, 5, 15]}
          fov={75}
          near={0.1}
          far={1000}
        />
        <OrbitControls />
        <group onClick={handleAvatarClick} position={[0, -5, 0]} scale={[6, 6, 6]}>
          <Avatar3D avatarId={avatarId} />
          <ambientLight intensity={1} />
        </group>
      </Canvas>
      {selectedAvatar === avatarId && (
        <div className="avatar-container">
        {avatarId}
      </div>
      )}
    </>
  );
};

export default RotatingAvatarCanvas;
