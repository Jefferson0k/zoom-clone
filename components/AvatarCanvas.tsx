// components/AvatarCanvas.tsx

"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const AvatarCanvas = ({ avatarId }: { avatarId: number }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [gifLoaded, setGifLoaded] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (mountRef.current) {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      // Create scene
      const scene = new THREE.Scene();

      // Create camera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;

      // Create renderer
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(width, height);
      mountRef.current.appendChild(renderer.domElement);

      // Create avatar geometry
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const avatar = new THREE.Mesh(geometry, material);
      scene.add(avatar);

      // Load GIF as texture
      const gifTexture = new THREE.TextureLoader().load('/gifs/hola.gif', () => {
        setTexture(gifTexture);
        setGifLoaded(true);
      });

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);

        if (gifLoaded && texture) {
          texture.needsUpdate = true;
        }

        avatar.rotation.x += 0.01;
        avatar.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();

      // Cleanup
      return () => {
        mountRef.current?.removeChild(renderer.domElement);
      };
    }
  }, [gifLoaded, texture]);

  return <div ref={mountRef} style={{ width: '300px', height: '300px' }} />;
};

export default AvatarCanvas;