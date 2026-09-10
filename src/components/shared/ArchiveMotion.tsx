'use client';

import Link from 'next/link';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { ReactNode, useRef } from 'react';

export function ScrollReveal({ children, className = '', delay = 0, id }: { children: ReactNode; className?: string; delay?: number; id?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      id={id}
      initial={reduceMotion ? false : { opacity: 0, y: 36 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function MagneticLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  const area = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 16 });
  const springY = useSpring(y, { stiffness: 180, damping: 16 });

  function move(event: React.MouseEvent<HTMLAnchorElement>) {
    if (reduceMotion || !area.current) return;
    const bounds = area.current.getBoundingClientRect();
    x.set((event.clientX - bounds.left - bounds.width / 2) * 0.22);
    y.set((event.clientY - bounds.top - bounds.height / 2) * 0.22);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div style={{ x: springX, y: springY }}>
      <Link ref={area} href={href} onMouseMove={move} onMouseLeave={reset} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}

export function ParallaxPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const scale = useTransform(progress, [0, 1], [1.08, 1]);

  return (
    <motion.div
      className={className}
      onViewportEnter={() => progress.set(1)}
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={reduceMotion ? undefined : { opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.div className="archive-parallax-content" style={{ scale }}>
        {children}
      </motion.div>
    </motion.div>
  );
}
