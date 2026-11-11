const menuButton=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
function closeMenu(){menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','開啟選單');navigation.classList.remove('open')}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'關閉選單':'開啟選單');navigation.classList.toggle('open',open)});
navigation.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
const topics={
 '推薦':['手機推薦','「長輩適合哪一種手機？」','從使用者的日常需求切入，比單純介紹規格更有感。'],
 '資費':['資費方案','「吃到飽，真的每個人都需要嗎？」','讓客戶理解自己的使用習慣，再選擇合適的方案。'],
 '門號':['門號問題','「續約前，要先問清楚哪三件事？」','把做決定之前的疑惑，轉成實用的提醒。'],
 '教學':['手機教學','「LINE 聊天紀錄，換手機怎麼搬？」','解決一個實際麻煩，讓專業成為被記住的理由。'],
 '陷阱':['購機陷阱','「0 元手機，真的不用錢嗎？」','從廣告背後的條件切入，幫助客戶理解選擇。'],
 '換新':['舊換新','「同一支舊手機，估價為什麼差這麼多？」','說明價差背後的判斷，展示你熟悉的專業。'],
 '維修':['維修保養','「手機泡水，第一件事該做什麼？」','一個急著解決問題的時刻，就是客戶需要你的時刻。'],
 '評測':['新機評測','「跟上一代相比，真的值得換嗎？」','站在顧客的預算與需求，說明升級的取捨。']
};
document.querySelectorAll('[data-topic]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-topic]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const topic=topics[button.dataset.topic];document.querySelector('#topic-caption').textContent=topic[0]+' · 選題示例';document.querySelector('#topic-title').textContent=topic[1];document.querySelector('#topic-desc').textContent=topic[2]}));
const caseData={
 thirteen:{category:'CASE 01 / 加盟品牌',title:'十三妹螺螄粉',result:'兩年，近 70 家加盟店',caption:'依講師簡報記載，透過自然流量拓展加盟',blocks:[['原本要解決的事','品牌希望找到真正有開店意願的準加盟主，內容需要對應加盟決策，而不只是吸引想吃美食的觀眾。'],['策略調整','聚焦「賣一份能賺多少」「夫妻能否經營」「回本與成本」等疑問，讓選題對準加盟主的生活與經營情境。'],['可以帶走的思考','先定義希望帶來哪一種詢問，再決定影片要談什麼。觀看數之外，也要關心內容是否吸引對的人。']]},
 magician:{category:'CASE 02 / 知識課程',title:'AI 魔術師',result:'半年營業額突破 4,000 萬',caption:'依講師簡報所載的個別課程營業額',blocks:[['原本要解決的事','AI 特效、卡通與短劇教學，需要讓不同背景的受眾理解：自己是否也有機會學會、開始使用。'],['策略調整','從課堂裡出現的長輩學員找到線索，以容易理解的學習入口溝通課程，搭配講師自身的反差故事建立記憶點。'],['可以帶走的思考','賣點可以從真實客戶身上找。觀察誰在購買、為什麼購買，再把觀察轉成內容方向。']]},
 soya:{category:'CASE 03 / 專業服務',title:'Soya 老師',result:'調整後三個月營收破千萬',caption:'依講師簡報記載，非單支影片帶來的收入',blocks:[['原本要解決的事','簡報描述原先投入精緻節目與廣告素材，但內容與受眾需求未充分連結，經營成效不如預期。'],['策略調整','將題材轉向受眾在意的問題，並在影片結尾安排諮詢入口，讓觀看與後續了解服務形成連結。'],['可以帶走的思考','內容與承接需要一起規劃。既要回答顧客的問題，也要讓有興趣的人知道如何進一步了解。']]}
};
const caseDialog=document.querySelector('#case-dialog');
document.querySelectorAll('[data-case]').forEach(button=>button.addEventListener('click',()=>{const data=caseData[button.dataset.case];document.querySelector('#case-dialog-category').textContent=data.category;document.querySelector('#case-dialog-title').textContent=data.title;const content=document.querySelector('#case-dialog-content');content.replaceChildren();const result=document.createElement('div');result.className='dialog-result';const strong=document.createElement('strong');strong.textContent=data.result;const caption=document.createElement('span');caption.textContent=data.caption;result.append(strong,caption);content.append(result);data.blocks.forEach(([heading,body])=>{const h=document.createElement('h3');h.textContent=heading;const p=document.createElement('p');p.textContent=body;content.append(h,p)});const source=document.createElement('p');source.className='dialog-source';source.textContent='來源：講師提供之兩份課程簡報。以上為個別操盤案例，成果受產品、市場與執行條件影響，不代表課程學員收益。';content.append(source);caseDialog.showModal();document.body.classList.add('modal-open')}));
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()})});
document.querySelector('#dialog-curriculum').addEventListener('click',()=>caseDialog.close());
const registrationDialog=document.querySelector('#registration-dialog');
document.querySelector('#registration-button').addEventListener('click',()=>{registrationDialog.showModal();document.body.classList.add('modal-open')});
document.querySelector('.dialog-dismiss').addEventListener('click',()=>registrationDialog.close());
const mobileBar=document.querySelector('.mobile-bar');
const hero=document.querySelector('.hero');
const enrollment=document.querySelector('#enroll');
let heroVisible=true,enrollVisible=false;
const updateBar=()=>mobileBar.classList.toggle('visible',!heroVisible&&!enrollVisible);
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.target===hero)heroVisible=entry.isIntersecting;if(entry.target===enrollment)enrollVisible=entry.isIntersecting});updateBar()});observer.observe(hero);observer.observe(enrollment)}
document.querySelector('#year').textContent=new Date().getFullYear();

// Spin each result like staggered slot reels whenever it enters the viewport.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
if(!reducedMotion.matches && 'IntersectionObserver' in window){
 const reelObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   if(reducedMotion.matches)return;
   const number=entry.target;
   number.setAttribute('role','img');
   number.setAttribute('aria-label',number.dataset.value);
   number.replaceChildren();
   [...number.dataset.value].forEach((character,index)=>{
    const reel=document.createElement('span');
    reel.setAttribute('aria-hidden','true');
    if(!/\d/.test(character)){reel.textContent=character;number.append(reel);return;}
    reel.className='stat-reel';
    const track=document.createElement('span');
    track.className='stat-track';
    const stop=30+index*10+Number(character);
    track.style.setProperty('--stop',stop);
    for(let i=0;i<=stop;i++){
     const digit=document.createElement('span');
     digit.className='stat-digit';digit.textContent=i%10;track.append(digit);
    }
    reel.append(track);number.append(reel);
    const animation=track.animate([{transform:'translateY(0)'},{transform:`translateY(-${stop}em)`}],{duration:2400+index*260,delay:index*100,easing:'cubic-bezier(.12,.65,.15,1)',fill:'backwards'});
    const stopMotion=()=>{if(reducedMotion.matches)animation.finish()};
    reducedMotion.addEventListener('change',stopMotion);
    animation.finished.finally(()=>reducedMotion.removeEventListener('change',stopMotion));
   });
  });
 },{threshold:.65});
 document.querySelectorAll('.case-result .stat-number').forEach(number=>reelObserver.observe(number));
}
