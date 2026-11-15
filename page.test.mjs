import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const read = f => readFileSync(new URL(f, import.meta.url), 'utf8');
const html = read('./index.html'), app = read('./app.js'), css = read('./styles.css');

test('the main page keeps the shared registration form contract used by ./registration.mjs', () => {
  assert.match(html, /<form id="registration-form">/);
  for (const id of ['registration-fields','registration-name','registration-phone','registration-submit','registration-status','registration-retry','registration-line'])
    assert.match(html, new RegExp(`id="${id}"`), id);
  assert.match(html, /autocomplete="name"/);
  assert.match(html, /autocomplete="tel"/);
  assert.doesNotMatch(html, /registration-dialog|<dialog/);
});

test('registration module loads exactly once (no second script tag with a different URL)', () => {
  assert.doesNotMatch(html, /registration\.mjs/);
  assert.match(app, /from '\.\/registration\.mjs'/);
});

test('offer numbers ship empty until real figures are provided', () => {
  assert.match(app, /OFFER = Object\.freeze\(\{originalPrice: null, attendees: null\}\)/);
  assert.match(html, /id="offer-original" hidden/);
  assert.match(html, /id="offer-attendees" hidden/);
});

test('every in-page link points at an existing section', () => {
  const targets = [...html.matchAll(/href="#([a-z-]+)"/g)].map(m => m[1]);
  assert.ok(targets.includes('enroll'));
  for (const id of targets) assert.ok(html.includes(`id="${id}"`), id);
});

test('every image the page shows exists in the repo', () => {
  const srcs = [...html.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)].map(m => m[1]);
  assert.ok(srcs.filter(s => s.startsWith('assets/partners/')).length === 14, 'all 14 partner logos are on the page');
  for (const src of srcs) assert.ok(existsSync(new URL(src, import.meta.url)), src);
  assert.doesNotMatch(html, /預留合作廠商LOGO區/);
});

test('phones snap block by block; desktop does not', () => {
  const phone = css.slice(css.indexOf('@media (max-width:767px)'));
  assert.match(phone, /html\{scroll-snap-type:y mandatory/);
  assert.match(phone, /\.snap\{[^}]*scroll-snap-align:start/);
  assert.doesNotMatch(css.slice(0, css.indexOf('@media (max-width:767px)')), /scroll-snap-type/);
  // The registration block must be reachable by snapping, and typing must suspend snapping.
  assert.match(html, /class="section enroll snap" id="enroll"/);
  assert.match(app, /classList\.add\('snap-off'\)/);
  // In-page jumps (免費報名 buttons) pause snapping so they are not stopped at the first block.
  assert.match(app, /classList\.add\('snap-paused'\)/);
  assert.match(css, /html\.snap-off,html\.snap-paused\{scroll-snap-type:none\}/);
});
