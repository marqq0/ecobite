import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  category?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  className = "",
  category,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  const getEmojiAndLabel = () => {
    switch (category?.toLowerCase()) {
      case "bakery":
        return { emoji: "🥐", bg: "bg-[#fef3c7]", text: "Fresh Bakery & Sourdough" };
      case "meal":
        return { emoji: "🍲", bg: "bg-[#dcfce7]", text: "Cooked Hot Meals" };
      case "grocery":
        return { emoji: "🥑", bg: "bg-[#e0f2fe]", text: "Local Fresh Produce" };
      case "dessert":
        return { emoji: "🍰", bg: "bg-[#fce7f3]", text: "Indulgent Dessert" };
      default:
        return { emoji: "🍱", bg: "bg-[#fafaf9]", text: "Eco Food Rescue Bag" };
    }
  };

  const info = getEmojiAndLabel();

  if (error || !src) {
    return (
      <div
        className={`gradient-eco border-2 border-[#1A1A1A] flex flex-col items-center justify-center p-4 text-center select-none relative overflow-hidden h-full min-h-[140px] ${className}`}
      >
        <div className="absolute top-2 left-2 right-2 bottom-2 border border-dashed border-[#1A1A1A]/25 -z-0"></div>
        <div className={`relative z-10 w-12 h-12 rounded-full border-2 border-[#1A1A1A] ${info.bg} flex items-center justify-center shadow-[2px_2px_0px_0px_#1A1A1A] mb-2`}>
          <span className="text-2xl">{info.emoji}</span>
        </div>
        <span className="text-[10px] uppercase font-mono font-black text-[#1A1A1A] tracking-wider relative z-10">
          {info.text}
        </span>
        <span className="text-[8px] text-[#1A1A1A]/60 font-medium font-mono mt-0.5 uppercase relative z-10">
          Saved with EcoBite
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      className={className}
      alt={alt}
      onError={() => {
        setError(true);
      }}
      referrerPolicy="no-referrer"
    />
  );
}
