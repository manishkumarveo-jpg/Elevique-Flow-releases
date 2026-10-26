'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { hash, reducedMotion } from '@/lib/site';
import { useOnScreen } from './client';
import { Head } from './ui';

const g = (x: number, c: number, w: number) => Math.exp(-(((x - c) / w) ** 2));

// Replies from the Style page's tone examples; the voice shapes are illustrative.
const MOODS: { em: string; name: string; in: string; out: ReactNode; heard: string; env: (x: number) => number; amp: number; sp: number; jag: number }[] = [
  { em: '😤', name: 'Angry', in: 'Running late, start dinner without me?', out: <>We booked this table <b>TWO WEEKS</b> ago!! 😤</>,
    heard: 'Louder and sharper than usual · leaned on “two weeks”', env: x => .4 + .6 * g(x, .45, .1) + .45 * g(x, .62, .08), amp: 1, sp: 9, jag: .5 },
  { em: '💔', name: 'Sad', in: "We can't make it for your birthday.", out: <>It&apos;s okay… I understand 💔</>,
    heard: 'Quieter and slower than usual · pitch falling', env: x => .34 * (1 - .55 * x), amp: .8, sp: 2.4, jag: .06 },
  { em: '🎉', name: 'Excited', in: 'I got the job!!', out: <>No <b>WAY</b>!! I knew you would get it 🎉🥳</>,
    heard: 'Higher and faster than usual · leaned on “no way”', env: x => .45 + .55 * g(x, .14, .1) + .22 * Math.sin(x * 13) ** 2, amp: .95, sp: 7, jag: .3 },
  { em: '😂', name: 'Funny', in: 'I replied-all with my grocery list.', out: <>Haha that&apos;s hilarious 😂😂</>,
    heard: 'Laughing · bright, bouncing pitch', env: x => .2 + .62 * Math.max(0, Math.sin(x * Math.PI * 7)) ** 3, amp: .85, sp: 5, jag: .15 },
  { em: '🙄', name: 'Sarcastic', in: 'Can we add one more sync this week?', out: <>Oh great, another meeting 🙄</>,
    heard: 'Flat and drawn out · slower than usual', env: x => .3 + .12 * Math.sin(x * 3), amp: .75, sp: 2, jag: .04 },
];
const N = 64;

export default function Tone() {
  const [mood, setMood] = useState(0);
  const [shown, setShown] = useState(0);
  const [swapIn, setSwapIn] = useState(false);
  const [swapOut, setSwapOut] = useState(false);
  const [auto, setAuto] = useState(true);
  const section = useRef<HTMLElement>(null);
  const bars = useRef<(HTMLElement | null)[]>([]);
  const cur = useRef(new Array(N).fill(.05));
  const live = useRef({ mood: 0, visible: false, raf: 0 });

  // The bars follow the current mood's voice shape, eased so a change of mood morphs rather than jumps.
  const draw = (s: number, ease: number) => {
    const m = MOODS[live.current.mood];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1), wob = .55 + .45 * Math.sin(s * m.sp + i * 1.7) * Math.sin(s * m.sp * .53 + i * .41);
      const target = Math.max(.04, Math.min(1, m.env(x) * m.amp * wob + m.jag * (hash(i * 3 + Math.floor(s * 14)) - .5)));
      cur.current[i] += (target - cur.current[i]) * ease;
      const b = bars.current[i];
      if (b) b.style.height = cur.current[i] * 100 + '%';
    }
  };
  useOnScreen(section, v => {
    const l = live.current;
    l.visible = v;
    if (reducedMotion()) { draw(1, 1); return; }
    const frame = (t: number) => { draw(t / 1000, .18); l.raf = requestAnimationFrame(frame); };
    if (v && !l.raf) l.raf = requestAnimationFrame(frame);
    if (!v) { cancelAnimationFrame(l.raf); l.raf = 0; }
  });
  useEffect(() => () => cancelAnimationFrame(live.current.raf), []);

  function pick(i: number) {
    setMood(i); live.current.mood = i; setSwapIn(true); setSwapOut(true);
    window.setTimeout(() => { setShown(i); setSwapIn(false); window.setTimeout(() => setSwapOut(false), 260); }, 200);
    if (reducedMotion()) draw(1, 1);
  }
  useEffect(() => { if (reducedMotion()) setAuto(false); }, []);
  useEffect(() => {
    if (!auto) return;
    const t = window.setInterval(() => { if (live.current.visible) pick((live.current.mood + 1) % MOODS.length); }, 4000);
    return () => clearInterval(t);
  }, [auto]);

  const m = MOODS[shown];
  return (
    <section className="sec light" id="tone" ref={section}>
      <div className="wrap">
        <Head n="03" label="Tone of voice" title="It hears how" soft="you said it.">
          <p className="lead rv d2">Your Mac measures your voice (loudness, pitch, pace, the words you lean on) against how you usually sound. Then your message shows it: capitals where you stressed, the right punctuation, an emoji you&apos;d actually use.</p>
        </Head>
        <div className="tone rv">
          <div className="moods" role="group" aria-label="How you said it">
            {MOODS.map((x, i) => (
              <button key={x.name} className="mood" aria-pressed={i === mood} onClick={() => { setAuto(false); pick(i); }}>
                <span>{x.em}</span>{x.name}
              </button>
            ))}
          </div>
          <div className="voice">
            <p className="eyebrow">Your voice</p>
            <div className="tbars" aria-hidden="true">{Array.from({ length: N }, (_, i) => <i key={i} ref={el => { bars.current[i] = el; }} />)}</div>
            <p className="heard" aria-live="polite"><b>Heard</b> · {m.heard}</p>
          </div>
          <div className="tchat">
            <p className="eyebrow">Personal messages</p>
            <div className={`tin${swapIn ? ' swap' : ''}`}>{m.in}</div>
            <div className={`tout${swapOut ? ' swap' : ''}`}>{m.out}</div>
          </div>
        </div>
        <p className="note2 rv">On for personal messages, never in code or terminals. When it isn&apos;t sure, your text stays neutral.</p>
      </div>
    </section>
  );
}
