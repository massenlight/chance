export const PIXEL_ID = '1214228613893749';
export function createPixelTracker({fbq, storage, uuid = () => crypto.randomUUID()} = {}) {
  const sent = new Set();
  function emit(command, event, extra = {}) {
    try { if (typeof fbq === 'function') { fbq(command, PIXEL_ID, event, {content_name:'Chance 免費實體講座', ...extra}, {eventID:uuid()}); return true; } } catch {}
    return false;
  }
  return {
    submit() { emit('trackSingleCustom', 'SubmitRegistration'); },
    complete(result) {
      if (result?.ok !== true || result.registered !== true || !result.registrationId) return;
      const key = 'chance:pixel:complete:' + result.registrationId;
      let stored = false; try { stored = storage?.getItem(key) === '1'; } catch {}
      if (sent.has(key) || stored) return;
      if (emit('trackSingle', 'CompleteRegistration', {status:true})) {
        sent.add(key); try { storage?.setItem(key, '1'); } catch {}
      }
    }
  };
}
export function initializePixel(win, doc) {
  if (!win.fbq) {
    const queue = function(...args) { queue.callMethod ? queue.callMethod.apply(queue, args) : queue.queue.push(args); };
    win.fbq = queue; if (!win._fbq) win._fbq = queue;
    queue.push = queue; queue.loaded = true; queue.version = '2.0'; queue.queue = [];
    const script = doc.createElement('script'); script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js'; doc.head.appendChild(script);
  }
  // Explicit events only; never pass name, phone or form values to Meta.
  win.fbq('set', 'autoConfig', false, PIXEL_ID);
  win.fbq('init', PIXEL_ID);
  win.fbq('trackSingle', PIXEL_ID, 'PageView');
  let storage; try { storage = win.localStorage; } catch {}
  return createPixelTracker({fbq:win.fbq, storage});
}
export const pixel = typeof window !== 'undefined' ? initializePixel(window, document) : null;
