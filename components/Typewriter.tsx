"use client";

import { useState, useEffect } from 'react';

export const Typewriter = ({ text = "", speed = 30 }: { text?: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    // SAFETY CHECK: If text is undefined or not a string, stop here.
    if (!text || typeof text !== 'string') return;

    let i = 0;
    setDisplayedText(""); 

    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(intervalId);
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      {/* Only show the cursor while typing */}
      {displayedText.length < (text?.length || 0) && (
        <span className="inline-block w-1 h-5 ml-1 bg-[#00538e] animate-pulse">|</span>
      )}
    </span>
  );
};