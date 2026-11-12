import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = f => readFileSync(new URL(f, import.meta.url), 'utf8');
const html = read('./index.html'), app = read('./app.js');

test('v2 keeps the shared registration form contract used by ../registration.mjs', () => {
  assert.match(html, /<form id="registration-form">/);
  for (const id of ['registration-fields','registration-name','registration-phone','registration-submit','registration-status','registration-retry','registration-line'])
    assert.match(html, new RegExp(`id="${id}"`), id);
  assert.match(html, /autocomplete="name"/);
  assert.match(html, /autocomplete="tel"/);
  assert.doesNotMatch(html, /registration-dialog|<dialog/);
});

test('registration module loads exactly once (no second script tag with a different URL)', () => {
  assert.doesNotMatch(html, /registration\.mjs/);
  assert.match(app, /from '\.\.\/registration\.mjs'/);
});

test('offer numbers ship empty until real figures are provided', () => {
  assert.match(app, /OFFER = Object\.freeze\(\{originalPrice: null, attendees: null\}\)/);
  assert.match(html, /id="offer-original" hidden/);
  assert.match(html, /id="offer-attendees" hidden/);
});

test('every tab points at an existing section', () => {
  const tabs = [...html.matchAll(/<a href="#([a-z]+)">/g)].map(m => m[1]);
  for (const id of ['intro','learn','voices','cases','mentor','faq']) assert.ok(tabs.includes(id) && html.includes(`id="${id}"`), id);
});
