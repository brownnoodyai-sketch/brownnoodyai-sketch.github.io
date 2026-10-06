import {loadContentIndex,entryFor,localized} from './listing-content.mjs';
import {loadDesign} from './design.mjs';
import {ISLAND_NAMES,validateConfig,validateCatalogue,readPublicJson} from './catalogue.mjs';
import {itemLink,websiteEnquiry,readLanguage,rememberLanguage} from './listing.mjs';
import {copy,applyCopy} from './copy.mjs';
const names=ISLAND_NAMES,$=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={catalogue:null,config:null,island:'',kind:'',language:readLanguage(),busy:false,unavailable:false,contentIndex:{entries:[]}};let priorFocus=null;
const t=key=>copy(state.language,key),modal=$('typeModal'),cards=$('cards'),results=$('resultsWrap');
const code=()=>Object.keys(names).find(k=>names[k]===state.island)||'';
function number(){return state.catalogue?.whatsappNumber||state.config?.whatsappNumber||'919446944562';}
function safeLink(node,href){if(href){node.href=href;node.target='_blank';node.rel='noopener noreferrer';node.removeAttribute('aria-disabled');}else{node.removeAttribute('href');node.setAttribute('aria-disabled','true');}}
function openType(){if(!state.island||!state.catalogue)return;priorFocus=document.activeElement;$('typeTitle').textContent=state.island;modal.classList.add('open');document.body.style.overflow='hidden';modal.querySelector('.type-card').focus();}
function closeType(){modal.classList.remove('open');document.body.style.overflow='';priorFocus?.focus();}
function iconFor(item){const text=(item.name+' '+item.category).toLowerCase();if(text.includes('kayak'))return '🛶';if(text.includes('snork'))return '🤿';if(text.includes('scuba'))return '🌊';if(text.includes('boat'))return '🛥️';if(/taxi|transport|auto/.test(text))return '🚕';if(/guide|tour/.test(text))return '🧭';if(/food|fish|coconut/.test(text))return '🥥';return item.kind==='PRODUCT'?'🎁':'🏝️';}
function general(){return websiteEnquiry(number(),code()||null,null,state.language,location.href);}
function fallback(title,message){cards.innerHTML='<article class="card"><div class="card-body"><h3>'+esc(title)+'</h3><p>'+esc(message)+'</p><a class="wa-link empty-enquiry" id="emptyEnquiry" target="_blank" rel="noopener noreferrer">'+esc(t('ask'))+'</a></div></article>';safeLink($('emptyEnquiry'),general());}
function render(scroll=false){
 applyCopy(state.language);safeLink($('headerWa'),general());
 const active=new Set(state.catalogue?.islands.filter(i=>i.active).map(i=>i.code)||[]);
 document.querySelectorAll('[data-island]').forEach(btn=>{const key=Object.keys(names).find(k=>names[k]===btn.dataset.island),enabled=active.has(key);btn.disabled=!enabled;btn.style.opacity=enabled?'1':'.48';btn.classList.toggle('active',btn.dataset.island===state.island);btn.querySelector('small').textContent=t(enabled?'active':'inactive');});
 $('catalogueStatus').textContent=state.busy?t('loading'):state.unavailable?t('unavailable'):'';
 if(state.unavailable){results.hidden=false;$('resultTitle').textContent=t('unavailable');$('resultCount').textContent='';fallback(t('unavailable'),t('unavailableCopy'));return;}
 if(!state.catalogue||!state.island||!state.kind){results.hidden=true;cards.replaceChildren();$('selectionStrip').classList.remove('show');return;}
 const items=state.catalogue.items.filter(i=>i.islandCode===code()&&i.kind===state.kind);
 const kindText=t(state.kind==='PRODUCT'?'products':'services');
 $('selectedIslandText').textContent=state.island;$('selectedTypeText').textContent=kindText;$('resultTitle').textContent=state.island+' '+kindText;$('resultCount').textContent=items.length+' '+t('listings');
 $('catalogueStatus').textContent=state.busy?t('loading'):items.length+' '+t('listings');$('selectionStrip').classList.add('show');results.hidden=false;
 if(!items.length)fallback(t('empty'),t('emptyCopy'));
 else cards.innerHTML=items.map((item,i)=>'<article class="card" data-key="'+esc(item.kind+':'+item.id+':'+item.islandCode)+'" style="animation-delay:'+Math.min(i*45,500)+'ms"><div class="thumb">'+(entryFor(state.contentIndex,item)?.cover?'<img class="listing-cover" loading="lazy" width="600" height="400" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0" src="'+esc(entryFor(state.contentIndex,item).cover.src)+'" alt="'+esc(entryFor(state.contentIndex,item).cover.alt[state.language]||item.name)+'">':'<div class="thumb-icon">'+iconFor(item)+'</div>')+'<div class="thumb-island">'+esc(state.island)+'</div></div><div class="card-body"><div class="card-kicker">'+esc(kindText)+' · '+esc(item.category)+'</div><h3><a href="'+esc(itemLink(item,location.href))+'">'+esc(localized(entryFor(state.contentIndex,item),state.language,'title',item.name))+'</a></h3><p>'+esc(localized(entryFor(state.contentIndex,item),state.language,'summary',item.description))+'</p><div class="card-meta"><small>'+esc(item.price)+' · '+esc(item.availability)+'</small></div><div class="card-actions"><a class="wa-link" data-detail href="'+esc(itemLink(item,location.href))+'">'+esc(t('details'))+'</a><a class="wa-link" data-enquiry target="_blank" rel="noopener noreferrer" href="'+esc(websiteEnquiry(number(),item.islandCode,item,state.language,location.href))+'">'+esc(t('enquire'))+'</a></div></div></article>').join('');
 if(scroll)results.scrollIntoView({behavior:'smooth',block:'start'});
}
async function refresh(){
 if(state.busy)return;state.busy=true;document.body.dataset.state='loading';render();
 try{
  if(!state.config){const response=await fetch(new URL('./config.json',import.meta.url),{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(8000)});state.config=validateConfig(await readPublicJson(response,4096),location.origin);}
  const response=await fetch(state.config.apiOrigin+'/v1/public/catalogue',{cache:'no-store',credentials:'omit',redirect:'error',headers:{accept:'application/json'},signal:AbortSignal.timeout(8000)});
  state.catalogue=validateCatalogue(await readPublicJson(response));state.contentIndex=await loadContentIndex();state.unavailable=false;
  if(state.island&&!state.catalogue.islands.some(i=>i.code===code()&&i.active)){state.island='';state.kind='';closeType();}
  document.body.dataset.state='ready';
 }catch{state.catalogue=null;state.unavailable=true;closeType();document.body.dataset.state='unavailable';}
 finally{state.busy=false;render();}
}
document.querySelectorAll('[data-island]').forEach(btn=>btn.onclick=()=>{if(btn.disabled)return;state.island=btn.dataset.island;render();openType();});
document.querySelectorAll('[data-kind]').forEach(btn=>btn.onclick=()=>{state.kind=btn.dataset.kind==='Products'?'PRODUCT':'SERVICE';closeType();render(true);});
$('changeType').onclick=openType;$('closeModal').onclick=closeType;modal.onclick=e=>{if(e.target===modal)closeType();};
document.addEventListener('keydown',e=>{if(!modal.classList.contains('open'))return;if(e.key==='Escape')closeType();if(e.key==='Tab'){const nodes=[...modal.querySelectorAll('button')],first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
$('language').onchange=e=>{state.language=e.target.value;rememberLanguage(state.language);render();};$('refresh').onclick=refresh;$('year').textContent=new Date().getFullYear();
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});setInterval(()=>{if(document.visibilityState==='visible')refresh();},60000);render();refresh();

loadDesign();
