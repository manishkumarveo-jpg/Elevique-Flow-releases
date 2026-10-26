'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { hash, reducedMotion } from '@/lib/site';
import { useOnScreen } from './client';
import { Head } from './ui';

const g = (x: number, c: number, w: number) => Math.exp(-(((x - c) / w) ** 2));
const Emo = ({ e }: { e: string }) => <span className="emo">{e}</span>;

type Mood = { em: string; name: string; in: string; out: ReactNode; heard: string; env: (x: number) => number; amp: number; sp: number; jag: number;
  enter: (el: HTMLElement) => gsap.core.Animation };

// Replies from the Style page's tone examples. The voice shapes are illustrative, and each mood arrives the way it sounds.
const MOODS: Mood[] = [
  { em: '😤', name: 'Angry', in: 'Running late, start dinner without me?', out: <>We booked this table <b>TWO WEEKS</b> ago!! <Emo e="😤" /></>,
    heard: 'Louder and sharper than usual · leaned on “two weeks”', env: x => .4 + .6 * g(x, .45, .1) + .45 * g(x, .62, .08), amp: 1, sp: 9, jag: .5,
    enter: el => gsap.timeline().from(el, { scale: .86, opacity: 0, duration: .22, ease: 'power4.out' })
      .to(el, { keyframes: { x: [0, -11, 10, -8, 6, -3, 0] }, duration: .5, ease: 'none' }, '<.05') },
  { em: '💔', name: 'Sad', in: "We can't make it for your birthday.", out: <>It&apos;s okay… I understand <Emo e="💔" /></>,
    heard: 'Quieter and slower than usual · pitch falling', env: x => .34 * (1 - .55 * x), amp: .8, sp: 2.4, jag: .06,
    enter: el => gsap.from(el, { y: -22, opacity: 0, duration: 1.5, ease: 'sine.out' }) },
  { em: '🎉', name: 'Excited', in: 'I got the job!!', out: <>No <b>WAY</b>!! I knew you would get it <Emo e="🎉🥳" /></>,
    heard: 'Higher and faster than usual · leaned on “no way”', env: x => .45 + .55 * g(x, .14, .1) + .22 * Math.sin(x * 13) ** 2, amp: .95, sp: 7, jag: .3,
    enter: el => gsap.from(el, { scale: .45, y: 24, opacity: 0, duration: 1.1, ease: 'elastic.out(1, .45)' }) },
  { em: '😂', name: 'Funny', in: 'I replied-all with my grocery list.', out: <>Haha that&apos;s hilarious <Emo e="😂😂" /></>,
    heard: 'Laughing · bright, bouncing pitch', env: x => .2 + .62 * Math.max(0, Math.sin(x * Math.PI * 7)) ** 3, amp: .85, sp: 5, jag: .15,
    enter: el => gsap.from(el, { y: -40, rotation: -6, opacity: 0, duration: .9, ease: 'bounce.out' }) },
  { em: '🙄', name: 'Sarcastic', in: 'Can we add one more sync this week?', out: <>Oh great, another meeting <Emo e="🙄" /></>,
    heard: 'Flat and drawn out · slower than usual', env: x => .3 + .12 * Math.sin(x * 3), amp: .75, sp: 2, jag: .04,
    enter: el => gsap.from(el, { x: 36, opacity: 0, duration: .8, ease: 'none' }) },
];
const N = 64;

export default function Tone() {
  const [mood, setMood] = useState(0);
  const [auto, setAuto] = useState(true);
  const section = useRef<HTMLElement>(null);
  const panel = useRef<HTMLCanvasElement>(null);
  const cur = useRef(new Array(N).fill(.05));
  const live = useRef({ mood: 0, visible: false, raf: 0 });

  // The bars follow the current mood's voice shape, eased so a change of mood morphs rather than jumps.
  // Drawn on a canvas: one draw per frame, and nothing for the page to restyle or lay out while you scroll.
  const draw = (s: number, ease: number) => {
    const m = MOODS[live.current.mood], c = panel.current, g2 = c?.getContext('2d');
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1), wob = .55 + .45 * Math.sin(s * m.sp + i * 1.7) * Math.sin(s * m.sp * .53 + i * .41);
      const target = Math.max(.04, Math.min(1, m.env(x) * m.amp * wob + m.jag * (hash(i * 3 + Math.floor(s * 14)) - .5)));
      cur.current[i] += (target - cur.current[i]) * ease;
    }
    if (!c || !g2) return;
    const W = c.width, H = c.height, step = W / N, bw = Math.max(1, step * .6);
    g2.clearRect(0, 0, W, H);
    g2.fillStyle = '#141414';
    for (let i = 0; i < N; i++) {
      const h = Math.max(2, cur.current[i] * H);
      g2.fillRect(i * step + (step - bw) / 2, (H - h) / 2, bw, h);
    }
  };
  // Keep the canvas sharp at its displayed size.
  useEffect(() => {
    const c = panel.current;
    if (!c) return;
    const fit = () => { const dpr = Math.min(2, window.devicePixelRatio || 1); c.width = Math.round(c.clientWidth * dpr); c.height = Math.round(c.clientHeight * dpr); draw(performance.now() / 1000, 1); };
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);
  useOnScreen(section, v => {
    const l = live.current;
    l.visible = v;
    if (reducedMotion()) { draw(1, 1); return; }
    const frame = (t: number) => { draw(t / 1000, .18); l.raf = requestAnimationFrame(frame); };
    if (v && !l.raf) l.raf = requestAnimationFrame(frame);
    if (!v) { cancelAnimationFrame(l.raf); l.raf = 0; }
    // the panel's slow turn is a CSS animation (compositor thread, no per-frame script); it pauses off screen
    section.current?.classList.toggle('off', !v);
  });
  useEffect(() => () => cancelAnimationFrame(live.current.raf), []);

  // Each reply arrives the way it was said; the emoji turns over.
  useGSAP(() => {
    const out = section.current?.querySelector<HTMLElement>('.tout'), inc = section.current?.querySelector<HTMLElement>('.tin');
    if (!out || !inc || reducedMotion()) return;
    gsap.from(inc, { y: 10, opacity: 0, duration: .35, ease: 'power2.out' });
    MOODS[mood].enter(out).delay(.25);
    gsap.from(out.querySelectorAll('.emo'), { rotationY: 180, scale: .4, transformPerspective: 400, duration: .7, ease: 'back.out(2)', delay: .45, clearProps: 'transform' });
  }, { scope: section, dependencies: [mood] });

  function pick(i: number) {
    live.current.mood = i;
    setMood(i);
    if (reducedMotion()) draw(1, 1);
  }
  useEffect(() => { if (reducedMotion()) setAuto(false); }, []);
  useEffect(() => {
    if (!auto) return;
    const t = window.setInterval(() => { if (live.current.visible) pick((live.current.mood + 1) % MOODS.length); }, 4000);
    return () => clearInterval(t);
  }, [auto]);

  const m = MOODS[mood];
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
            <div className="tstage"><canvas className="tbars" ref={panel} aria-hidden="true" /></div>
            <p className="heard" aria-live="polite"><b>Heard</b> · {m.heard}</p>
          </div>
          <div className="tchat">
            <p className="eyebrow">Personal messages</p>
            <div className="tin" key={`in${mood}`}>{m.in}</div>
            <div className="tout" key={`out${mood}`}>{m.out}</div>
          </div>
        </div>
        <p className="note2 rv">On for personal messages, never in code or terminals. When it isn&apos;t sure, your text stays neutral.</p>
      </div>
    </section>
  );
}
