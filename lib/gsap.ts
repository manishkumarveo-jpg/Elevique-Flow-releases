'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useGSAP } from '@gsap/react';

// Only the plugins the site uses, so the bundle stays small.
gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP);
if (typeof window !== 'undefined') ScrollTrigger.config({ ignoreMobileResize: true });

/** Every animation checks these: `motion` is off for people who asked for less motion; `fine` is a mouse on a big screen,
 *  where cursor-driven 3D tilt and pinned scrolling are worth their cost. */
export const MQ = {
  motion: '(prefers-reduced-motion: no-preference)',
  fine: '(hover: hover) and (pointer: fine) and (min-width: 1000px)',
};
export type Conditions = { motion: boolean; fine: boolean };

/** Weak devices (low-memory Android phones, very few cores, or ?lite in the URL) skip the scroll-driven 3D and headline
 *  rolls, which cost a little on every scroll frame; they keep the hero, the demos and everything you tap. */
export const lite = () => {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  return /[?&]lite\b/.test(location.search) || (nav.deviceMemory ?? 8) <= 4 || (nav.hardwareConcurrency ?? 8) <= 2;
};

export { gsap, ScrollTrigger, SplitText, useGSAP };
