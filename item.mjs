import {ISLAND_NAMES,validateConfig,validateCatalogue,readPublicJson} from './catalogue.mjs';
import {parseItemQuery,itemLink,websiteEnquiry,readLanguage,rememberLanguage} from './listing.mjs';
import {copy,applyCopy} from './copy.mjs';
const $=id=>document.getElementById(id),target=parseItemQuery(location.search),state={config:null,catalogue:null,item:null,language:readLanguage(),busy:false};let shareVersion=0;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),t=key=>copy(state.language,key);
function number(){return state.catalogue?.whatsappNumber||state.config?.whatsappNumber||'919446944562';}
function render(){
 shareVersion++;applyCopy(state.language);const item=state.item;
 if(state.busy&&!item){$('app').innerHTML='<div class="panel error">'+esc(t('loading'))+'</div>';return;}
 if(!item){document.title='NOODY.AI — '+t('missing');const wa=websiteEnquiry(number(),target?.islandCode||null,null,state.language,location.href);$('app').innerHTML='<div class="panel error"><h1>'+esc(t('missing'))+'</h1><p>'+esc(t('missingCopy'))+'</p><a class="wa" id="generalEnquiry" target="_blank" rel="noopener noreferrer" href="'+esc(wa)+'">'+esc(t('ask'))+'</a><p><a class="back" href="./">'+esc(t('back'))+'</a></p></div>';return;}
 document.title=item.name+' | NOODY.AI';const wa=websiteEnquiry(number(),item.islandCode,item,state.language,location.href);
 $('app').innerHTML='<section class="hero"><div class="eyebrow">'+esc(t(item.kind==='PRODUCT'?'products':'services'))+' · '+esc(ISLAND_NAMES[item.islandCode])+'</div><h1 id="itemName">'+esc(item.name)+'</h1><p>'+esc(item.category)+'</p></section><div class="grid"><article class="panel"><h2>'+esc(t('itemAbout'))+'</h2><p id="itemDescription">'+esc(item.description)+'</p><div class="notice">'+esc(t('itemConfirm'))+'</div></article><aside class="panel"><h2>'+esc(t('itemPlan'))+'</h2><div class="meta"><div><span>'+esc(t('island'))+'</span><strong>'+esc(ISLAND_NAMES[item.islandCode])+'</strong></div><div><span>'+esc(t('price'))+'</span><strong id="itemPrice">'+esc(item.price)+'</strong></div><div><span>'+esc(t('availability'))+'</span><strong id="itemAvailability">'+esc(item.availability)+'</strong></div></div><a class="wa" id="itemEnquiry" target="_blank" rel="noopener noreferrer" href="'+esc(wa)+'">'+esc(t('continue'))+'</a><button class="share" id="shareItem" type="button">'+esc(t('share'))+'</button><p class="status" id="shareStatus" role="status" aria-live="polite"></p></aside></div>';
 $('shareItem').onclick=async()=>{const version=shareVersion,link=itemLink(item,location.href);try{await navigator.clipboard.writeText(link);if(version===shareVersion)$('shareStatus').textContent=t('copied');}catch{if(version===shareVersion)$('shareStatus').textContent=t('copyFailed')+' '+link;}};
}
async function refresh(){
 if(state.busy)return;if(!target){document.body.dataset.state='unavailable';render();return;}
 state.busy=true;document.body.dataset.state='loading';render();
 try{
  if(!state.config){const response=await fetch(new URL('./config.json',import.meta.url),{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(8000)});state.config=validateConfig(await readPublicJson(response,4096),location.origin);}
  const response=await fetch(state.config.apiOrigin+'/v1/public/catalogue',{cache:'no-store',credentials:'omit',redirect:'error',headers:{accept:'application/json'},signal:AbortSignal.timeout(8000)});
  state.catalogue=validateCatalogue(await readPublicJson(response));state.item=state.catalogue.items.find(i=>i.id.toLowerCase()===target.id&&i.kind===target.kind&&i.islandCode===target.islandCode)||null;document.body.dataset.state=state.item?'ready':'unavailable';
 }catch{state.catalogue=null;state.item=null;document.body.dataset.state='unavailable';}
 finally{state.busy=false;render();}
}
$('language').onchange=e=>{state.language=e.target.value;rememberLanguage(state.language);render();};$('refresh').onclick=refresh;
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});setInterval(()=>{if(document.visibilityState==='visible')refresh();},60000);refresh();
