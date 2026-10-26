'use client';
import { Fragment, useRef, useState, type CSSProperties } from 'react';
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
const delay = (d: string) => ({ '--d': d }) as CSSProperties;

export default function Cleanup() {
  const [level, setLevel] = useState<Level>('off');
  const [stagger, setStagger] = useState(false);
  const [shown, setShown] = useState<Level>('off');
  const [fade, setFade] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  function choose(l: Level, slow: boolean) {
    setStagger(slow); setLevel(l); setFade(true);
    window.setTimeout(() => { setShown(l); setFade(false); }, slow ? 1000 : 220);
  }
  // The first time the card is in view, the Medium edits apply one by one.
  useOnScreen(box, v => {
    if (!v || played.current) return;
    played.current = true;
    window.setTimeout(() => choose('medium', !reducedMotion()), 350);
  }, .35);

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
    <section className="sec light" id="edits">
      <div className="wrap">
        <Head n="01" label="Cleanup" title="Say it messy." soft="It types it clean.">
          <p className="lead rv d2">Ums and uhs drop out. Say “no wait” and only the correction stays. Capitals and punctuation go in. You choose how much it edits.</p>
        </Head>
        <div className="diff rv" ref={box}>
          <div className="dtop">
            <p className="eyebrow">What you said</p>
            <div className="seg" role="group" aria-label="How much it edits">
              {(['off', 'light', 'medium'] as Level[]).map(l => (
                <button key={l} aria-pressed={level === l} onClick={() => choose(l, false)}>{l[0].toUpperCase() + l.slice(1)}</button>
              ))}
            </div>
          </div>
          <p className="said">
            {words}
            <span className="nw">after<span className={`t ins${level !== 'off' ? ' chg' : ''}`}>{level === 'off' ? '' : '.'}</span></span>
          </p>
          <div className="drule"><p className="eyebrow">What gets typed</p></div>
          <p className={`out${fade ? ' fade' : ''}`}>{OUT[shown]}</p>
          <p className="ldesc">{DESC[level]}</p>
        </div>
      </div>
    </section>
  );
}
