'use client';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Brand, DownloadButton, Icon } from './ui';

/** Fades in every `.rv` element (and marks `[data-enter]` ones) the first time it scrolls into view. */
export function Reveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { rootMargin: '0px 0px -10% 0px' },
    );
    document.querySelectorAll('.rv,[data-enter]').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

/** Calls `fn` with whether the element is on screen, so animations only run while you can see them. */
export function useOnScreen(ref: RefObject<Element | null>, fn: (visible: boolean) => void, threshold = .1) {
  const cb = useRef(fn);
  cb.current = fn;
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(es => es.forEach(e => cb.current(e.isIntersecting)), { threshold });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref, threshold]);
}

/** Adds `in play` once the element is well into view, which starts its CSS animations. */
export function InView({ className, id, threshold = .35, children }: { className: string; id?: string; threshold?: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useOnScreen(ref, v => { if (v) setOn(true); }, threshold);
  // `in` is kept here too: Reveal adds it to the DOM, and this re-render must not drop it.
  return <div ref={ref} id={id} className={className + (on ? ' in play' : '')}>{children}</div>;
}

/** The 60-second ad behind a poster; it loads only when you press play. */
export function TourPlayer({ src, poster }: { src: string; poster: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <div className="vframe rv">
      <video ref={video} src={src} poster={poster} preload="none" playsInline controls={playing} />
      {!playing && (
        <button className="playb" aria-label="Play the 60-second tour" onClick={() => { setPlaying(true); video.current?.play(); }}>
          <span><Icon name="play" className="i fill" />Play the tour · 1:00</span>
        </button>
      )}
    </div>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap">
        <Brand />
        <nav className="links" aria-label="Sections">
          <a href="#edits">Features</a><a href="#keys">Shortcuts</a><a href="#privacy">Privacy</a><a href="#faq">FAQ</a>
        </nav>
        <DownloadButton small label="Download" />
      </div>
    </header>
  );
}
