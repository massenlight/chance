import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {REGISTRATION as R,availableSession,createRegistrationClient,openRegisteredLine} from './registration.mjs';
const config={directRegistrationReady:true,sessions:[{id:R.sessionId,event_format:'in_person',startsAt:R.startsAt,durationMinutes:120,venue_name:R.venueName,venue_address:R.venueAddress}]};
const visit='12345678-1234-1234-1234-123456789abc';
test('registration depends on open physical session, not LINE availability',()=>{assert.ok(availableSession(config,0));assert.equal(availableSession({...config,directRegistrationReady:false},0),null);assert.equal(availableSession(config,Date.parse(R.startsAt)),null);});
test('one click saves name and phone directly; concurrent click sends only once with original attribution',async()=>{const calls=[];const client=createRegistrationClient({now:()=>0,search:'?utm_source=partner',fetcher:async(url,options)=>{const b=JSON.parse(options.body);calls.push(b);return {ok:true,json:async()=>b.action==='landing'?{entryVisit:visit}:{ok:true,registered:true,registrationId:'saved'}};}});const [a,b]=await Promise.all([client.submit(config,{name:'測試',phone:'0912345678'}),client.submit(config,{name:'測試',phone:'0912345678'})]);assert.equal(a.registrationId,b.registrationId);assert.equal(calls.length,2);assert.equal(calls[1].action,'direct-register');assert.equal(calls[1].name,'測試');assert.equal(calls[1].entryVisit,visit);assert.equal(calls[1].utmSource,'partner');});
test('server error permits retry and cannot show premature success',async()=>{let count=0;const c=createRegistrationClient({now:()=>0,fetcher:async(u,o)=>({ok:true,json:async()=>JSON.parse(o.body).action==='landing'?{entryVisit:visit}:++count===1?{ok:true}:{ok:true,registered:true,registrationId:'saved'}})});await assert.rejects(c.submit(config,{name:'測試',phone:'0912345678'}));assert.equal((await c.submit(config,{name:'測試',phone:'0912345678'})).registered,true);});
test('form is in enrollment card and has no registration modal',()=>{const html=readFileSync('index.html','utf8'),js=readFileSync('registration.mjs','utf8');assert.match(html,/<form id="registration-form">/);assert.match(html,/autocomplete="name"/);assert.match(html,/autocomplete="tel"/);assert.doesNotMatch(html,/registration-dialog/);assert.doesNotMatch(js,/showModal/);});

test('confirmed registration opens the correct OA directly, failed or pending registration never redirects',()=>{
 const urls=[];for(const r of [null,{ok:false},{ok:true,registered:false},{ok:true,registered:true}])assert.equal(openRegisteredLine(r,u=>urls.push(u)),false);
 assert.equal(urls.length,0);assert.equal(openRegisteredLine({ok:true,registered:true,registrationId:'saved'},u=>urls.push(u)),true);assert.deepEqual(urls,['https://line.me/R/ti/p/@636xbvux']);
});
