"use client";

import { useEffect } from "react";

export default function ClickSound() {
  useEffect(() => {
    const clickAudio = new Audio('/sounds/universfield-computer-mouse-click-352734-link2.0.mp3');

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;


      if (target.closest('a, button, summary')) {
        clickAudio.currentTime = 0;
        clickAudio.play();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}