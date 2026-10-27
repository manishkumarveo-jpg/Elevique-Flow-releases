'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { BASE, reducedMotion } from '@/lib/site';
import { useOnScreen } from './client';
import { Head } from './ui';

type Style = 'formal' | 'casual' | 'veryCasual' | 'excited';
const NAMES: Record<Style, string> = { formal: 'Formal', casual: 'Casual', veryCasual: 'Very casual', excited: 'Excited!' };

// Kinds of app, their styles and default (AppCategory), and the Style page's own samples.
const APPS: { id: string; name: string; icon: string; logo: string; color: string; title: string; styles: Style[]; def: Style; text: Partial<Record<Style, string>> }[] = [
  { id: 'messaging', name: 'Messages', icon: 'chat', logo: 'whatsapp-icon', color: '#fff', title: 'Sam', styles: ['formal', 'casual', 'veryCasual'], def: 'casual',
    text: { formal: "Sounds good! I'll send the deck tonight. Talk tomorrow.", casual: "Sounds good! I'll send the deck tonight, talk tomorrow", veryCasual: "sounds good i'll send the deck tonight talk tomorrow" } },
  { id: 'workChat', name: 'Work chat', icon: 'hash', logo: 'slack-icon', color: '#fff', title: '# launch', styles: ['formal', 'casual', 'excited'], def: 'casual',
    text: { formal: "Hey, if you have a minute, let's go over the launch numbers.", casual: "Hey, if you have a minute let's go over the launch numbers", excited: "Hey, if you have a minute, let's go over the launch numbers!" } },
  { id: 'email', name: 'Email', icon: 'mail', logo: 'google-gmail', color: '#fff', title: 'New message', styles: ['formal', 'casual', 'excited'], def: 'formal',
    text: { formal: "Hi Alex,\n\nThanks for the call today. I'll send the revised plan by Friday.\n\nBest,\nSam", casual: "Hi Alex, thanks for the call today. I'll send the revised plan by Friday\n\nBest,\nSam", excited: "Hi Alex,\n\nThanks for the call today! I'll send the revised plan by Friday!\n\nBest,\nSam" } },
  { id: 'code', name: 'Code', icon: 'code', logo: 'visual-studio-code', color: '#fff', title: 'api.ts', styles: ['formal', 'casual', 'veryCasual'], def: 'formal',
    text: { formal: 'Add a retry when the request times out, and log the error.', casual: 'Add a retry when the request times out and log the error', veryCasual: 'add a retry when the request times out and log the error' } },
  { id: 'terminal', name: 'Terminal', icon: 'term', logo: 'terminal-dark', color: '#fff', title: 'zsh', styles: ['formal', 'casual', 'veryCasual'], def: 'casual',
    text: { formal: 'Run the tests and fix any failures in the parser.', casual: 'Run the tests and fix any failures in the parser', veryCasual: 'run the tests and fix any failures in the parser' } },
  { id: 'other', name: 'Everything else', icon: 'doc', logo: 'notion-icon', color: '#fff', title: 'Q4 plan', styles: ['formal', 'casual', 'veryCasual'], def: 'formal',
    text: { formal: "The draft is ready for review. I've added the new figures.", casual: "The draft is ready for review, I've added the new figures", veryCasual: "the draft is ready for review i've added the new figures" } },
];

const words = (text: string) => text.split(/\s+/).filter(Boolean);

/** Which words of `next` aren't in `prev` (a longest-common-subsequence diff), so only those flip when the style changes. */
function changed(prev: string[], next: string[]) {
  const L = Array.from({ length: prev.length + 1 }, () => new Array<number>(next.length + 1).fill(0));
  for (let i = prev.length - 1; i >= 0; i--)
    for (let j = next.length - 1; j >= 0; j--)
      L[i][j] = prev[i] === next[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const same = new Set<number>();
  for (let i = 0, j = 0; i < prev.length && j < next.length;) {
    if (prev[i] === next[j]) { same.add(j); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
  }
  return new Set(next.map((_, j) => j).filter(j => !same.has(j)));
}

/** The text as words (spaces and line breaks kept as text), with the changed ones marked to flip in. */
function Words({ text, fresh }: { text: string; fresh: Set<number> }) {
  let w = -1;
  return <>{text.split(/(\s+)/).map((part, i) => /^\s*$/.test(part) ? part : <span key={i} className={fresh.has(++w) ? 'sw nw' : 'sw'}>{part}</span>)}</>;
}

/** The app's window around the dictated text. */
function Window({ id, sample }: { id: string; sample: (className: string) => ReactNode }) {
  switch (id) {
    case 'messaging':
      return <><p className="day">Today</p><div className="bin">Did the client like the deck?</div><div className="bin">Are we still on for tomorrow?</div>{sample('bout')}</>;
    case 'workChat':
      return (
        <>
          <p className="day">Today</p>
          <div className="crow"><i className="av">J</i><div><p className="who">Jonas<time>10:38</time></p><p>QA is done with the parser 🎉</p></div></div>
          <div className="crow"><i className="av">M</i><div><p className="who">Maya<time>10:41</time></p><p>Launch numbers are in 📈</p></div></div>
          <div className="crow"><i className="av me">S</i><div><p className="who">Sam<time>10:42</time></p>{sample('')}</div></div>
        </>
      );
    case 'email':
      return <><div className="ef"><span>To</span>Alex Kim</div><div className="ef"><span>Subject</span>Today&apos;s call</div>{sample('ebody')}</>;
    case 'code':
      return (
        <div className="ide">
          <pre className="src"><b>export async function</b> fetchUser(id) {'{'}{'\n'}  <b>const</b> res = <b>await</b> fetch(&quot;/api/users/&quot; + id);{'\n'}  <b>if</b> (!res.ok) <b>throw new</b> Error(res.status);{'\n'}  <b>return</b> res.json();{'\n'}{'}'}{'\n\n'}<b>export function</b> retry(fn, times = 3) {'{'}{'\n'}  <b>{'// …'}</b>{'\n'}{'}'}</pre>
          <div className="ask"><p className="meta">Assistant</p>{sample('prompt')}</div>
        </div>
      );
    case 'terminal':
      return <div className="term"><p className="dim">~/parser on main</p><p><span className="pr">❯</span> {sample('')}<i className="caret" /></p></div>;
    default:
      return <div className="doc"><h4>Q4 plan</h4>{sample('')}<div className="ln" /><div className="ln s" /></div>;
  }
}

export default function Styles() {
  const [app, setApp] = useState(0);
  const [style, setStyle] = useState<Style>(APPS[0].def);
  const [fresh, setFresh] = useState<Set<number>>(new Set());
  const [auto, setAuto] = useState(true);
  const [tick, setTick] = useState(0); // restarts the progress bar
  const section = useRef<HTMLElement>(null);
  const inView = useRef(false);
  const current = useRef(0);
  const shownApp = useRef(-1);
  const a = APPS[app];
  const text = a.text[style] ?? a.text[a.def]!;

  const open = (i: number) => { current.current = i; setApp(i); setStyle(APPS[i].def); setFresh(new Set()); };
  useEffect(() => { if (reducedMotion()) setAuto(false); }, []);
  useOnScreen(section, v => { inView.current = v; });
  // Like holding ⌘ and pressing Tab: moves to the next kind of app until you pick one.
  useEffect(() => {
    if (!auto) return;
    const t = window.setInterval(() => {
      if (!inView.current) return;
      open((current.current + 1) % APPS.length);
      setTick(x => x + 1);
    }, 3600);
    return () => clearInterval(t);
  }, [auto]);

  const show = (i: number) => { setAuto(false); open(i); };
  const pick = (s: Style) => {
    if (s === style) return;
    setAuto(false);
    setFresh(changed(words(text), words(a.text[s]!)));
    setStyle(s);
  };

  // A new app's window swings in from the stack; a new style turns over only the words that changed.
  useGSAP(() => {
    if (reducedMotion()) { shownApp.current = app; return; }
    if (shownApp.current !== -1 && shownApp.current !== app) {
      gsap.fromTo('.appwin', { rotationY: 26, x: 70, z: -140, opacity: 0, transformPerspective: 1600 },
        { rotationY: 0, x: 0, z: 0, opacity: 1, duration: .7, ease: 'power3.out', clearProps: 'transform' });
    }
    shownApp.current = app;
  }, { scope: section, dependencies: [app] });
  useGSAP(() => {
    const flip = gsap.utils.toArray<HTMLElement>('.sample .nw', section.current);
    if (reducedMotion() || !flip.length) return;
    gsap.from(flip, { rotationX: -90, opacity: 0, transformPerspective: 420, transformOrigin: '50% 60%', duration: .5, ease: 'back.out(1.7)', stagger: .04, clearProps: 'transform' });
  }, { scope: section, dependencies: [style, app] });

  const sample = (className: string) => {
    const Tag = a.id === 'terminal' || a.id === 'workChat' ? 'span' : 'div';
    return <Tag className={`${className} sample`.trim()}><Words text={text} fresh={fresh} /></Tag>;
  };

  return (
    <section className="sec dark" id="apps" ref={section}>
      <div className="wrap">
        <Head n="02" label="Styles" title="Every app gets" soft="its own style.">
          <p className="lead rv d2">Relaxed in chats, polished in email, exact in code and terminals. Pick a style once for each kind of app. Elevique Flow knows which one you&apos;re in.</p>
        </Head>
        <div className="rv">
          <div className="switch" role="tablist" aria-label="Kinds of app">
            {APPS.map((x, i) => (
              <button key={x.id} className="tile2" role="tab" aria-selected={i === app} onClick={() => show(i)}>
                <span className="ic"><img src={`${BASE}/apps/${x.logo}.svg`} alt="" /></span>{x.name}
              </button>
            ))}
          </div>
          <div className="prog" style={{ opacity: auto ? 1 : 0 }}>{auto && <i key={tick} className="run" />}</div>
          <div className="appstage">
            <div className="stylebar">
              <p className="meta">Style for {a.name.toLowerCase()}</p>
              <div className="seg dk" role="group" aria-label="Style">
                {a.styles.map(s => <button key={s} aria-pressed={s === style} onClick={() => pick(s)}>{NAMES[s]}</button>)}
              </div>
            </div>
            <div className="deck">
              <i className="ghost g2" aria-hidden="true" /><i className="ghost g1" aria-hidden="true" />
              <div className="appwin">
                <div className="wbar"><i /><i /><i /><span>{a.title}</span></div>
                <div className={`abody b-${a.id}`}><Window id={a.id} sample={sample} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
