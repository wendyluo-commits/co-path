'use client';

import { useEffect, useRef, useMemo, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
}

function tokenize(text: string): string[] {
  const CJK =
    /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u2e80-\u2eff\u3000-\u303f\uff00-\uffef\u3040-\u309f\u30a0-\u30ff]/;
  const tokens: string[] = [];
  let buf = '';
  for (const ch of text) {
    if (CJK.test(ch)) {
      if (buf) { tokens.push(buf); buf = ''; }
      tokens.push(ch);
    } else if (/\s/.test(ch)) {
      if (buf) { tokens.push(buf); buf = ''; }
      tokens.push(ch);
    } else {
      buf += ch;
    }
  }
  if (buf) tokens.push(buf);
  return tokens;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return tokenize(text).map((token, index) => {
      if (/^\s+$/.test(token)) return token;
      return (
        <span
          className="word"
          key={index}
          style={{
            display: 'inline-block',
            opacity: baseOpacity,
            ...(enableBlur ? { filter: `blur(${blurStrength}px)` } : {}),
          }}
        >
          {token}
        </span>
      );
    });
  }, [children, baseOpacity, enableBlur, blurStrength]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const words = el.querySelectorAll<HTMLElement>('.word');
    if (!words.length) return;

    const tl = gsap.timeline({
      paused: true,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    });

    if (baseRotation !== 0) {
      gsap.set(el, { transformOrigin: '0% 50%', rotate: baseRotation });
      tl.to(el, { rotate: 0, duration: 0.6, ease: 'power2.out' }, 0);
    }

    const opacityVars: gsap.TweenVars = {
      opacity: 1,
      duration: 0.4,
      ease: 'power1.out',
      stagger: { each: 0.02 },
    };

    if (enableBlur) {
      opacityVars.filter = 'blur(0px)';
    }

    tl.to(words, opacityVars, 0);

    tlRef.current = tl;

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [enableBlur, baseRotation, baseOpacity, blurStrength]);

  return (
    <div ref={containerRef} className={containerClassName}>
      <p className={textClassName}>{splitText}</p>
    </div>
  );
};

export default ScrollReveal;
export { ScrollReveal };
