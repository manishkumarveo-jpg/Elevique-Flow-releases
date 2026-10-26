'use client';
import { useEffect, useRef, useState } from 'react';
import { reducedMotion } from '@/lib/site';
import { useOnScreen } from './client';
import { Head, Icon } from './ui';

// Every shortcut the app listens for (Hotkey.swift), and the keys it lights up.
const SHORTCUTS = [
  { keys: ['fn'], name: 'Dictate', how: 'hold fn', what: 'Hold, speak, let go. Your words are typed wherever your cursor is.' },
  { keys: ['fn', 'space'], name: 'Hands-free', how: 'fn + space', what: 'For longer thoughts. Talk as long as you like, then tap fn to finish, or esc to cancel.' },
  { keys: ['fn', 'ctrl'], name: 'Command mode', how: 'hold fn + ⌃', what: 'Say what to do with your text. With something selected it rewrites it. With nothing selected it writes something new.', example: '“make this friendlier”' },
  { keys: ['fn', 'shift'], name: 'Translate', how: 'hold fn + ⇧', what: 'Speak Hindi or another Indian language, and English is typed.', example: 'मैं दस मिनट में पहुँच रहा हूँ → I’ll be there in ten minutes.' },
  { keys: ['ctrl', 'opt', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9'], name: 'Transforms', how: '⌃ ⌥ 1–9', what: 'Nine saved rewrites for selected text, one key each.', example: 'Make it concise · Fix grammar only · Friendlier · More formal · Turn into bullet points' },
  { keys: ['esc'], name: 'Cancel', how: 'esc', what: 'Changed your mind? Esc drops the dictation. It stays in your history, so you can still recover it.' },
  { keys: ['ropt'], name: 'No fn key?', how: 'right ⌥', what: 'On an external keyboard, switch the shortcut to Right Option in Settings → General.' },
];

type Key = { id?: string; legend?: string; top?: string; word?: string; cls?: string; globe?: boolean };
const ROWS: Key[][] = [
  [{ id: 'esc', word: 'esc', cls: 'w125' }, ...'123456789'.split('').map(d => ({ id: 'n' + d, legend: d })), { legend: '0', cls: 'dim' }, { word: 'delete', cls: 'fx dim' }],
  [{ id: 'shift', top: '⇧', word: 'shift', cls: 'w2' }, ...'ZXCVBNM'.split('').map(c => ({ legend: c, cls: 'dim' })), { top: '⇧', cls: 'fx dim' }],
  [{ id: 'fn', top: 'fn', globe: true }, { id: 'ctrl', top: '⌃', word: 'control' }, { id: 'opt', top: '⌥', word: 'option' }, { id: 'cmd', top: '⌘', word: 'command', cls: 'w125' },
    { id: 'space', cls: 'sp' }, { top: '⌘', word: 'command', cls: 'w125 dim' }, { id: 'ropt', top: '⌥', word: 'option' }],
];

export default function Shortcuts() {
  const [current, setCurrent] = useState(0);
  const [auto, setAuto] = useState(true);
  const section = useRef<HTMLElement>(null);
  const inView = useRef(false);
  useOnScreen(section, v => { inView.current = v; });
  useEffect(() => { if (reducedMotion()) setAuto(false); }, []);
  useEffect(() => {
    if (!auto) return;
    const t = window.setInterval(() => { if (inView.current) setCurrent(i => (i + 1) % SHORTCUTS.length); }, 3400);
    return () => clearInterval(t);
  }, [auto]);

  const choose = (i: number) => { setAuto(false); setCurrent(i); };
  const lit = SHORTCUTS[current].keys;
  const s = SHORTCUTS[current];

  return (
    <section className="sec dark" id="keys" ref={section}>
      <div className="wrap">
        <Head n="04" label="Shortcuts" title="One key to talk." soft="A few more for the rest.">
          <p className="lead rv d2">Everything happens from the keyboard, inside the app you&apos;re already using. Pick a shortcut to see what it does.</p>
        </Head>
        <div className="kbwrap rv">
          <div className="kb" aria-hidden="true">
            {ROWS.map((row, r) => (
              <div className="kr" key={r}>
                {row.map((k, i) => (
                  <span
                    key={i}
                    data-k={k.id}
                    className={`k${k.legend ? ' c' : ''}${k.cls ? ' ' + k.cls : ''}${k.id && lit.includes(k.id) ? ' lit' : ''}`}
                    onClick={k.id ? () => { const j = SHORTCUTS.findIndex(x => x.keys.includes(k.id!)); if (j >= 0) choose(j); } : undefined}
                  >
                    {k.legend}
                    {k.top && <b className="tl">{k.top}</b>}
                    {k.word && <em className="wd">{k.word}</em>}
                    {k.globe && <Icon name="globe" />}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="scrow" role="group" aria-label="Shortcuts">
            {SHORTCUTS.map((x, i) => (
              <button key={x.name} className="sc" aria-pressed={i === current} onClick={() => choose(i)}>{x.name}<kbd>{x.how}</kbd></button>
            ))}
          </div>
          <div className="scd" aria-live="polite">
            <p>{s.what}</p>
            {s.example && <p className="ex">{s.example}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
