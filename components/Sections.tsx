import { Fragment, type CSSProperties } from 'react';
import { BASE, MARK, REPO, hash } from '@/lib/site';
import { InView, TourPlayer } from './client';
import { Brand, DownloadButton, Head, Icon } from './ui';

const LANGUAGES = ['English', 'Hindi', 'Hinglish', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Urdu', 'Kannada', 'Malayalam', 'Punjabi',
  'Assamese', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Dutch', 'Russian', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Turkish'];

/** Typed text that writes itself in, word by word, once the cards are in view. */
function Typed({ text }: { text: string }) {
  return (
    <p className="lat">
      {text.split(' ').map((w, i) => <Fragment key={i}>{i > 0 && ' '}<span className="w" style={{ '--d': `${.5 + i * .12}s` } as CSSProperties}>{w}</span></Fragment>)}
    </p>
  );
}

export function Languages() {
  return (
    <section className="sec light" id="langs">
      <div className="wrap">
        <Head n="05" label="Languages" title="Hinglish, typed" soft="the way you'd text it.">
          <p className="lead rv d2">Choose Hinglish and mixed Hindi and English comes out in Latin letters. Pure Hindi stays in Devanagari. Or hold <kbd>fn</kbd> + <kbd>⇧</kbd>, speak Hindi or another Indian language, and get English.</p>
        </Head>
        <InView className="langs rv" id="lang">
          <div className="lc"><p className="eyebrow">Hinglish</p><p className="lab">Heard</p><p className="dev">कल की meeting cancel करो, client busy है</p><p className="lab">Typed</p><Typed text="Kal ki meeting cancel karo, client busy hai." /></div>
          <div className="lc"><p className="eyebrow">Translate to English · <kbd>fn</kbd> + <kbd>⇧</kbd></p><p className="lab">Heard</p><p className="dev">मैं दस मिनट में पहुँच रहा हूँ</p><p className="lab">Typed</p><Typed text="I'll be there in ten minutes." /></div>
        </InView>
        <div className="chips rv">{LANGUAGES.map(l => <span key={l} className={`chip${l === 'Hinglish' ? ' hl' : ''}`}>{l}</span>)}</div>
      </div>
    </section>
  );
}

/** A lane of recorded audio: two identical halves, so the scroll loops without a seam. */
function Strip({ lane }: { lane: number }) {
  const bars = [];
  for (let half = 0; half < 2; half++) {
    for (let i = 0; i < 110; i++) {
      const talking = Math.sin(i * .19 + lane * 2.4) + Math.sin(i * .07 + lane) * .6 > -.2, v = hash(i * 7.3 + lane * 101);
      bars.push(<i key={half * 110 + i} style={{ height: +(talking ? 8 + v * 34 : 3 + v * 4).toFixed(1) }} />);
    }
  }
  return <div className="strip">{bars}</div>;
}

const TRANSCRIPT = [
  ['THEM', 'Can we ship the beta on Thursday?'],
  ['ME', 'Yes, if QA signs off by Wednesday.'],
  ['THEM', "I'll book the review for Wednesday at 2."],
  ['ME', "Great. I'll send the release notes."],
];
const ACTIONS = ['QA sign-off by Wednesday', 'Book the review, Wednesday at 2', 'Send the release notes'];

export function Meetings() {
  return (
    <section className="sec dark" id="meetings">
      <div className="wrap">
        <Head n="06" label="Meeting notes" title="Meeting notes," soft="with no bot in the call.">
          <p className="lead rv d2">When a call app starts using your mic, Elevique Flow offers to take notes. It records your voice and the call&apos;s audio on your Mac, then writes the transcript, a summary and action items. Nobody joins your call.</p>
        </Head>
        <InView className="meet rv" id="meet" threshold={.3}>
          <div className="mpanel">
            <div className="mtop"><div className="toast">Zoom is using your mic<span className="tb">Take notes</span></div><p className="rec">Recording · 12:48</p></div>
            <div className="lane"><b>ME</b><div className="track"><Strip lane={0} /></div></div>
            <div className="lane them"><b>THEM</b><div className="track"><Strip lane={1} /></div></div>
            <div className="tlines">
              {TRANSCRIPT.map(([who, line], i) => <p key={i} className="tl" style={{ '--d': `${.3 + i * .7}s` } as CSSProperties}><b>{who}</b>{line}</p>)}
            </div>
          </div>
          <div className="note">
            <p className="eyebrow">Meeting note</p>
            <h3>Beta launch sync</h3>
            <p className="sum">The beta ships Thursday if QA signs off on Wednesday. The review is booked for Wednesday at 2.</p>
            <p className="eyebrow">Action items</p>
            {ACTIONS.map((a, i) => (
              <div key={a} className="ai" style={{ '--d': `${3.3 + i * .4}s` } as CSSProperties}><span className="box"><Icon name="check" /></span>{a}</div>
            ))}
          </div>
        </InView>
        <ul className="mfacts">
          <li className="rv"><Icon name="tracks" />Your voice and theirs on separate tracks, with the echo removed.</li>
          <li className="rv d1"><Icon name="phone" />Offers to start when a call begins, and stops when it ends.</li>
          <li className="rv d2"><Icon name="ask" />Ask questions across all your meetings.</li>
        </ul>
      </div>
    </section>
  );
}

export function Details() {
  return (
    <section className="sec light" id="details">
      <div className="wrap">
        <Head n="07" label="The details" title="It learns your words." soft="It never loses a thought.">
          <p className="lead rv d2">The small things that make dictation something you can lean on all day.</p>
        </Head>
        <div className="bento">
          <article className="card rv">
            <div className="vis"><div className="stack"><div className="fld">Lunch with <span className="mk">Priya</span> tomorrow?</div><div className="tst">Added Priya to dictionary</div></div></div>
            <h3>Learns your words</h3><p>Fix a name once after it&apos;s typed. Elevique Flow notices and adds it to your dictionary.</p>
          </article>
          <article className="card rv d1">
            <div className="vis"><div className="stack"><span className="q">“my calendar”</span><Icon name="down" className="i arrow" /><span className="res">cal.com/you/30min</span></div></div>
            <h3>Snippets</h3><p>Say a short phrase and get the long version: a booking link, your address, a sign-off.</p>
          </article>
          <article className="card rv d2">
            <div className="vis"><div className="hrow"><span className="tm">4:12pm</span><span>This dictation was dismissed. <u>Recover</u></span></div></div>
            <h3>Nothing is lost</h3><p>Cancelled by mistake? Recent dictations keep their recording for 7 days, ready to recover or transcribe again.</p>
          </article>
          <article className="card rv">
            <div className="vis"><div className="stack"><div className="cc">Running 5 minutes late, start without me.<span className="cpy">Copy</span></div><span className="mini" /></div></div>
            <h3>No text box? No problem.</h3><p>If nothing can take the text, it waits in a card with Copy. It&apos;s already on your clipboard.</p>
          </article>
          <article className="card rv d1">
            <div className="vis">
              <div className="ear">
                <figure><span className="ic3"><Icon name="bt" /></span><figcaption>Earbuds</figcaption></figure>
                <Icon name="arrow" className="i arrow" />
                <figure><span className="ic3 on"><Icon name="mic" /></span><figcaption>Mac mic</figcaption></figure>
              </div>
            </div>
            <h3>Keeps your first word</h3><p>Bluetooth earbuds cut off your first word while their mic wakes up. Elevique Flow records from your Mac&apos;s mic instead.</p>
          </article>
          <article className="card rv d2">
            <div className="vis">
              <div className="insv">
                <svg width="96" height="56" viewBox="0 0 96 56" aria-hidden="true">
                  <path d="M8 50a40 40 0 0 1 80 0" fill="none" stroke="#E1E1DD" strokeWidth="10" strokeLinecap="round" />
                  <path d="M8 50a40 40 0 0 1 80 0" fill="none" stroke="#141414" strokeWidth="10" strokeLinecap="round" pathLength={100} strokeDasharray="60 100" />
                </svg>
                <p className="n">96<small>WPM</small></p>
                <div className="streak" aria-hidden="true">{'.b.abaabaaabaa'.split('').map((c, i) => <i key={i} className={c === '.' ? undefined : c} />)}</div>
              </div>
            </div>
            <h3>Insights</h3><p>Your words per minute, your streak, and where you dictate most.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function Tour() {
  return (
    <section className="sec dark" id="tour">
      <div className="wrap">
        <Head n="08" label="The tour" title="Every feature" soft="in sixty seconds.">
          <p className="lead rv d2">Cleanup, styles, tone of voice, Hinglish, commands, meeting notes and more, in one minute.</p>
        </Head>
        <TourPlayer src={`${BASE}/ad.mp4`} poster={`${BASE}/poster.jpg`} />
      </div>
    </section>
  );
}

const ON_YOUR_MAC = [
  ['History and meeting notes', 'Kept only on this Mac'],
  ['Recordings', 'The last 30, for up to 7 days. Or none.'],
  ['Dictionary and snippets', ''],
  ['Your Groq key', 'In the macOS Keychain'],
  ['Diagnostics log', 'Timings and errors, never what you said'],
];

export function Privacy() {
  return (
    <section className="sec light" id="privacy">
      <div className="wrap">
        <Head n="09" label="Privacy" title="No account." soft="No Elevique servers.">
          <p className="lead rv d2">Elevique Flow talks to one service: Groq, with your own key, only to transcribe and clean up what you say. Your history, notes, recordings and dictionary stay on this Mac.</p>
        </Head>
        <div className="flow rv">
          <div className="node">
            <h3><Icon name="laptop" />Your Mac</h3>
            <ul>
              {ON_YOUR_MAC.map(([what, note]) => <li key={what}><Icon name="lock" /><span>{what}{note && <small>{note}</small>}</span></li>)}
            </ul>
          </div>
          <div className="wires" aria-hidden="true">
            <div className="wcol"><p className="wl">Your audio and words, with a little context</p><div className="wire" /></div>
            <div className="wcol"><div className="wire back" /><p className="wl">Text</p></div>
          </div>
          <div className="node groq">
            <h3><Icon name="cloud" />Groq</h3>
            <p>Turns your speech into text and cleans it up, using <b>your own key</b>.</p>
            <p>It&apos;s the only service Elevique Flow talks to.</p>
          </div>
        </div>
        <p className="nobox rv"><s>Elevique servers</s><span>don&apos;t exist</span></p>
      </div>
    </section>
  );
}

const SPEC = [
  ['Speed', 'About 0.6 s from letting go to text'],
  ['Works in', 'Any text field: browsers, Electron apps, editors, terminals'],
  ['Speech', 'Whisper large-v3 turbo, on Groq'],
  ['Cleanup', 'An AI model on Groq, with your key'],
  ['Languages', '25, including Hindi and Hinglish'],
  ['Translation', 'Hindi and 10 more Indian languages into English'],
  ['Meetings', "Your mic and the call's audio (macOS 14.2+)"],
  ['Mac', 'macOS 13 or later, Apple Silicon and Intel'],
  ['Download', '4.4 MB'],
  ['Price', "Free, on Groq's free tier"],
  ['Account', 'None'],
];

export function Start() {
  return (
    <section className="sec dark" id="start">
      <div className="wrap">
        <Head n="10" label="Get started" title="Two minutes to" soft="your first dictation.">
          <div className="rv d2"><DownloadButton /></div>
        </Head>
        <div className="inst">
          <ol className="steps rv">
            <li><div><h3>Download and drag to Applications</h3><p>Open the DMG and drag Elevique Flow into your Applications folder.</p></div></li>
            <li><div><h3>Open it, then Open Anyway</h3><p>This free build isn&apos;t notarized by Apple, so macOS asks once. In System Settings → Privacy &amp; Security, click <span className="oa">Open Anyway</span>.</p></div></li>
            <li><div><h3>Add your free Groq key</h3><p>Create one at <a href="https://console.groq.com/keys">console.groq.com/keys</a> and paste it into Settings → AI. It&apos;s stored in your Keychain.</p></div></li>
            <li><div><h3>Allow, then talk</h3><p>Allow the microphone and Accessibility, set “Press 🌐 key to” to Do Nothing, then hold <kbd>fn</kbd> and talk.</p></div></li>
          </ol>
          <dl className="spec rv d1">
            {SPEC.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
      </div>
    </section>
  );
}

const FAQ: [string, string][] = [
  ['Is it really free?', "Yes. The app is free, and it runs on your own Groq API key, which is free to create. Groq's free tier covers a normal day of dictation. If you ever need more, you pay Groq directly."],
  ["Why does macOS say it can't verify the developer?", "macOS only skips that warning for apps notarized through Apple's paid developer program. This build is signed but not notarized. Click Open Anyway in System Settings → Privacy & Security once, and macOS remembers."],
  ['What exactly is sent to Groq?', "Your recording, to turn it into text, and those words to clean up, with a little context so names and style come out right: the app you're in, the text around your cursor and names visible in the window. You can turn off names on screen in Settings → Preferences. Nothing is sent anywhere else."],
  ['Does it work offline?', 'No. Speech recognition and cleanup run on Groq, so you need an internet connection. Your history and notes are always on your Mac.'],
  ['Which apps does it work in?', 'Any app with a text field: Slack, Mail, WhatsApp, Notes, Chrome, Safari, VS Code, Cursor, Terminal and AI chat apps. If nothing can take the text, it waits in a card with a Copy button.'],
  ['Which languages does it understand?', `25: ${LANGUAGES.slice(0, -1).join(', ')} and ${LANGUAGES.at(-1)}. Choose yours in Settings → General → My languages.`],
  ['My keyboard has no fn key.', 'Switch the shortcut to Right Option in Settings → General. Everything else works the same.'],
  ['Can I use it alongside other dictation apps?', 'Apps that also listen for fn, like Wispr Flow, will clash with it. Quit them while you use Elevique Flow.'],
  ['Which Macs does it run on?', "macOS 13 or later, on Apple Silicon and Intel. Meeting notes that record the call's audio need macOS 14.2 or later."],
  ['How do I update?', 'Download the new version and replace the app in Applications. Your settings, history and permissions carry over. macOS may ask once to let the new version read your key.'],
];

export function Faq() {
  return (
    <section className="sec light" id="faq">
      <div className="wrap faqg">
        <div className="faqh">
          <p className="eyebrow rv">11 · Questions</p>
          <h2 className="rv d1">Questions,<br /><span className="soft">answered.</span></h2>
          <p className="lead rv d2">More in the <a href={`${REPO}#readme`}>install guide</a>.</p>
        </div>
        <div className="faq rv">
          {FAQ.map(([q, a], i) => (
            <details key={i} name="faq" open={i === 0}>
              <summary>{q}<Icon name="plus" /></summary>
              <p className="a">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function End() {
  return (
    <section className="end" id="get" data-enter>
      <div className="wrap">
        <svg className="bigmark" viewBox="-1 -1 102 95.5" aria-hidden="true">
          <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#8C8C90" /></linearGradient></defs>
          <use className="mf" href="#mk" fill="url(#sg)" />
          <path className="ms" pathLength={1000} d={MARK} />
        </svg>
        <h2>Your keyboard<br /><span className="soft">can take a break.</span></h2>
        <div className="cta"><DownloadButton /></div>
        <p className="meta">Free · macOS 13+ · Apple Silicon &amp; Intel · 4.4 MB</p>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="bc"><Brand /><p>Talk anywhere you type.</p></div>
        <div>
          <h4>Product</h4>
          <ul>
            <li><a href={`${REPO}/releases/latest/download/EleviqueFlow.dmg`}>Download</a></li>
            <li><a href={`${REPO}/releases`}>Release notes</a></li>
            <li><a href={`${REPO}#readme`}>Install guide</a></li>
          </ul>
        </div>
        <div>
          <h4>Learn</h4>
          <ul><li><a href="#edits">Features</a></li><li><a href="#keys">Shortcuts</a></li><li><a href="#privacy">Privacy</a></li><li><a href="#faq">FAQ</a></li></ul>
        </div>
        <p className="copy"><span>© 2026 Elevique</span><span>Made for macOS</span></p>
      </div>
    </footer>
  );
}
