import type { ReactNode } from 'react';
import { DOWNLOAD, MARK } from '@/lib/site';

/** One sprite for every icon and the mark; components draw them with <use href="#…">. */
export function Sprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <path id="mk" d={MARK} />
        <symbol id="i-dl" viewBox="0 0 24 24"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" /></symbol>
        <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M5 7.5h14M5 16.5h14" /></symbol>
        <symbol id="i-chat" viewBox="0 0 24 24"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9.5L5 20v-4.2A2.5 2.5 0 0 1 4 13.5z" /></symbol>
        <symbol id="i-hash" viewBox="0 0 24 24"><path d="M9.5 4 8 20M16 4l-1.5 16M4.5 9h15.5M4 15h15.5" /></symbol>
        <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="m3.5 7.5 8.5 6 8.5-6" /></symbol>
        <symbol id="i-code" viewBox="0 0 24 24"><path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13" /></symbol>
        <symbol id="i-term" viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="15" rx="2.5" /><path d="m7 10 3 2.5L7 15M12.5 15.5h4.5" /></symbol>
        <symbol id="i-doc" viewBox="0 0 24 24"><path d="M6.5 3.5h7.5l4 4v13h-11.5z" /><path d="M14 3.5v4h4M9.5 12h5M9.5 15.5h5" /></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7" /></symbol>
        <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></symbol>
        <symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" /></symbol>
        <symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></symbol>
        <symbol id="i-laptop" viewBox="0 0 24 24"><path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5V16H5zM2.5 19h19" /></symbol>
        <symbol id="i-cloud" viewBox="0 0 24 24"><path d="M7 18.5h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.1 10 4.25 4.25 0 0 0 7 18.5z" /></symbol>
        <symbol id="i-bt" viewBox="0 0 24 24"><path d="m7 7.5 10 9-5 4v-17l5 4-10 9" /></symbol>
        <symbol id="i-mic" viewBox="0 0 24 24"><rect x="9" y="3.5" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" /></symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></symbol>
        <symbol id="i-down" viewBox="0 0 24 24"><path d="M12 5v14M6 13l6 6 6-6" /></symbol>
        <symbol id="i-tracks" viewBox="0 0 24 24"><path d="M4 8h2M9 6v4M12 5v6M15 7v2M18 6v4M4 16h2M9 14v4M12 15v2M15 13v6M18 15v2" /></symbol>
        <symbol id="i-phone" viewBox="0 0 24 24"><path d="M6.6 3.5h3l1.5 4-2 1.3a10.5 10.5 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" /></symbol>
        <symbol id="i-ask" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.5v.4M12 16.8v.2" /></symbol>
      </defs>
    </svg>
  );
}

export function Icon({ name, className = 'i' }: { name: string; className?: string }) {
  return <svg className={className} aria-hidden="true"><use href={`#i-${name}`} /></svg>;
}

export function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Elevique Flow home">
      <svg className="tile" viewBox="0 0 112 106" aria-hidden="true">
        <rect width="112" height="106" rx="26" fill="#F0F0EE" />
        <use href="#mk" fill="#141414" transform="translate(19.5 15.6) scale(.8)" />
      </svg>
      <span>Elevique <b>Flow</b></span>
    </a>
  );
}

export function DownloadButton({ small, label = 'Download for Mac' }: { small?: boolean; label?: string }) {
  return (
    <a className={`btn btn-iv${small ? ' btn-sm' : ''}`} href={DOWNLOAD}>
      {!small && <Icon name="dl" />}{label}
    </a>
  );
}

/** A section's numbered eyebrow, two-line headline (the second line soft) and whatever sits beside it. */
export function Head({ n, label, title, soft, children }: { n: string; label: string; title: ReactNode; soft: ReactNode; children?: ReactNode }) {
  return (
    <div className="head">
      <div>
        <p className="eyebrow rv">{n} · {label}</p>
        <h2 className="rv d1">{title}<br /><span className="soft">{soft}</span></h2>
      </div>
      {children}
    </div>
  );
}
