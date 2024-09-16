export const getGifFrames = (gifSrc: string): Promise<HTMLImageElement[]> => {
    return new Promise((resolve, reject) => {
      const gif = document.createElement('img');
      gif.src = gifSrc;
  
      gif.onload = () => {
        // Simula la obtención de frames de GIF
        // Para simplificación, asumimos que el GIF tiene 10 frames y cada uno dura 100ms
        const frames = Array.from({ length: 10 }, (_, i) => {
          const img = new Image();
          img.src = `${gifSrc}?frame=${i}`;
          return img;
        });
        resolve(frames);
      };
  
      gif.onerror = (error) => reject(error);
    });
  };
  