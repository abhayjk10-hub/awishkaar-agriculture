'use client';

interface FieldMotionProps {
  className?: string;
}

export default function FieldMotion({ className = '' }: FieldMotionProps) {
  return (
    <video
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=1600&q=85"
      aria-hidden="true"
    >
      <source
        src="https://videos.pexels.com/video-files/2887468/2887468-hd_1920_1080_24fps.mp4"
        type="video/mp4"
      />
    </video>
  );
}