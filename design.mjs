import {copy,applyCopy,setCopyOverrides} from './copy.mjs';

export const TEXT_KEYS=['explore','how','about','whatsapp','hero1','hero2','intro','chooseIsland','islandIntro','where','howTitle','howIntro','step1','step1copy','step2','step2copy','step3','step3copy','aboutTitle','aboutCopy','serviceCopy','productCopy'];
export const SECTIONS=['hero','explore','how','about'];

export const DEFAULT_DESIGN={
 schema:'noody.design.v1',
 colors:{accent:'#08755c',ink:'#15372e',background:'#fbfdfc',muted:'#6c8179',header:'#fbfdfc',card:'#ffffff',border:'#dfeae5'},
 font:'DM Sans',radius:28,columns:3,animations:true,logo:'',banner:'',
 order:[...SECTIONS],hidden:[],text:{en:{},ml:{},hi:{}},
 ui:{
  containerWidth:1240,sectionGap:22,bodySize:16,h1Size:72,h2Size:46,
  headerHeight:74,headerSticky:true,headerLayout:'spread',navGap:20,logoWidth:42,
  buttonRadius:999,buttonWeight:800,cardRadius:18,cardShadow:'soft',
  languageStyle:'pills'
 }
};

export function safeImage(value){
 if(value==='')return '';
 if(typeof value!=='string'||value.length>1500000)throw Error('Image is too large.');
 if(/^\.\/media\/[a-zA-Z0-9_-]+\.(webp|png|jpg|jpeg)$/.test(value))return value;
 if(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value))return value;
 let u;try{u=new URL(value);}catch{throw Error('Use an HTTPS image URL or upload PNG, JPEG or WebP.');}
 if(u.protocol!=='https:'||u.username||u.password||!u.hostname.includes('.')||/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[)/i.test(u.hostname)||/^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname))throw Error('Use a public HTTPS image URL.');
 return u.href;
}
const integer=(v,min,max,name)=>{if(!Number.isInteger(v)||v<min||v>max)throw Error('Invalid '+name);return v;};
const choice=(v,allowed,name)=>{if(!allowed.includes(v))throw Error('Invalid '+name);return v;};
const bool=(v,name)=>{if(typeof v!=='boolean')throw Error('Invalid '+name);return v;};

export function validateDesign(input){
 if(!input||input.schema!=='noody.design.v1')throw Error('Unsupported design file.');
 const out=structuredClone(DEFAULT_DESIGN);
 for(const key of Object.keys(out.colors)){const v=input.colors?.[key]??out.colors[key];if(!/^#[0-9a-f]{6}$/i.test(v))throw Error('Invalid color.');out.colors[key]=v;}
 if(input.font!==undefined&&!['DM Sans','Manrope','system'].includes(input.font))throw Error('Invalid font.');
 out.font=input.font??out.font;
 out.radius=integer(input.radius??out.radius,0,60,'radius');
 out.columns=integer(input.columns??out.columns,1,4,'columns');
 out.animations=input.animations===undefined?true:bool(input.animations,'animation setting');
 out.logo=safeImage(input.logo??'');out.banner=safeImage(input.banner??'');
 const order=input.order??SECTIONS;if(!Array.isArray(order)||order.length!==4||new Set(order).size!==4||order.some(k=>!SECTIONS.includes(k)))throw Error('Invalid section order.');
 out.order=[...order];const hidden=input.hidden??[];if(!Array.isArray(hidden)||hidden.some(k=>!['hero','how','about'].includes(k)))throw Error('Island selection must stay visible.');out.hidden=[...new Set(hidden)];
 for(const lang of ['en','ml','hi'])for(const key of TEXT_KEYS){const v=input.text?.[lang]?.[key];if(v!==undefined){if(typeof v!=='string'||v.length>1600)throw Error('Text is too long.');out.text[lang][key]=v;}}

 const ui=input.ui??{};
 out.ui.containerWidth=integer(ui.containerWidth??out.ui.containerWidth,760,1800,'containerWidth');
 out.ui.sectionGap=integer(ui.sectionGap??out.ui.sectionGap,0,100,'sectionGap');
 out.ui.bodySize=integer(ui.bodySize??out.ui.bodySize,12,24,'bodySize');
 out.ui.h1Size=integer(ui.h1Size??out.ui.h1Size,36,110,'h1Size');
 out.ui.h2Size=integer(ui.h2Size??out.ui.h2Size,26,80,'h2Size');
 out.ui.headerHeight=integer(ui.headerHeight??out.ui.headerHeight,52,140,'headerHeight');
 out.ui.headerSticky=ui.headerSticky===undefined?out.ui.headerSticky:bool(ui.headerSticky,'headerSticky');
 out.ui.headerLayout=choice(ui.headerLayout??out.ui.headerLayout,['spread','center','compact'],'headerLayout');
 out.ui.navGap=integer(ui.navGap??out.ui.navGap,0,60,'navGap');
 out.ui.logoWidth=integer(ui.logoWidth??out.ui.logoWidth,24,240,'logoWidth');
 out.ui.buttonRadius=integer(ui.buttonRadius??out.ui.buttonRadius,0,999,'buttonRadius');
 out.ui.buttonWeight=integer(ui.buttonWeight??out.ui.buttonWeight,400,900,'buttonWeight');
 out.ui.cardRadius=integer(ui.cardRadius??out.ui.cardRadius,0,60,'cardRadius');
 out.ui.cardShadow=choice(ui.cardShadow??out.ui.cardShadow,['none','soft','strong'],'cardShadow');
 out.ui.languageStyle=choice(ui.languageStyle??out.ui.languageStyle,['pills','minimal','solid'],'languageStyle');
 return out;
}

const css=String.raw`
:root{
 --sea:var(--design-accent);--sea2:var(--design-accent);--ink:var(--design-ink);--muted:var(--design-muted);--bg:var(--design-bg);--line:var(--design-border);--card:var(--design-card);
}
body{background:var(--design-bg)!important;color:var(--design-ink)!important;font-family:var(--design-font)!important;font-size:var(--design-body-size)!important}
h1,h2,h3,.brand{font-family:var(--design-font)!important}
.shell{width:min(var(--design-container),calc(100% - 32px))!important}
.page-block{margin-top:var(--design-section-gap)!important;margin-bottom:var(--design-section-gap)!important}
.page-block h1{font-size:clamp(36px,6vw,var(--design-h1-size))!important}
.page-block h2{font-size:clamp(26px,4vw,var(--design-h2-size))!important}
.site-header{min-height:var(--design-header-height)!important;background:var(--design-header)!important;color:var(--design-ink)!important;border-color:var(--design-border)!important}
.nav{min-height:var(--design-header-height)!important;gap:var(--design-nav-gap)!important}
.brand img,.design-logo{width:var(--design-logo-width)!important;height:auto!important;max-height:calc(var(--design-header-height) - 16px)!important;object-fit:contain!important;flex:none}
.wa,.wa-top,.cta,.kind-picker button,.language-buttons button{border-radius:var(--design-button-radius)!important;font-weight:var(--design-button-weight)!important}
.island-card,.item-card,.review-card,.panel,.hero,.text-block,.image-text-block,.slideshow-block,.gallery-block,.featured-block,.review-block,.faq-block,.cta-block,.island-block{border-radius:var(--design-card-radius)!important;box-shadow:var(--design-card-shadow)!important}
.island-card,.item-card,.review-card{background:var(--design-card)!important;border-color:var(--design-border)!important}
.language-buttons button{border-color:var(--design-border)!important}
html[data-language-style="minimal"] .language-buttons button{background:transparent!important;border-color:transparent!important}
html[data-language-style="solid"] .language-buttons button{background:var(--design-card)!important}
html[data-header-layout="center"] .nav{justify-content:center!important;flex-wrap:wrap}
html[data-header-layout="center"] .brand{margin-right:0!important}
html[data-header-layout="center"] .navlinks{order:3;flex-basis:100%;justify-content:center}
html[data-header-layout="compact"] .nav{justify-content:flex-start!important}html[data-header-layout="compact"] .brand{margin-right:0!important}
html[data-design-motion="off"] *,html[data-design-motion="off"] *::before,html[data-design-motion="off"] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
[hidden]{display:none!important}
@media(min-width:981px){.cards{grid-template-columns:repeat(var(--design-columns),minmax(0,1fr))}}
`;

export function applyDesign(input){
 const design=validateDesign(input),root=document.documentElement;
 let style=document.getElementById('siteDesignStyle');if(!style){style=document.createElement('style');style.id='siteDesignStyle';style.textContent=css;document.head.append(style);}
 const shadow={none:'none',soft:'0 8px 28px rgba(18,75,61,.08)',strong:'0 18px 50px rgba(16,74,59,.18)'}[design.ui.cardShadow];
 const vars={
  accent:design.colors.accent,ink:design.colors.ink,muted:design.colors.muted,bg:design.colors.background,header:design.colors.header,card:design.colors.card,border:design.colors.border,
  font:design.font==='system'?'system-ui,sans-serif':JSON.stringify(design.font)+',sans-serif',
  radius:design.radius+'px',columns:String(design.columns),container:design.ui.containerWidth+'px','section-gap':design.ui.sectionGap+'px',
  'body-size':design.ui.bodySize+'px','h1-size':design.ui.h1Size+'px','h2-size':design.ui.h2Size+'px','header-height':design.ui.headerHeight+'px',
  'nav-gap':design.ui.navGap+'px','logo-width':design.ui.logoWidth+'px','button-radius':design.ui.buttonRadius+'px','button-weight':String(design.ui.buttonWeight),
  'card-radius':design.ui.cardRadius+'px','card-shadow':shadow
 };
 for(const [k,v]of Object.entries(vars))root.style.setProperty('--design-'+k,v);
 root.dataset.designMotion=design.animations?'on':'off';root.dataset.headerLayout=design.ui.headerLayout;root.dataset.languageStyle=design.ui.languageStyle;
 document.querySelectorAll('.site-header').forEach(h=>h.style.position=design.ui.headerSticky?'sticky':'relative');
 if(design.banner)root.style.setProperty('--design-banner','url('+JSON.stringify(design.banner)+')');else root.style.removeProperty('--design-banner');
 document.querySelectorAll('.brand').forEach(brand=>{let image=brand.querySelector('.design-logo');if(design.logo){if(!image){image=document.createElement('img');image.className='design-logo';image.alt='';brand.prepend(image);}image.src=design.logo;}else image?.remove();});
 const main=document.querySelector('main');if(document.getElementById('explore')&&main)for(const key of design.order){const section=document.getElementById(key);if(section){section.hidden=design.hidden.includes(key);main.append(section);}}
 setCopyOverrides(design.text);applyCopy(document.documentElement.lang||'en');root.dataset.designReady='true';return design;
}

export async function loadDesign(){
 if(new URLSearchParams(location.search).get('design_preview')==='1'&&window.parent!==window){
  window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='NOODY_DESIGN_PREVIEW')return;try{applyDesign(event.data.design);if(['en','ml','hi'].includes(event.data.language)){const select=document.getElementById('language');if(select){select.value=event.data.language;select.dispatchEvent(new Event('change'));}}window.parent.postMessage({type:'NOODY_DESIGN_APPLIED'},location.origin);}catch{}});
  applyDesign(DEFAULT_DESIGN);window.parent.postMessage({type:'NOODY_DESIGN_READY'},location.origin);return;
 }
 try{const response=await fetch(new URL('./site-design.json',import.meta.url),{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error();const text=await response.text();if(text.length>3500000)throw Error();applyDesign(JSON.parse(text));}
 catch{applyDesign(DEFAULT_DESIGN);}
}
