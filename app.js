// Chance page behavior. Registration, LINE handoff and Meta Pixel are shared with the
// current page through ./registration.mjs (imported once here, so it mounts once).
import {REGISTRATION} from './registration.mjs';

// Offer numbers stay hidden until real figures are provided. Never fill these with estimates.
// originalPrice: e.g. 1500 → shows "NT$1,500" struck through beside NT$0.
// attendees: e.g. 1200 → shows "已有 1,200 人參加過 Chance 的體驗課與課程" (edit the sentence to match the real source).
export const OFFER = Object.freeze({originalPrice: null, attendees: null});

const fmt = n => Number(n).toLocaleString('en-US');
if (Number.isFinite(OFFER.originalPrice) && OFFER.originalPrice > 0) {
  const s = document.querySelector('#offer-original');
  s.textContent = 'NT$' + fmt(OFFER.originalPrice); s.hidden = false;
}
if (Number.isFinite(OFFER.attendees) && OFFER.attendees > 0) {
  const p = document.querySelector('#offer-attendees');
  const b = document.createElement('strong'); b.textContent = fmt(OFFER.attendees);
  p.append('已有 ', b, ' 人參加過 Chance 的體驗課與課程'); p.hidden = false;
}

// Countdown to the session start; hidden once the session has started.
const countdown = document.querySelector('#countdown');
const target = Date.parse(REGISTRATION.startsAt);
const units = Object.fromEntries([...countdown.querySelectorAll('[data-unit]')].map(el => [el.dataset.unit, el]));
let timer = 0;
function tick() {
  const left = target - Date.now();
  if (!(left > 0)) { countdown.hidden = true; clearInterval(timer); return; }
  const s = Math.floor(left / 1000);
  units.d.textContent = Math.floor(s / 86400);
  units.h.textContent = String(Math.floor(s / 3600) % 24).padStart(2, '0');
  units.m.textContent = String(Math.floor(s / 60) % 60).padStart(2, '0');
  units.s.textContent = String(s % 60).padStart(2, '0');
  countdown.hidden = false;
}
tick(); timer = setInterval(tick, 1000);

// Phones snap from block to block (see styles.css). While someone is typing in the form the
// on-screen keyboard moves the page, so snapping is switched off until the field loses focus.
const form = document.querySelector('#registration-form');
form.addEventListener('focusin', e => { if (e.target.matches('input')) document.documentElement.classList.add('snap-off'); });
form.addEventListener('focusout', () => document.documentElement.classList.remove('snap-off'));

// Mobile bar: show only when neither the hero nor the registration card is on screen.
const bar = document.querySelector('.mobile-bar');
const watch = [document.querySelector('.hero'), document.querySelector('#enroll')];
if ('IntersectionObserver' in window) {
  const visible = new Map();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => visible.set(e.target, e.isIntersecting));
    bar.classList.toggle('visible', !watch.some(el => visible.get(el)));
  }, {rootMargin: '-1px 0px'}); // snapped blocks sit edge to edge; a block that only touches the screen edge is not "on screen"
  watch.forEach(el => io.observe(el));
}

// Only one testimonial plays at a time.
const videos = [...document.querySelectorAll('.voice video')];
videos.forEach(v => v.addEventListener('play', () => videos.forEach(o => { if (o !== v) o.pause(); })));

document.querySelector('#year').textContent = new Date().getFullYear();
