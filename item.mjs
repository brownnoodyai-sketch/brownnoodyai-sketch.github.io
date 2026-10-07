import {loadWebsiteData,localize,ISLAND_NAMES,validateWebsiteData} from './website-data.mjs';
import {parseItemQuery,itemLink,websiteEnquiry,readLanguage,rememberLanguage} from './listing.mjs';
import {loadDesign} from './design.mjs';
import {copy,applyCopy} from './copy.mjs';

const $=id=>document.getElementById(id),target=parseItemQuery(location.search),
esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
state={data:null,item:null,language:readLanguage(),busy:false,assets:{},photo:0};
let shareVersion=0;
const t=k=>copy(state.language,k),number=()=>state.data?.whatsappNumber||'919446944562';
const islandTitle=code=>{const island=state.data?.islands?.find(x=>x.code===code);return island?localize(island.title,state.language,island.name):ISLAND_NAMES[code]||code;};
const itemCategory=item=>localize(item.categoryLabel,state.language,item.category);
const itemPrice=item=>localize(item.priceLabel,state.language,item.priceText||t('ask'));
const itemAvailability=item=>localize(item.availabilityLabel,state.language,item.availabilityText||t('confirmOnWhatsapp'));
const itemType=item=>t(item.kind==='PRODUCT'?'product':'service');

function syncLanguage(){
 applyCopy(state.language);
 document.documentElement.lang=state.language;
 const select=$('language');if(select)select.value=state.language;
 document.querySelectorAll('[data-language]').forEach(b=>{b.classList.toggle('active',b.dataset.language===state.language);b.setAttribute('aria-pressed',String(b.dataset.language===state.language));});
}
function blockHtml(block){
 const title=localize(block.title,state.language),body=localize(block.body,state.language);if(!title&&!body)return'';
 let style='';if(block.style==='highlight')style='background:#eff7f3;border:0;border-radius:16px;padding:18px';if(block.style==='note')style='background:#fbfdfc;border-left:4px solid #08755c;padding:18px';if(block.style==='steps')style='border:1px dashed #dfeae5;border-radius:16px;padding:18px';
 return '<section class="detail-section" style="'+style+'">'+(title?'<h2>'+esc(title)+'</h2>':'')+(body?'<p class="long-text">'+esc(body)+'</p>':'')+'</section>';
}
function detailHtml(item){
 const rows=(item.details||[]).map(d=>{const label=localize(d.label,state.language),value=localize(d.value,state.language);return label||value?'<div class="meta"><div><span>'+esc(label||t('detailFallback'))+'</span><strong>'+esc(value)+'</strong></div></div>':'';}).join('');
 return rows?'<section class="detail-section"><h2>'+esc(t(item.kind==='PRODUCT'?'productDetails':'serviceDetails'))+'</h2><div class="detail-specs">'+rows+'</div></section>':'';
}
function relatedHtml(item){
 const related=(state.data?.items||[]).filter(x=>x.active&&x.id!==item.id&&x.islandCode===item.islandCode&&x.kind===item.kind&&x.category===item.category).slice(0,4);
 if(!related.length)return'';
 return '<section class="detail-section"><h2>'+esc(t(item.kind==='PRODUCT'?'moreProducts':'moreServices'))+'</h2><div class="related-list">'+related.map(x=>'<p><a class="back" href="'+esc(itemLink(x,location.href))+'">→ '+esc(localize(x.title,state.language,x.name))+'</a></p>').join('')+'</div></section>';
}
function rich(){
 const item=state.item,photos=item.photos||[];
 let html=photos.length?'<section class="gallery"><img id="galleryMain" width="1200" height="800" alt=""><div class="gallery-controls"><button id="photoPrevious" type="button">←</button><span id="photoCount"></span><button id="photoNext" type="button">→</button></div><div class="gallery-thumbs">'+photos.map((p,i)=>'<button type="button" data-photo="'+i+'"><img loading="lazy" width="100" height="70" src="'+esc(state.assets[p.src]||p.src)+'" alt="'+esc(localize(p.alt,state.language,item.name))+'"></button>').join('')+'</div></section>':'';
 html+=detailHtml(item);for(const block of item.blocks||[])html+=blockHtml(block);html+=relatedHtml(item);
 html+='<section class="detail-section"><h2>'+esc(t('customerReviews'))+'</h2>';
 if(!item.reviews?.length)html+='<p class="status">'+esc(t('noReviews'))+'</p>';
 else for(const r of item.reviews)html+='<article class="detail-section"><strong>'+esc(r.firstName)+' · '+esc(r.stars)+' / 5</strong><p class="status">'+(r.verified?esc(t('verifiedCustomer'))+' · ':'')+esc(r.date||'')+'</p><p class="long-text">'+esc(localize(r.commentText,state.language,r.comment))+'</p></article>';
 return html+'</section>';
}
function gallery(){
 const photos=state.item?.photos||[];if(!photos.length)return;state.photo=((state.photo%photos.length)+photos.length)%photos.length;
 const p=photos[state.photo],img=$('galleryMain');img.src=state.assets[p.src]||p.src;img.alt=localize(p.alt,state.language,state.item.name);$('photoCount').textContent=(state.photo+1)+' / '+photos.length;
 document.querySelectorAll('[data-photo]').forEach(b=>{b.setAttribute('aria-pressed',String(Number(b.dataset.photo)===state.photo));b.onclick=()=>{state.photo=Number(b.dataset.photo);gallery();};});
 $('photoPrevious').onclick=()=>{state.photo--;gallery();};$('photoNext').onclick=()=>{state.photo++;gallery();};
}
function render(){
 shareVersion++;syncLanguage();const item=state.item;
 if(state.busy&&!item){$('app').innerHTML='<div class="panel error">'+esc(t('loading'))+'</div>';return;}
 if(!item){$('app').innerHTML='<div class="panel error"><h1>'+esc(t('listingUnavailableTitle'))+'</h1><a class="wa" id="generalEnquiry" target="_blank" rel="noopener" href="'+esc(websiteEnquiry(number(),target?.islandCode||null,null,state.language,location.href))+'">'+esc(t('whatsappNoody'))+'</a></div>';return;}
 const category=itemCategory(item),title=localize(item.title,state.language,item.name),summary=localize(item.summary,state.language,category),description=localize(item.description,state.language,'');
 document.title=title+' | NOODY.AI';const wa=websiteEnquiry(number(),item.islandCode,item,state.language,location.href);
 $('app').innerHTML='<section class="hero"><div class="eyebrow">'+esc(itemType(item))+' · '+esc(islandTitle(item.islandCode))+(category?' · '+esc(category):'')+'</div><h1 id="itemName">'+esc(title)+'</h1><p>'+esc(summary)+'</p></section><div class="grid"><article class="panel"><h2>'+esc(t('aboutItem'))+'</h2><p id="itemDescription" class="long-text">'+esc(description)+'</p>'+rich()+'</article><aside class="panel"><h2>'+esc(t('enquireTitle'))+'</h2><div class="meta"><div><span>'+esc(t('island'))+'</span><strong>'+esc(islandTitle(item.islandCode))+'</strong></div><div><span>'+esc(t('priceGuide'))+'</span><strong id="itemPrice">'+esc(itemPrice(item))+'</strong></div><div><span>'+esc(t('availability'))+'</span><strong id="itemAvailability">'+esc(itemAvailability(item))+'</strong></div></div><a class="wa" id="itemEnquiry" target="_blank" rel="noopener noreferrer" href="'+esc(wa)+'">'+esc(t('continue'))+'</a><button class="share" id="shareItem" type="button">'+esc(t('sharePage'))+'</button><p class="status" id="shareStatus"></p></aside></div>';
 gallery();
 $('shareItem').onclick=async()=>{const v=shareVersion,link=itemLink(item,location.href);try{await navigator.clipboard.writeText(link);if(v===shareVersion)$('shareStatus').textContent=t('linkCopied');}catch{if(v===shareVersion)$('shareStatus').textContent=link;}};
}
async function refresh(){
 if(state.busy)return;if(!target){render();return;}state.busy=true;document.body.dataset.state='loading';render();
 try{state.data=await loadWebsiteData();state.item=state.data.items.find(i=>i.active&&i.id===target.id&&i.kind===target.kind&&i.islandCode===target.islandCode)||null;document.body.dataset.state=state.item?'ready':'unavailable';}
 catch{state.data=null;state.item=null;document.body.dataset.state='unavailable';}
 finally{state.busy=false;render();}
}
function setLanguage(language){if(!['en','ml','hi'].includes(language))return;state.language=language;rememberLanguage(language);render();}
$('language').onchange=e=>setLanguage(e.target.value);
document.querySelectorAll('[data-language]').forEach(b=>b.onclick=()=>setLanguage(b.dataset.language));
$('refresh').onclick=()=>{if(!studioPreview)refresh();};
const studioPreview=new URLSearchParams(location.search).get('studio_preview')==='1'&&window.parent!==window;
if(!studioPreview)refresh();else{state.busy=false;document.body.dataset.state='preview';render();}
loadDesign();
if(studioPreview){
 window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==window.parent||e.data?.type!=='NOODY_STUDIO_ITEM_PREVIEW')return;try{const data=validateWebsiteData(e.data.data),item=data.items.find(i=>i.id===e.data.itemId);if(!item)throw Error();state.data=data;state.item=item;state.assets=e.data.assets||{};state.language=e.data.language||state.language;render();window.parent.postMessage({type:'NOODY_STUDIO_ITEM_APPLIED'},location.origin);}catch{}});
 window.parent.postMessage({type:'NOODY_STUDIO_ITEM_READY'},location.origin);
}
