import {loadListingContent,validateContent,localized,SECTION_TITLES,FIELDS} from './listing-content.mjs';
import {loadDesign} from './design.mjs';
import {ISLAND_NAMES,validateConfig,validateCatalogue,readPublicJson} from './catalogue.mjs';
import {parseItemQuery,itemLink,websiteEnquiry,readLanguage,rememberLanguage} from './listing.mjs';
import {copy,applyCopy} from './copy.mjs';
const $=id=>document.getElementById(id),target=parseItemQuery(location.search),state={config:null,catalogue:null,item:null,language:readLanguage(),busy:false,content:null,assets:{},photo:0};let shareVersion=0;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),t=key=>copy(state.language,key);
function number(){return state.catalogue?.whatsappNumber||state.config?.whatsappNumber||'919446944562';}
function richSections(content,lang){
 const titles=SECTION_TITLES[lang],photos=content?.photos||[];
 let html=photos.length?'<section class="gallery" aria-label="'+esc(titles.gallery)+'"><img id="galleryMain" width="1200" height="800" alt=""><div class="gallery-controls"><button id="photoPrevious" type="button">'+esc(titles.back)+'</button><span id="photoCount"></span><button id="photoNext" type="button">'+esc(titles.next)+'</button></div><div class="gallery-thumbs">'+photos.map((p,i)=>'<button type="button" data-photo="'+i+'"><img loading="lazy" width="100" height="70" src="'+esc(state.assets[p.src]||p.src)+'" alt="'+esc(p.alt[lang]||p.alt.en||titles.gallery+' '+(i+1))+'"></button>').join('')+'</div></section>':'';
 const fallback=FIELDS.some(field=>localized(content,lang,field)&&!content?.text?.[lang]?.[field]);if(fallback)html+='<p class="status">'+esc(titles.fallback)+'</p>';
 for(const field of FIELDS.slice(3)){const value=localized(content,lang,field);if(value)html+='<section class="detail-section" data-section="'+field+'"><h2>'+esc(titles[field])+'</h2><p class="long-text">'+esc(value)+'</p></section>';}
 html+='<section class="detail-section"><h2>'+esc(titles.reviews)+'</h2><p id="verifiedReviews">'+esc(titles.noReviews)+'</p></section>';return html;
}
function gallery(){
 const photos=state.content?.photos||[];if(!photos.length)return;state.photo=((state.photo%photos.length)+photos.length)%photos.length;
 const image=$('galleryMain'),photo=photos[state.photo];image.src=state.assets[photo.src]||photo.src;image.alt=photo.alt[state.language]||photo.alt.en||state.item.name;image.onerror=()=>{image.hidden=true;};image.onload=()=>{image.hidden=false;};
 $('photoCount').textContent=(state.photo+1)+' / '+photos.length;document.querySelectorAll('[data-photo]').forEach(btn=>{btn.setAttribute('aria-pressed',String(Number(btn.dataset.photo)===state.photo));btn.onclick=()=>{state.photo=Number(btn.dataset.photo);gallery();};});
 $('photoPrevious').onclick=()=>{state.photo--;gallery();};$('photoNext').onclick=()=>{state.photo++;gallery();};
}
function render(){
 shareVersion++;applyCopy(state.language);const item=state.item;
 if(state.busy&&!item){$('app').innerHTML='<div class="panel error">'+esc(t('loading'))+'</div>';return;}
 if(!item){document.title='NOODY.AI — '+t('missing');const wa=websiteEnquiry(number(),target?.islandCode||null,null,state.language,location.href);$('app').innerHTML='<div class="panel error"><h1>'+esc(t('missing'))+'</h1><p>'+esc(t('missingCopy'))+'</p><a class="wa" id="generalEnquiry" target="_blank" rel="noopener noreferrer" href="'+esc(wa)+'">'+esc(t('ask'))+'</a><p><a class="back" href="./">'+esc(t('back'))+'</a></p></div>';return;}
 const content=state.content,lang=state.language,sections=SECTION_TITLES[lang],title=localized(content,lang,'title',item.name),description=localized(content,lang,'description',item.description),summary=localized(content,lang,'summary',item.category);
 document.title=title+' | NOODY.AI';const wa=websiteEnquiry(number(),item.islandCode,item,state.language,location.href);
 $('app').innerHTML='<section class="hero"><div class="eyebrow">'+esc(t(item.kind==='PRODUCT'?'products':'services'))+' · '+esc(ISLAND_NAMES[item.islandCode])+'</div><h1 id="itemName">'+esc(title)+'</h1><p>'+esc(summary)+'</p></section><div class="grid"><article class="panel"><h2>'+esc(t('itemAbout'))+'</h2><p id="itemDescription">'+esc(description)+'</p>'+richSections(content,lang)+'<div class="notice">'+esc(t('itemConfirm'))+'</div></article><aside class="panel"><h2>'+esc(t('itemPlan'))+'</h2><div class="meta"><div><span>'+esc(t('island'))+'</span><strong>'+esc(ISLAND_NAMES[item.islandCode])+'</strong></div><div><span>'+esc(t('price'))+'</span><strong id="itemPrice">'+esc(item.price)+'</strong></div><div><span>'+esc(t('availability'))+'</span><strong id="itemAvailability">'+esc(item.availability)+'</strong></div></div><a class="wa" id="itemEnquiry" target="_blank" rel="noopener noreferrer" href="'+esc(wa)+'">'+esc(t('continue'))+'</a><button class="share" id="shareItem" type="button">'+esc(t('share'))+'</button><p class="status" id="shareStatus" role="status" aria-live="polite"></p></aside></div>';
 gallery();
 $('shareItem').onclick=async()=>{const version=shareVersion,link=itemLink(item,location.href);try{await navigator.clipboard.writeText(link);if(version===shareVersion)$('shareStatus').textContent=t('copied');}catch{if(version===shareVersion)$('shareStatus').textContent=t('copyFailed')+' '+link;}};
}
async function refresh(){
 if(state.busy)return;if(!target){document.body.dataset.state='unavailable';render();return;}
 state.busy=true;document.body.dataset.state='loading';render();
 try{
  if(!state.config){const response=await fetch(new URL('./config.json',import.meta.url),{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(8000)});state.config=validateConfig(await readPublicJson(response,4096),location.origin);}
  const response=await fetch(state.config.apiOrigin+'/v1/public/catalogue',{cache:'no-store',credentials:'omit',redirect:'error',headers:{accept:'application/json'},signal:AbortSignal.timeout(8000)});
  state.catalogue=validateCatalogue(await readPublicJson(response));state.item=state.catalogue.items.find(i=>i.id.toLowerCase()===target.id&&i.kind===target.kind&&i.islandCode===target.islandCode)||null;state.content=state.item?await loadListingContent(state.item):null;document.body.dataset.state=state.item?'ready':'unavailable';
 }catch{state.catalogue=null;state.item=null;state.content=null;document.body.dataset.state='unavailable';}
 finally{state.busy=false;render();}
}
$('language').onchange=e=>{state.language=e.target.value;rememberLanguage(state.language);render();};$('refresh').onclick=refresh;
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});setInterval(()=>{if(document.visibilityState==='visible')refresh();},60000);refresh();

loadDesign();

if(new URLSearchParams(location.search).get('listing_preview')==='1'&&window.parent!==window){
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='NOODY_LISTING_PREVIEW'||!state.item)return;
  try{
   const content=validateContent(event.data.content,state.item),assets={};for(const photo of content.photos){const data=event.data.assets?.[photo.src];if(/^\.\/media\/[a-zA-Z0-9_-]+\.webp$/.test(photo.src)&&typeof data==='string'&&data.length<500000&&/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(data))assets[photo.src]=data;}
   state.content=content;state.assets=assets;if(['en','ml','hi'].includes(event.data.language)){state.language=event.data.language;$('language').value=state.language;}render();window.parent.postMessage({type:'NOODY_LISTING_APPLIED'},location.origin);
  }catch{}
 });
 const ready=setInterval(()=>{if(!state.busy&&state.item){window.parent.postMessage({type:'NOODY_LISTING_READY'},location.origin);clearInterval(ready);}},100);
}
