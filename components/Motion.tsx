'use client';
import { gsap, lite, MQ, ScrollTrigger, SplitText, useGSAP, type Conditions } from '@/lib/gsap';

const q = <T extends Element = HTMLElement>(selector: string) => gsap.utils.toArray<T>(selector);
const one = <T extends Element = HTMLElement>(selector: string) => document.querySelector<T>(selector);

/** Toggles `off` on an element while it's out of view, which pauses its CSS loops. */
const pauseOffscreen = (el: HTMLElement | null) =>
  el && ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: s => el.classList.toggle('off', !s.isActive) });

/** Scroll and hover motion for the static sections. Interactive sections (hero, cleanup, styles, tone, shortcuts) run their
 *  own. Everything here animates only transform and opacity, and nothing runs for people who asked for less motion. */
export default function Motion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ, ctx => {
      const { motion, fine } = ctx.conditions as Conditions;
      const cleanups: (() => void)[] = [];
      const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
        el.addEventListener(type, fn);
        cleanups.push(() => el.removeEventListener(type, fn));
      };
      pauseOffscreen(one('.ringwrap'));
      pauseOffscreen(one('.mpanel'));
      pauseOffscreen(one('.flow'));
      if (!motion) return;
      const full = !lite();

      // Headlines: each line rolls up out of its mask. Lines, not words: two or three elements per heading to animate.
      // They wait below the mask as a flat 2D offset (no 3D layer until they move) and drop their transform once landed.
      if (full) q('.head h2, .faqh h2, .end h2').forEach(h => SplitText.create(h, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit: self => {
          gsap.set(self.lines, { yPercent: 110 });
          return gsap.fromTo(self.lines, { yPercent: 110, rotationX: -50 }, {
            yPercent: 0, rotationX: 0, transformOrigin: '50% 100%', duration: .95, ease: 'power3.out', stagger: .1,
            immediateRender: false, clearProps: 'transform', scrollTrigger: { trigger: h, start: 'top 88%', once: true },
          });
        },
      }));
      // Endless CSS loops stop while their section is off screen, so they don't cost a style update every frame.
      pauseOffscreen(one('#apps'));

      // Facts: flip down like a departure board; "0.6 s" counts down from what typing would take.
      const facts = one('.facts');
      if (facts) {
        const st = { trigger: facts, start: 'top 94%', once: true };
        const cells = q('.facts > div');
        gsap.set(cells, { opacity: 0 });
        gsap.fromTo(cells, { rotationX: -90, opacity: 0 }, { rotationX: 0, opacity: 1, transformOrigin: '50% 0%', transformPerspective: 700, duration: .8,
          ease: 'power3.out', stagger: .1, immediateRender: false, clearProps: 'transform', scrollTrigger: st });
        const b = facts.querySelector<HTMLElement>('[data-count]');
        if (b) { const o = { v: 3 }; gsap.to(o, { v: .6, duration: 1.5, ease: 'power2.out', scrollTrigger: st, onUpdate: () => { b.textContent = `${o.v.toFixed(1)} s`; } }); }
      }

      // Languages: once the cards have turned over, they become flat text again.
      const lang = one('#lang');
      if (lang) ScrollTrigger.create({ trigger: lang, start: 'top 70%', once: true, onEnter: () => {
        gsap.delayedCall(3.2, () => lang.querySelectorAll('.lc').forEach(c => c.classList.add('done')));
      } });

      // Meeting notes: the panel lifts from its tape-deck angle, and the note swings in from the side.
      const panel = one('.mpanel'), note = one('.note');
      const lift = (el: HTMLElement | null, from: gsap.TweenVars) => el && gsap.fromTo(el, { transformPerspective: 1400, ...from },
        { rotationX: 0, rotationY: 0, x: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'center 62%', scrub: true } });
      if (full) {
        lift(panel, { rotationX: 18, transformOrigin: '50% 100%' });
        lift(note, { rotationY: -26, x: 40, transformOrigin: '0% 50%' });
      }

      // The tour opens like a MacBook lid.
      const lid = one('.vframe');
      if (lid && full) {
        lid.style.transition = 'opacity .9s var(--ease)'; // GSAP owns its transform
        gsap.fromTo(lid, { rotationX: -64, y: 40, transformPerspective: 1800, transformOrigin: '50% 100%' },
          { rotationX: 0, y: 0, ease: 'none', scrollTrigger: { trigger: lid, start: 'top bottom', end: 'center 62%', scrub: true } });
      }

      // Privacy: the locks click shut; "Elevique servers" scrambles and is struck. (The packets on the wires are CSS.)
      const flow = one('.flow');
      if (flow) gsap.from(q('.node li .i'), { y: -7, scale: .6, opacity: 0, duration: .55, ease: 'back.out(3)', stagger: .1, clearProps: 'transform', scrollTrigger: { trigger: flow, start: 'top 78%', once: true } });
      const struck = one('.nobox s'), nobox = struck?.parentElement;
      if (struck && nobox) {
        const text = struck.textContent ?? '';
        ScrollTrigger.create({ trigger: nobox, start: 'top 88%', once: true, onEnter: () => {
          gsap.to(struck, { duration: 1.1, scrambleText: { text, chars: 'ELVIQUSRO01', speed: .5 }, onComplete: () => nobox.classList.add('struck') });
        } });
      }

      // Get started: a line runs down the steps as you read them; the spec sheet prints row by row.
      const sline = one('.sline');
      if (sline && full) gsap.fromTo(sline, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 78%', end: 'bottom 60%', scrub: true } });
      if (one('.spec')) gsap.from(q('.spec > div'), { x: -16, opacity: 0, duration: .5, ease: 'power2.out', stagger: .05, clearProps: 'transform', scrollTrigger: { trigger: '.spec', start: 'top 82%', once: true } });

      // The end: the mark's three strokes, apart in depth, come together into one as you arrive.
      // Until you get there the pieces are hidden (autoAlpha), so their 3D start positions aren't layers the page carries.
      if (one('.xmark') && full) {
        gsap.set('.xmark .xp-full', { autoAlpha: 0 });
        const meet = { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, ease: 'power2.out' };
        gsap.timeline({ scrollTrigger: { trigger: '.end', start: 'top 82%', end: 'center 60%', scrub: true } })
          .fromTo('.xmark .xp-top', { x: -30, y: -74, z: 170, rotationX: 55, rotationY: -35, autoAlpha: 0 }, meet, 0)
          .fromTo('.xmark .xp-bot', { x: -30, y: 74, z: -170, rotationX: -55, rotationY: 35, autoAlpha: 0 }, meet, 0)
          .fromTo('.xmark .xp-wedge', { x: -120, z: 90, rotationY: 70, autoAlpha: 0 }, meet, .08)
          .to('.xmark .xp-full', { autoAlpha: 1, duration: .06 }, '>-.02');
      }

      if (!fine) return () => cleanups.forEach(f => f());

      // Feature cards lean toward the cursor.
      q('.card').forEach(card => {
        const rx = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3' });
        let r: DOMRect | null = null, flat: gsap.core.Tween | null = null;
        on(card, 'pointerenter', () => { flat?.kill(); r = card.getBoundingClientRect(); card.style.transition = 'opacity .9s var(--ease)'; gsap.set(card, { transformPerspective: 900 }); });
        on(card, 'pointermove', e => { if (!r) return; ry(((e.clientX - r.left) / r.width - .5) * 12); rx(-((e.clientY - r.top) / r.height - .5) * 10); });
        // once it has settled back, the card drops its 3D transform and stops being a layer
        on(card, 'pointerleave', () => { rx(0); ry(0); flat = gsap.delayedCall(.7, () => gsap.set(card, { clearProps: 'transform' })); });
      });

      // Download buttons lean toward the cursor too.
      q('.btn-iv:not(.btn-sm)').forEach(btn => {
        const x = gsap.quickTo(btn, 'x', { duration: .5, ease: 'power3' }), y = gsap.quickTo(btn, 'y', { duration: .5, ease: 'power3' });
        btn.style.transition = 'background .25s, box-shadow .25s'; // GSAP owns its transform
        let r: DOMRect | null = null;
        on(btn, 'pointerenter', () => { r = btn.getBoundingClientRect(); });
        on(btn, 'pointermove', e => { if (!r) return; x((e.clientX - r.left - r.width / 2) * .25); y((e.clientY - r.top - r.height / 2) * .35); });
        on(btn, 'pointerleave', () => { x(0); y(0); });
      });
      return () => cleanups.forEach(f => f());
    });
  });
  return null;
}
