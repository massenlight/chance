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

// In-page links (免費報名 buttons, the scroll cue, the logo). With mandatory snapping, a smooth
// jump across many blocks can stop at the first block it passes (iPhone Safari especially), so
// snapping is paused for the jump and switched back on once the page has stopped moving.
const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let resume = 0;
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const id = link.getAttribute('href').slice(1);
  const target = id && document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  clearTimeout(resume);
  root.classList.add('snap-paused');
  const behavior = reduceMotion.matches ? 'auto' : 'smooth';
  if (id === 'top') window.scrollTo({top: 0, behavior});
  else target.scrollIntoView({behavior, block: 'start'});
  if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
  let last = NaN, still = 0;
  const started = Date.now();
  const check = () => {
    if (Math.abs(window.scrollY - last) < 1) still += 1; else { still = 0; last = window.scrollY; }
    if (still >= 5 || Date.now() - started > 4000) { root.classList.remove('snap-paused'); return; }
    resume = setTimeout(check, 60);
  };
  resume = setTimeout(check, 150);
});

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
