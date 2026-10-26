'use client';
import { Fragment, useRef, useState, type CSSProperties } from 'react';
import { gsap, lite, MQ, ScrollTrigger, useGSAP, type Conditions } from '@/lib/gsap';
import { reducedMotion } from '@/lib/site';
import { useOnScreen } from './client';
import { Head } from './ui';

type Level = 'off' | 'light' | 'medium';
type Token = { t: string; cut?: Level[]; tag?: 'filler' | 'correction'; as?: Record<Level, string> };

// The Style page's example, with what each cleanup level does to it.
const SAID: (Token | string)[] = [
  { t: 'um', cut: ['light', 'medium'], tag: 'filler' }, ' ',
  { t: 'so', cut: ['medium'], tag: 'filler', as: { off: 'so', light: 'So', medium: 'so' } }, ' ',
  { t: 'i', as: { off: 'i', light: 'I', medium: 'I' } }, ' think we should ',
  { t: 'uh', cut: ['light', 'medium'], tag: 'filler' }, ' move the launch to ',
  { t: 'next week no wait', cut: ['light', 'medium'], tag: 'correction' }, ' the week ',
];
const OUT: Record<Level, string> = {
  off: 'um so i think we should uh move the launch to next week no wait the week after',
  light: 'So I think we should move the launch to the week after.',
  medium: 'I think we should move the launch to the week after.',
};
const DESC: Record<Level, string> = {
  off: 'Off: exactly what was heard.',
  light: 'Light: fillers and slips removed, your wording kept.',
  medium: 'Medium: fillers removed, grammar and punctuation polished.',
};
const LEVELS: Level[] = ['off', 'light', 'medium'];
const delay = (d: string) => ({ '--d': d }) as CSSProperties;

export default function Cleanup() {
  const [level, setLevel] = useState<Level>('off');
  const [stagger, setStagger] = useState(false);
  const [shown, setShown] = useState<Level>('off');
  const [fade, setFade] = useState(false);
  const section = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const current = useRef<Level>('off');
  const pinned = useRef(false);
  const played = useRef(false);

  function choose(l: Level, slow: boolean) {
    if (l === current.current) return;
    current.current = l;
    setStagger(slow); setLevel(l); setFade(true);
    window.setTimeout(() => { setShown(l); setFade(false); }, slow ? 1000 : 220);
  }

  // Phones and reduced motion: the Medium edits play once when the card comes into view.
  useOnScreen(box, v => {
    if (!v || played.current || pinned.current) return;
    played.current = true;
    window.setTimeout(() => choose('medium', !reducedMotion()), 350);
  }, .35);

  // Desktop: the card holds still while you scroll, and the scroll steps it from Off to Light to Medium.
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ ...MQ, tall: '(min-height: 700px)' }, ctx => {
      const { motion, fine, tall } = ctx.conditions as Conditions & { tall: boolean };
      if (!motion || !fine || !tall || lite()) return;
      pinned.current = true;
      const st = ScrollTrigger.create({
        trigger: box.current, start: 'center 52%', end: '+=90%', pin: true, anticipatePin: 1,
        onUpdate: self => choose(LEVELS[Math.min(2, Math.floor(self.progress * 3.2))], false),
      });
      return () => { pinned.current = false; st.kill(); };
    });
  }, { scope: section });

  // What changed flips into place: recapitalized letters turn over, and the typed line rolls in word by word.
  useGSAP(() => {
    const changed = gsap.utils.toArray<HTMLElement>('.said .t.chg', section.current);
    if (reducedMotion() || !changed.length) return;
    gsap.fromTo(changed, { rotationX: -100 }, { rotationX: 0, duration: .55, ease: 'back.out(2)', transformPerspective: 500, clearProps: 'transform' });
  }, { scope: section, dependencies: [level] });
  useGSAP(() => {
    if (reducedMotion()) return;
    gsap.from('.out .ow', { yPercent: 60, rotationX: -70, opacity: 0, transformOrigin: '50% 100%', transformPerspective: 600, duration: .55, ease: 'power3.out', stagger: .035, clearProps: 'transform' });
  }, { scope: section, dependencies: [shown] });

  let k = 0;
  const words = SAID.map((p, i) => {
    if (typeof p === 'string') return p;
    const cut = !!p.cut?.includes(level), d = stagger && cut ? `${k++ * .22}s` : '0s';
    const text = p.as ? p.as[level] : p.t, changed = !!p.as && p.as[level] !== p.as.off;
    const token = <span className={`t${cut ? ' x' : ''}${changed ? ' chg' : ''}`} style={delay(d)}>{text}</span>;
    if (!p.tag) return <Fragment key={i}>{token}</Fragment>;
    return (
      <span key={i} className={`grp${cut ? ' x' : ''}`} style={delay(d)}>
        <span className={`tag${p.tag === 'filler' ? ' tf' : ''}`}>{p.tag}</span>{token}
      </span>
    );
  });

  return (
    <section className="sec light" id="edits" ref={section}>
      <div className="wrap">
        <Head n="01" label="Cleanup" title="Say it messy." soft="It types it clean.">
          <p className="lead rv d2">Ums and uhs drop out. Say “no wait” and only the correction stays. Capitals and punctuation go in. You choose how much it edits.</p>
        </Head>
        {/* The pin goes on this plain wrapper: the card inside has a reveal transform, which would throw off the pin's measurements. */}
        <div className="diffpin" ref={box}>
        <div className="diff rv">
          <div className="dtop">
            <p className="eyebrow">What you said</p>
            <div className="seg" role="group" aria-label="How much it edits">
              {LEVELS.map(l => (
                <button key={l} aria-pressed={level === l} onClick={() => choose(l, false)}>{l[0].toUpperCase() + l.slice(1)}</button>
              ))}
            </div>
          </div>
          <p className="said">
            {words}
            <span className="nw">after<span className={`t ins${level !== 'off' ? ' chg' : ''}`}>{level === 'off' ? '' : '.'}</span></span>
          </p>
          <div className="drule"><p className="eyebrow">What gets typed</p></div>
          <p className={`out${fade ? ' fade' : ''}`}>
            {OUT[shown].split(' ').map((w, i) => <Fragment key={`${shown}${i}`}>{i > 0 && ' '}<span className="ow">{w}</span></Fragment>)}
          </p>
          <p className="ldesc">{DESC[level]}</p>
        </div>
        </div>
      </div>
    </section>
  );
}
