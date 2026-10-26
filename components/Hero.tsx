'use client';
import { useEffect, useRef, useState } from 'react';
import { hash, reducedMotion } from '@/lib/site';
import { Icon, DownloadButton } from './ui';

// What you say while holding the key, and what lands in the box (cleanup at Medium).
const PHRASES = [
  { raw: 'um so i think we should uh move the launch to next week no wait the week after', out: 'I think we should move the launch to the week after.' },
  { raw: 'can you uh send me the deck by friday and like the numbers too', out: 'Can you send me the deck by Friday, and the numbers too?' },
  { raw: 'so the beta numbers look good actually really good', out: 'The beta numbers look good. Actually, really good!' },
];
const FILLERS = new Set(['um', 'uh', 'like']);
const START = [
  { id: 1, who: 'Maya', av: 'M', time: '10:41', text: 'Beta looks solid. When are we launching?', me: false },
  { id: 2, who: 'Jonas', av: 'J', time: '10:42', text: 'QA still needs a few days on the parser.', me: false },
];
const READOUT = ['fn down', 'fn up', 'cleaning up', 'typed · 0.6 s'];
const IDLE_HINT: [string, string] = ['Hold the key to talk', 'Like fn on your Mac'];

type PillState = 'idle' | 'listen' | 'work';

/** The window, the pill and an fn key you can hold: press, talk, let go, and the clean text lands, like the app. */
function Demo() {
  const [pill, setPill] = useState<PillState>('idle');
  const [hint, setHint] = useState(IDLE_HINT);
  const [step, setStep] = useState(-1);
  const [said, setSaid] = useState<string[]>([]);
  const [caption, setCaption] = useState(false);
  const [typed, setTyped] = useState<{ text: string; n: number } | null>(null);
  const [msgs, setMsgs] = useState(START);
  const [down, setDown] = useState(false);
  const [invite, setInvite] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  const bars = useRef<(HTMLElement | null)[]>([]);
  const key = useRef({ down() {}, up() {} });

  useEffect(() => {
    const rm = reducedMotion();
    let state: 'idle' | 'listen' | 'flush' | 'work' | 'landed' = 'idle';
    let n = 0, words: string[] = [], wi = 0, downAt = 0, raf = 0, talking = false, nextId = 3;
    let auto = !rm, byAuto = false, visible = false;
    let wt = 0, at = 0, tAuto = 0, tResume = 0;

    const loop = (t: number) => {
      const s = t / 1000;
      bars.current.forEach((b, i) => {
        if (!b) return;
        const v = talking ? .3 + .7 * Math.abs(Math.sin(s * 8.3 + i * 1.3) * Math.sin(s * 3.7 + i * .6)) : .06;
        b.style.height = 5 + v * 24 + 'px';
      });
      raf = requestAnimationFrame(loop);
    };
    const waveOn = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const waveOff = () => { cancelAnimationFrame(raf); raf = 0; };

    function press(fromAuto: boolean) {
      if (state !== 'idle') return;
      byAuto = fromAuto; state = 'listen'; downAt = performance.now();
      setDown(true); setPill('listen'); talking = true; waveOn();
      words = PHRASES[n % PHRASES.length].raw.split(' '); wi = 0; setSaid([]);
      setCaption(true); setHint(['Listening…', 'Let go to type it']); setStep(0);
      wt = window.setTimeout(say, 260);
    }
    function say() {
      if (wi >= words.length) { talking = false; if (state === 'flush') work(); return; }
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
    function idle() { state = 'idle'; talking = false; waveOff(); setPill('idle'); setCaption(false); setStep(-1); }
    function work() {
      state = 'work'; talking = false; waveOff(); setPill('work'); setStep(2);
      setHint(['Cleaning up…', 'Fillers out, punctuation in']);
      wt = window.setTimeout(land, 480);
    }
    function land() {
      const p = PHRASES[n++ % PHRASES.length];
      state = 'landed'; setPill('idle'); setCaption(false);
      setTyped({ text: p.out, n }); setHint(['Typed.', '0.6 s after you let go']); setStep(3);
      wt = window.setTimeout(() => send(p.out), 1400);
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

    const io = new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; }), { threshold: .1 });
    if (stage.current) io.observe(stage.current);
    if (auto) tAuto = window.setTimeout(autoGo, 1600);
    return () => { io.disconnect(); waveOff(); [wt, at, tAuto, tResume].forEach(t => clearTimeout(t)); };
  }, []);

  return (
    <div className="stage rv d2" id="try" ref={stage}>
      <div className="win">
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
          <p id="capw">{said.map((w, i) => <span key={i} className={FILLERS.has(w) ? 'f' : undefined}>{w} </span>)}</p>
        </div>
        <div className={`comp${typed ? ' got' : ''}`}>
          <span className={typed ? 'typed flash' : 'typed'} id="typed" key={typed?.n ?? 0}>{typed?.text}</span>
          <i className="caret" />
          {!typed && <span className="ph">Message #launch</span>}
        </div>
      </div>
      <div className="pill" id="pill" data-s={pill} aria-hidden="true">
        <div className="cap">
          <span className="handle">{[3, 5, 7, 5, 3].map((h, i) => <i key={i} style={{ height: h }} />)}</span>
          <span className="wave">{Array.from({ length: 12 }, (_, i) => <i key={i} ref={el => { bars.current[i] = el; }} />)}</span>
          <span className="dots"><i /><i /><i /></span>
        </div>
      </div>
      <div className="keyrow">
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
      <div className="readout" id="readout" aria-hidden="true">
        {READOUT.map((r, i) => <span key={r} className={i <= step ? 'on' : undefined}>{r}</span>)}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hgrid">
        <div>
          <p className="eyebrow rv">Voice dictation for Mac</p>
          <h1 className="rv d1">Talk anywhere<br /><span className="grad">you type.</span></h1>
          <p className="lead rv d2">Hold <kbd>fn</kbd> and speak. Let go, and clean, punctuated text lands in whatever app you&apos;re in, about 0.6 seconds later.</p>
          <div className="cta rv d3">
            <DownloadButton />
            <a className="tryl" href="#try">Try it right here<Icon name="arrow" /></a>
          </div>
          <p className="meta rv d3">Free · Your own Groq key · macOS 13+ · Apple Silicon &amp; Intel</p>
        </div>
        <Demo />
      </div>
      <div className="wrap">
        <div className="facts rv">
          <div><b>0.6 s</b><span>From letting go to text</span></div>
          <div><b>Any app</b><span>Browsers and terminals too</span></div>
          <div><b>Free</b><span>On your own Groq key</span></div>
          <div><b>No account</b><span>And no Elevique servers</span></div>
        </div>
      </div>
    </section>
  );
}
