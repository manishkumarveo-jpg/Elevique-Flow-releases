'use client';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap, lite, MQ, useGSAP, type Conditions } from '@/lib/gsap';
import { hash, reducedMotion } from '@/lib/site';
import { Icon, DownloadButton, MarkPieces } from './ui';

// What you say while holding the key, which spoken words the cleanup drops (fillers and the "no wait" correction),
// and what lands in the box (cleanup at Medium). The kept words map one-to-one onto the typed ones.
const PHRASES = [
  { raw: 'um so i think we should uh move the launch to next week no wait the week after', drop: [0, 1, 6, 11, 12, 13, 14],
    out: 'I think we should move the launch to the week after.' },
  { raw: 'can you uh send me the deck by friday and like the numbers too', drop: [2, 10],
    out: 'Can you send me the deck by Friday, and the numbers too?' },
  { raw: 'so the beta numbers look good actually really good', drop: [0],
    out: 'The beta numbers look good. Actually, really good!' },
];
const FILLERS = new Set(['um', 'uh', 'like']);
const START = [
  { id: 1, who: 'Maya', av: 'M', time: '10:41', text: 'Beta looks solid. When are we launching?', me: false },
  { id: 2, who: 'Jonas', av: 'J', time: '10:42', text: 'QA still needs a few days on the parser.', me: false },
];
const READOUT = ['fn down', 'fn up', 'cleaning up', 'typed · 0.6 s'];
const IDLE_HINT: [string, string] = ['Hold the key to talk', 'Like fn on your Mac'];
const delay = (s: number) => ({ '--dl': `${s}s` }) as CSSProperties;

type PillState = 'idle' | 'listen' | 'work';
type Typed = { text: string; n: number; drop: number[] };

/** The window, the pill and an fn key you can hold: press, talk, let go, and the clean text lands, like the app. */
function Demo() {
  const [pill, setPill] = useState<PillState>('idle');
  const [hint, setHint] = useState(IDLE_HINT);
  const [step, setStep] = useState(-1);
  const [said, setSaid] = useState<string[]>([]);
  const [caption, setCaption] = useState(false);
  const [typed, setTyped] = useState<Typed | null>(null);
  const [msgs, setMsgs] = useState(START);
  const [down, setDown] = useState(false);
  const [invite, setInvite] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  const away = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLParagraphElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const key = useRef({ down() {}, up() {} });

  // The dictation itself: a small state machine on timers, driven by the key or by the auto demo.
  useEffect(() => {
    const rm = reducedMotion();
    let state: 'idle' | 'listen' | 'flush' | 'work' | 'landed' = 'idle';
    let n = 0, words: string[] = [], wi = 0, downAt = 0, nextId = 3;
    let auto = !rm, byAuto = false, visible = false;
    let wt = 0, at = 0, tAuto = 0, tResume = 0;
    // The pill's level meter is a CSS animation while it listens (see .wave i); `quiet` settles it once the words run out.
    const pillEl = stage.current?.querySelector<HTMLElement>('.pill');
    const quiet = (q: boolean) => pillEl?.classList.toggle('quiet', q);

    function press(fromAuto: boolean) {
      if (state !== 'idle') return;
      byAuto = fromAuto; state = 'listen'; downAt = performance.now();
      setDown(true); setPill('listen'); quiet(false);
      words = PHRASES[n % PHRASES.length].raw.split(' '); wi = 0; setSaid([]);
      setCaption(true); setHint(['Listening…', 'Let go to type it']); setStep(0);
      wt = window.setTimeout(say, 260);
    }
    function say() {
      if (wi >= words.length) { quiet(true); if (state === 'flush') work(); return; }
      const w = words[wi++];
      setSaid(s => [...s, w]);
      wt = window.setTimeout(say, state === 'flush' ? 40 : 170 + hash(wi + n * 7) * 110);
    }
    function release() {
      if (state !== 'listen') return;
      setDown(false);
      if (performance.now() - downAt < 300) { // like the app: a tap under 0.3 s does nothing
        clearTimeout(wt); idle(); setHint(['Hold it down', 'A quick tap does nothing']); return;
      }
      setStep(1);
      if (wi < words.length) state = 'flush'; else work();
    }
    function idle() { state = 'idle'; setPill('idle'); setCaption(false); setStep(-1); }
    function work() {
      state = 'work'; setPill('work'); setStep(2);
      setHint(['Cleaning up…', 'Fillers out, punctuation in']);
      wt = window.setTimeout(land, 480);
    }
    function land() {
      const p = PHRASES[n++ % PHRASES.length];
      state = 'landed'; setPill('idle'); setCaption(false);
      setTyped({ text: p.out, n, drop: p.drop }); setHint(['Typed.', '0.6 s after you let go']); setStep(3);
      wt = window.setTimeout(() => send(p.out), 1500);
    }
    function send(text: string) {
      const id = nextId++;
      setMsgs(m => [...m, { id, who: 'You', av: 'You', time: 'now', text, me: true }].slice(-3));
      setTyped(null); state = 'idle'; setStep(-1); setHint(IDLE_HINT);
      if (auto) tAuto = window.setTimeout(autoGo, 2400);
      else { clearTimeout(tResume); tResume = window.setTimeout(() => { auto = !rm; autoGo(); }, 15000); }
    }
    function autoGo() {
      if (!auto) return;
      if (!visible || document.hidden || state !== 'idle') { tAuto = window.setTimeout(autoGo, 1200); return; }
      press(true);
      at = window.setTimeout(() => { if (byAuto) release(); }, 260 + words.length * 225 + 500);
    }
    key.current = {
      down() {
        auto = false; clearTimeout(tAuto); clearTimeout(tResume); setInvite(false);
        if (state === 'idle') press(false);
      },
      up() { if (state === 'listen' && !byAuto) release(); },
    };

    // Off screen, the scene goes flat (no 3D layers) and its endless loops pause.
    const io = new IntersectionObserver(es => es.forEach(e => {
      visible = e.isIntersecting;
      stage.current?.querySelector('.stage3d')?.classList.toggle('flat', !visible);
    }), { threshold: .1 });
    if (stage.current) io.observe(stage.current);
    if (auto) tAuto = window.setTimeout(autoGo, 1900);
    return () => { io.disconnect(); [wt, at, tAuto, tResume].forEach(t => clearTimeout(t)); };
  }, []);

  // When the text lands: the dropped words fall away, and each kept word flies from the caption into its place in the box.
  useLayoutEffect(() => {
    if (!typed || reducedMotion() || !capRef.current || !typedRef.current) return;
    const spoken = [...capRef.current.querySelectorAll<HTMLElement>('span')];
    const out = [...typedRef.current.querySelectorAll<HTMLElement>('.tw')];
    const drop = new Set(typed.drop);
    const kept = spoken.filter((_, i) => !drop.has(i)), falling = spoken.filter((_, i) => drop.has(i));
    const from = kept.map(w => w.getBoundingClientRect()), to = out.map(w => w.getBoundingClientRect()); // read everything, then write
    const ctx = gsap.context(() => {
      gsap.set(kept, { opacity: 0 });
      gsap.to(falling, { y: () => gsap.utils.random(46, 90), rotation: () => gsap.utils.random(-50, 50), opacity: 0, duration: .7, ease: 'power2.in', stagger: .03 });
      out.forEach((w, i) => {
        const a = from[i], b = to[i];
        if (!a || !b) return;
        gsap.fromTo(w, { x: a.left - b.left, y: a.top - b.top, scale: a.height / b.height, transformOrigin: '0 0' },
          { x: 0, y: 0, scale: 1, duration: .62, ease: 'power3.inOut', delay: .08 + i * .022 });
      });
    });
    return () => ctx.revert();
  }, [typed]);

  // Depth: the scene tips back as you scroll past, and on a desktop it tilts toward your cursor.
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ, ctx => {
      const { motion, fine } = ctx.conditions as Conditions;
      if (!motion || lite()) return;
      // Once the hero has scrolled away it drops its transform, so it costs nothing further down the page.
      gsap.to(away.current, {
        rotationX: 14, scale: .9, yPercent: 6, transformPerspective: 1400, ease: 'none',
        scrollTrigger: {
          trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true,
          onLeave: () => { gsap.set(away.current, { clearProps: 'transform' }); },
        },
      });
      if (!fine) return;
      const rx = gsap.quickTo(tilt.current, 'rotationX', { duration: .9, ease: 'power3' });
      const ry = gsap.quickTo(tilt.current, 'rotationY', { duration: .9, ease: 'power3' });
      const hero = document.querySelector<HTMLElement>('.hero');
      const move = (e: PointerEvent) => { ry((e.clientX / innerWidth - .5) * 12); rx(-(e.clientY / innerHeight - .5) * 8); };
      const leave = () => { rx(0); ry(0); };
      hero?.addEventListener('pointermove', move);
      hero?.addEventListener('pointerleave', leave);
      return () => { hero?.removeEventListener('pointermove', move); hero?.removeEventListener('pointerleave', leave); };
    });
  }, { scope: stage });

  return (
    <div className="stage" id="try" ref={stage}>
      <div className="stage-away" ref={away}>
        <div className="stage3d" ref={tilt}>
          <div className="win intro-win">
            <div className="wbar"><i /><i /><i /><span># launch</span></div>
            <div className="msgs" id="msgs">
              {msgs.map(m => (
                <div className={`msg${m.me ? ' me' : ''}`} key={m.id}>
                  <i className="av">{m.av}</i>
                  <div><p className="who">{m.who}<time>{m.time}</time></p><p className="txt">{m.text}</p></div>
                </div>
              ))}
            </div>
            <div className={`caption${caption ? ' on' : ''}`} aria-hidden="true">
              <p className="eyebrow plain">You&apos;re saying</p>
              <p id="capw" ref={capRef}>{said.map((w, i) => <span key={i} className={FILLERS.has(w) ? 'f' : undefined}>{w}</span>)}</p>
            </div>
            <div className={`comp${typed ? ' got' : ''}`}>
              <span className={typed ? 'typed flash' : 'typed'} id="typed" ref={typedRef} key={typed?.n ?? 0}>
                {typed?.text.split(' ').map((w, i) => <span key={i}>{i > 0 && ' '}<span className="tw">{w}</span></span>)}
              </span>
              <i className="caret" />
              {!typed && <span className="ph">Message #launch</span>}
            </div>
          </div>
          <div className="pill intro-pill" id="pill" data-s={pill} aria-hidden="true">
            <div className="cap">
              <span className="handle">{[3, 5, 7, 5, 3].map((h, i) => <i key={i} style={{ height: h }} />)}</span>
              <span className="wave">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--i': i } as CSSProperties} />)}</span>
              <span className="dots"><i /><i /><i /></span>
            </div>
          </div>
          <div className="keyrow intro-key">
            <button
              id="fnkey"
              className={`fnkey${down ? ' down' : ''}${invite ? ' invite' : ''}`}
              aria-label="Hold to try a dictation"
              onPointerDown={e => { e.preventDefault(); try { e.currentTarget.setPointerCapture(e.pointerId); } catch {} key.current.down(); }}
              onPointerUp={() => key.current.up()}
              onPointerCancel={() => key.current.up()}
              onLostPointerCapture={() => key.current.up()}
              onKeyDown={e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); key.current.down(); } }}
              onKeyUp={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); key.current.up(); } }}
              onContextMenu={e => e.preventDefault()}
            >
              <span className="fn">fn</span><Icon name="globe" />
            </button>
            <p className="hint" id="hint" aria-live="polite"><b>{hint[0]}</b>{hint[1]}</p>
          </div>
          <div className="readout intro-read" id="readout" aria-hidden="true">
            {READOUT.map((r, i) => <span key={r} className={i <= step ? 'on' : undefined}>{r}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero" id="top">
      <MarkPieces className="hmark" />
      <div className="wrap hgrid">
        <div>
          <p className="eyebrow intro" style={delay(.05)}>Voice dictation for Mac</p>
          <h1>
            <span className="ln"><span style={delay(.12)}>Talk anywhere</span></span>
            <span className="ln"><span className="grad" style={delay(.24)}>you type.</span></span>
          </h1>
          <p className="lead intro" style={delay(.42)}>Hold <kbd>fn</kbd> and speak. Let go, and clean, punctuated text lands in whatever app you&apos;re in, about 0.6 seconds later.</p>
          <div className="cta intro" style={delay(.54)}>
            <DownloadButton />
            <a className="tryl" href="#try">Try it right here<Icon name="arrow" /></a>
          </div>
          <p className="meta intro" style={delay(.64)}>Free · Your own Groq key · macOS 13+ · Apple Silicon &amp; Intel</p>
        </div>
        <Demo />
      </div>
      <div className="wrap">
        <div className="facts rv">
          <div><b data-count="0.6">0.6 s</b><span>From letting go to text</span></div>
          <div><b>Any app</b><span>Browsers and terminals too</span></div>
          <div><b>Free</b><span>On your own Groq key</span></div>
          <div><b>No account</b><span>And no Elevique servers</span></div>
        </div>
      </div>
    </section>
  );
}
