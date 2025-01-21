"use client";

import { useEffect, useState } from "react";

export default function StarField() {
  const [stars, setStars] = useState<Array<{ id: number; style: any }>>([]);

  useEffect(() => {
    const generateStars = () => {
      return Array.from({ length: 200 }, (_, i) => ({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 3}s`,
        },
      }));
    };

    setStars(generateStars());
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {stars.map((star) => (
        <div
          key={star.id}
          style={star.style}
          className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
        />
      ))}
    </div>
  );
}
