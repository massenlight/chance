// One Chance in-person event. LINE identity and confirmation remain on the project backend.
export const REGISTRATION = Object.freeze({
  api: 'https://massenlighten-platform.massenlighten-company.workers.dev/api/recruitment?project=a9e6075b-c8ad-40a7-b124-ce662b6d99b9',
  source: 'chance-landing', sessionId: '237ae9e3-0aad-4919-a6e4-3bbeeff898c4',
  startsAt: '2026-11-19T11:30:00.000Z', basicId: '@636xbvux',
  venueName: '啟程空間', venueAddress: '台北市南京東路三段9號5樓',
  storageKey: 'chance-landing:visit:v1'
});
const UUID = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const LIFF_ID = /^[0-9]+-[A-Za-z0-9]+$/;
const attributionKeys = {utm_source:'utmSource',utm_medium:'utmMedium',utm_campaign:'utmCampaign',utm_content:'utmContent',utm_term:'utmTerm',fbclid:'fbclid'};

export function availableSession(data, now = Date.now()) {
  if (now >= Date.parse(REGISTRATION.startsAt)) return null;
  if (data?.directRegistrationReady !== true) return null;
  const session = Array.isArray(data.sessions) ? data.sessions.find(s => s?.id === REGISTRATION.sessionId) : null;
  if (!session || session.event_format !== 'in_person' || Date.parse(session.startsAt) !== Date.parse(REGISTRATION.startsAt) || Number(session.durationMinutes) !== 120) return null;
  if (String(session.venue_name || '').trim() !== REGISTRATION.venueName || String(session.venue_address || '').replace(/\s/g, '') !== REGISTRATION.venueAddress) return null;
  return session;
}

export function lineHandoff(data, liffId, visit) {
  let web;
  try { web = new URL(String(data?.lineUrl || '')); } catch { throw Error('報名入口未完成核對，請稍後再試。'); }
  if (!LIFF_ID.test(liffId) || web.origin !== 'https://liff.line.me' || web.pathname !== '/' + liffId || web.username || web.password || web.hash || !UUID.test(web.searchParams.get('pre') || '') || web.searchParams.get('entry_visit') !== visit) throw Error('報名入口未完成核對，請稍後再試。');
  const webUrl = web.toString(), rest = webUrl.slice('https://liff.line.me/'.length);
  const native = data.nativeLineUrl || webUrl;
  const allowed = [webUrl, 'line://app/' + rest, 'intent://app/' + rest + '#Intent;scheme=line;package=jp.naver.line.android;S.browser_fallback_url=' + encodeURIComponent(webUrl) + ';end'];
  if (!allowed.includes(native)) throw Error('LINE 連結未完成核對，請稍後再試。');
  return {webUrl, href:native};
}

export function createRegistrationClient({fetcher = globalThis.fetch, storage = null, search = '', path = '/chance/', now = () => Date.now()} = {}) {
  const params = new URLSearchParams(search), attribution = {};
  for (const [key, payload] of Object.entries(attributionKeys)) attribution[payload] = (params.get(key) || '').slice(0, 500);
  const campaign = JSON.stringify(attribution);
  let visit = UUID.test(params.get('entry_visit') || '') ? params.get('entry_visit') : '';
  try {
    const saved = JSON.parse(storage?.getItem(REGISTRATION.storageKey) || 'null');
    if (!visit && saved?.campaign === campaign && UUID.test(saved.visit) && now() - saved.createdAt >= 0 && now() - saved.createdAt < 86400000) visit = saved.visit;
  } catch { /* Browsers that block storage can still register in this page. */ }
  let visitPromise = null, submitPromise = null;
  async function request(body) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), body ? 20000 : 15000);
    try {
      const response = await fetcher(REGISTRATION.api, {...(body ? {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)} : {}), signal:controller.signal, cache:'no-store'});
      let data;
      try { data = await response.json(); } catch { throw Error('暫時無法讀取報名資料，請稍後再試。'); }
      if (!response.ok) throw Object.assign(Error(response.status === 409 ? '這個場次已停止報名，請重新確認場次。' : response.status === 429 ? '操作太頻繁，請稍候再試。' : '暫時無法連線，請稍後再試。'), {status:response.status});
      return data;
    } finally { clearTimeout(timer); }
  }
  function ensureVisit() {
    if (!visitPromise) visitPromise = request({action:'landing', event:'page_view', sourceSlug:REGISTRATION.source, entryVisit:visit, pagePath:path, ...attribution}).then(data => {
      if (!UUID.test(data.entryVisit || '')) throw Error('來源紀錄尚未完成，請稍後再試。');
      visit = data.entryVisit;
      try { storage?.setItem(REGISTRATION.storageKey, JSON.stringify({visit, campaign, createdAt:now()})); } catch { /* Retain the visit in memory. */ }
      return visit;
    }).catch(error => {visitPromise = null; throw error;});
    return visitPromise;
  }
  return {
    config: () => request(),
    ensureVisit,
    submit(config, fields) {
      if (submitPromise) return submitPromise;
      if (!availableSession(config, now())) return Promise.reject(Error('本場目前未開放報名，請重新確認場次。'));
      submitPromise = (async () => {
        const entryVisit = await ensureVisit();
        const data = await request({action:'direct-register', name:fields.name.trim(), phone:fields.phone.trim(), sessionId:REGISTRATION.sessionId, consent:true, sourceSlug:REGISTRATION.source, entryVisit, ...attribution});
        if (data.ok !== true || data.registered !== true || !data.registrationId) throw Error('尚未確認報名成功，請稍後再試。');
        return data;
      })().catch(error => {submitPromise = null; throw error;});
      return submitPromise;
    }
  };
}

export function mountRegistration() {
  const form = document.querySelector('#registration-form');
  if (!form) return;
  const status = document.querySelector('#registration-status'), submit = document.querySelector('#registration-submit'), retry = document.querySelector('#registration-retry');
  let storage = null;
  try { storage = window.sessionStorage; } catch {}
  const client = createRegistrationClient({storage, search:location.search, path:location.pathname});
  let config = null, busy = false;
  void client.ensureVisit().catch(() => {});
  async function load() {
    config = null; submit.disabled = true; retry.hidden = true;
    status.textContent = '正在確認報名場次…';
    try {
      const data = await client.config();
      if (!availableSession(data)) { status.textContent = '本場目前未開放報名或已截止。'; retry.hidden = false; return; }
      config = data; submit.disabled = false; status.textContent = '填寫姓名與電話，送出即可完成報名。';
    } catch { status.textContent = '暫時無法載入場次，請重新載入。'; retry.hidden = false; }
  }
  retry.addEventListener('click', () => { if (!busy) void load(); });
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (busy || !config || !form.reportValidity()) return;
    const name = form.elements.name.value.trim(), phone = form.elements.phone.value.trim();
    if (!name || !/^0[2-9]\d{7,8}$/.test(phone.replace(/[\s()-]/g, '').replace(/^\+886/, '0'))) { status.textContent = '請填寫姓名及有效的台灣聯絡電話。'; return; }
    busy = true; submit.disabled = true; retry.hidden = true; status.textContent = '正在送出報名，請稍候…';
    try {
      await client.submit(config, {name, phone});
      document.querySelector('#registration-fields').hidden = true;
      status.textContent = '報名成功！11/19（四）19:30–21:30，啟程空間見。地址：台北市南京東路三段9號5樓。請先記下時間與地點；需要聯繫主辦單位，可加入官方 LINE。';
      document.querySelector('#registration-line').hidden = false;
    } catch (error) {
      status.textContent = error.name === 'AbortError' ? '尚未收到報名結果，請再按一次送出；相同資料不會重複報名。' : error.message || '報名未完成，請稍後重試。';
      busy = false; submit.disabled = false;
    }
  });
  void load();
}
if (typeof document !== 'undefined') mountRegistration();
