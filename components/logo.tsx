import React from 'react'
import { Bangers } from "next/font/google";

const bangers = Bangers({
  subsets: ["latin"],
  weight: "400",
});

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <div className={`${bangers.className}  text-blue-500 font-extrabold  ${className}`}>
      GRND
    </div>
  );
}
