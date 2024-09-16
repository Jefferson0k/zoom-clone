import React from 'react';
import { useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

interface Avatar3DProps {
  avatarId: number;
}

const modelUrls: { [key: string]: string } = {
  '1': '/models/64adb55b6309f6d7ed9a8bed.glb',
  '2': '/models/66ce912081a74a64f746ae89.glb',
  // Añade más modelos según sea necesario
};

export function Avatar3D({ avatarId }: Avatar3DProps) {
  const modelUrl = modelUrls[avatarId.toString()];
  const { scene } = useGLTF(modelUrl);
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);

  return (
    <group dispose={null}>
      <primitive object={clone} />
    </group>
  );
}

useGLTF.preload('/models/64adb55b6309f6d7ed9a8bed.glb');
useGLTF.preload('/models/66ce912081a74a64f746ae89.glb');

