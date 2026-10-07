// Color Extractor for adaptive ambient glows based on album cover artwork

export interface ExtractedPalette {
  primary: string;
  secondary: string;
  primaryRgba: (alpha: number) => string;
  secondaryRgba: (alpha: number) => string;
}

export function getDefaultPalette(): ExtractedPalette {
  return {
    primary: 'rgb(124, 92, 255)',
    secondary: 'rgb(79, 209, 197)',
    primaryRgba: (alpha) => `rgba(124, 92, 255, ${alpha})`,
    secondaryRgba: (alpha) => `rgba(79, 209, 197, ${alpha})`,
  };
}

export function extractPaletteFromImageUrl(imgUrl: string): Promise<ExtractedPalette> {
  return new Promise((resolve) => {
    if (!imgUrl) {
      resolve(getDefaultPalette());
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(getDefaultPalette());
          return;
        }

        ctx.drawImage(img, 0, 0, 32, 32);
        const data = ctx.getImageData(0, 0, 32, 32).data;

        let bestColor = { r: 124, g: 92, b: 255, score: 0 };
        let secondColor = { r: 79, g: 209, b: 197, score: 0 };

        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const diff = max - min;

          // Discard near blacks, near whites, and desaturated grays
          if (max < 40 || min > 225 || diff < 25) continue;

          const saturation = diff / max;
          const score = saturation * (max / 255);

          if (score > bestColor.score) {
            secondColor = { ...bestColor };
            bestColor = { r, g, b, score };
          } else if (
            score > secondColor.score &&
            (Math.abs(r - bestColor.r) > 35 || Math.abs(g - bestColor.g) > 35 || Math.abs(b - bestColor.b) > 35)
          ) {
            secondColor = { r, g, b, score };
          }
        }

        resolve({
          primary: `rgb(${bestColor.r}, ${bestColor.g}, ${bestColor.b})`,
          secondary: `rgb(${secondColor.r}, ${secondColor.g}, ${secondColor.b})`,
          primaryRgba: (alpha) => `rgba(${bestColor.r}, ${bestColor.g}, ${bestColor.b}, ${alpha})`,
          secondaryRgba: (alpha) => `rgba(${secondColor.r}, ${secondColor.g}, ${secondColor.b}, ${alpha})`,
        });
      } catch {
        resolve(getDefaultPalette());
      }
    };

    img.onerror = () => {
      resolve(getDefaultPalette());
    };

    img.src = imgUrl;
  });
}

export function applyDynamicPaletteToDocument(palette: ExtractedPalette): void {
  const root = document.documentElement;
  root.style.setProperty('--dynamic-glow-1', palette.primaryRgba(0.2));
  root.style.setProperty('--dynamic-glow-2', palette.secondaryRgba(0.18));
  root.style.setProperty('--dynamic-accent-primary', palette.primary);
  root.style.setProperty('--dynamic-accent-secondary', palette.secondary);
}
