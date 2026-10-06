import {copy,applyCopy,setCopyOverrides} from './copy.mjs';
export const TEXT_KEYS=['explore','how','about','whatsapp','hero1','hero2','intro','chooseIsland','islandIntro','where','howTitle','howIntro','step1','step1copy','step2','step2copy','step3','step3copy','aboutTitle','aboutCopy','serviceCopy','productCopy'];
export const SECTIONS=['hero','explore','how','about'];
export const DEFAULT_DESIGN={schema:'noody.design.v1',colors:{accent:'#08755c',ink:'#15372e',background:'#fbfdfc',muted:'#6c8179'},font:'DM Sans',radius:28,columns:3,animations:true,logo:'',banner:'',order:[...SECTIONS],hidden:[],text:{en:{},ml:{},hi:{}}};
export function safeImage(value){
 if(value==='')return '';
 if(typeof value!=='string'||value.length>1500000)throw Error('Image is too large.');
 if(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value))return value;
 let u;try{u=new URL(value);}catch{throw Error('Use an HTTPS image URL or upload PNG, JPEG or WebP.');}
 if(u.protocol!=='https:'||u.username||u.password||!u.hostname.includes('.')||/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[)/i.test(u.hostname)||/^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname))throw Error('Use a public HTTPS image URL.');
 return u.href;
}
export function validateDesign(input){
 if(!input||input.schema!=='noody.design.v1')throw Error('Unsupported design file.');
 const out=structuredClone(DEFAULT_DESIGN);
 for(const key of Object.keys(out.colors)){
  const v=input.colors?.[key]??out.colors[key];if(!/^#[0-9a-f]{6}$/i.test(v))throw Error('Invalid color.');out.colors[key]=v;
 }
 if(input.font!==undefined&&!['DM Sans','Manrope','system'].includes(input.font))throw Error('Invalid font.');
 out.font=input.font??out.font;
 for(const [key,min,max] of [['radius',0,40],['columns',1,4]]){const v=input[key]??out[key];if(!Number.isInteger(v)||v<min||v>max)throw Error('Invalid '+key);out[key]=v;}
 if(input.animations!==undefined&&typeof input.animations!=='boolean')throw Error('Invalid animation setting.');
 out.animations=input.animations??true;out.logo=safeImage(input.logo??'');out.banner=safeImage(input.banner??'');
 const order=input.order??SECTIONS;if(!Array.isArray(order)||order.length!==4||new Set(order).size!==4||order.some(k=>!SECTIONS.includes(k)))throw Error('Invalid section order.');
 out.order=[...order];const hidden=input.hidden??[];if(!Array.isArray(hidden)||hidden.some(k=>!['hero','how','about'].includes(k)))throw Error('Island selection must stay visible.');out.hidden=[...new Set(hidden)];
 for(const lang of ['en','ml','hi'])for(const key of TEXT_KEYS){const v=input.text?.[lang]?.[key];if(v!==undefined){if(typeof v!=='string'||v.length>1600)throw Error('Text is too long.');out.text[lang][key]=v;}}
 return out;
}
const css=String.raw`
:root{--sea:var(--design-accent);--sea2:var(--design-accent);--ink:var(--design-ink);--muted:var(--design-muted);--sand:var(--design-bg)}
body{background:var(--design-bg);color:var(--design-ink);font-family:var(--design-font)}
h1,h2,h3,.brand{font-family:var(--design-font)}
.hero,.panel,.island-stage,.modal-card{border-radius:var(--design-radius)}
.wa,.wa-top{background:var(--design-accent)}.wa-link,.back{color:var(--design-accent)}
#hero::before{background-image:var(--design-banner,linear-gradient(90deg,rgba(4,53,47,.78),rgba(4,67,58,.34) 54%,rgba(5,78,67,.08)),url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85'))}
.design-logo{width:42px;height:42px;object-fit:contain;flex:none}
html[data-design-motion="off"] *,html[data-design-motion="off"] *::before,html[data-design-motion="off"] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
[hidden]{display:none!important}
@media(min-width:981px){.cards{grid-template-columns:repeat(var(--design-columns),minmax(0,1fr))}}
`;
export function applyDesign(input){
 const design=validateDesign(input),root=document.documentElement;
 let style=document.getElementById('siteDesignStyle');if(!style){style=document.createElement('style');style.id='siteDesignStyle';style.textContent=css;document.head.append(style);}
 const vars={'accent':design.colors.accent,'ink':design.colors.ink,'muted':design.colors.muted,'bg':design.colors.background,'font':design.font==='system'?'system-ui,sans-serif':JSON.stringify(design.font)+',sans-serif','radius':design.radius+'px','columns':String(design.columns)};
 for(const [k,v]of Object.entries(vars))root.style.setProperty('--design-'+k,v);
 root.dataset.designMotion=design.animations?'on':'off';
 if(design.banner)root.style.setProperty('--design-banner','linear-gradient(90deg,rgba(4,53,47,.78),rgba(4,67,58,.34)),url('+JSON.stringify(design.banner)+')');else root.style.removeProperty('--design-banner');
 document.querySelectorAll('.brand').forEach(brand=>{
  let image=brand.querySelector('.design-logo');if(design.logo){if(!image){image=document.createElement('img');image.className='design-logo';image.alt='';brand.prepend(image);}image.src=design.logo;}else image?.remove();
  brand.querySelectorAll('.bird-core,.bird-trail').forEach(node=>node.hidden=Boolean(design.logo));
 });
 const main=document.querySelector('main');if(document.getElementById('explore')&&main)for(const key of design.order){const section=document.getElementById(key);if(section){section.hidden=design.hidden.includes(key);main.append(section);}}
 for(const key of ['how','about'])document.querySelectorAll('nav a[href="#'+key+'"]').forEach(a=>a.hidden=design.hidden.includes(key));
 setCopyOverrides(design.text);applyCopy(document.documentElement.lang||'en');root.dataset.designReady='true';
 return design;
}
export async function loadDesign(){
 if(new URLSearchParams(location.search).get('design_preview')==='1'&&window.parent!==window){
  window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='NOODY_DESIGN_PREVIEW')return;try{applyDesign(event.data.design);if(['en','ml','hi'].includes(event.data.language)){const select=document.getElementById('language');if(select){select.value=event.data.language;select.dispatchEvent(new Event('change'));}}window.parent.postMessage({type:'NOODY_DESIGN_APPLIED'},location.origin);}catch{}});
  applyDesign(DEFAULT_DESIGN);window.parent.postMessage({type:'NOODY_DESIGN_READY'},location.origin);return;
 }
 try{const response=await fetch(new URL('./site-design.json',import.meta.url),{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error();const text=await response.text();if(text.length>3500000)throw Error();applyDesign(JSON.parse(text));}
 catch{applyDesign(DEFAULT_DESIGN);}
}
