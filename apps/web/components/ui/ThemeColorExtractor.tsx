"use client";

import { useEffect } from "react";

export function ThemeColorExtractor({ imageUrl }: { imageUrl: string | null | undefined }) {
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        for (let i = 0; i < data.length; i += 16) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        
        document.documentElement.style.setProperty("--theme-glow", `rgba(${r}, ${g}, ${b}, 0.15)`);
        document.documentElement.style.setProperty("--theme-accent", `rgb(${r}, ${g}, ${b})`);
      } catch (e) {
        console.warn("Could not extract theme color", e);
      }
    };
  }, [imageUrl]);

  return null;
}
