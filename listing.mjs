import {ISLAND_NAMES} from './website-data.mjs';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function parseItemQuery(search){const q=new URLSearchParams(search),kind=(q.get('kind')||'').toUpperCase(),id=(q.get('id')||'').toLowerCase(),islandCode=(q.get('island')||'').toUpperCase();if(!['SERVICE','PRODUCT'].includes(kind)||!UUID.test(id)||!Object.hasOwn(ISLAND_NAMES,islandCode)||['kind','id','island'].some(k=>q.getAll(k).length!==1))return null;return {kind,id,islandCode};}
export function itemLink(item,pageUrl){const url=new URL('./item.html',pageUrl);url.search=new URLSearchParams({kind:item.kind,id:item.id.toLowerCase(),island:item.islandCode}).toString();url.hash='';return url.href;}
export function websiteEnquiry(number,island,item=null,language='en',pageUrl=''){
 if(!/^\d{8,15}$/.test(String(number))||island&&!Object.hasOwn(ISLAND_NAMES,island)||item&&!island)return null;
 const hello={en:'Hello NOODY.AI, I would like to enquire about this item.',ml:'ഹലോ NOODY.AI, ഈ സേവനം / ഉൽപ്പന്നത്തെ കുറിച്ച് അറിയണം.',hi:'नमस्ते NOODY.AI, मुझे इस सेवा / उत्पाद के बारे में जानकारी चाहिए।'}[language]||'Hello NOODY.AI';
 const lines=[hello,'NOODY_SOURCE:WEBSITE'];if(island)lines.push('Island: '+ISLAND_NAMES[island],'NOODY_ISLAND:'+island);if(item)lines.push((item.kind==='SERVICE'?'Service: ':'Product: ')+item.name,'NOODY_WEBSITE_TYPE:'+item.kind,'NOODY_WEBSITE_ITEM:'+item.id);if(pageUrl){const p=new URL(pageUrl);lines.push('Page: '+(item?itemLink(item,p.href):p.origin+p.pathname));}
 return 'https://wa.me/'+number+'?text='+encodeURIComponent(lines.join('\n'));
}
export function readLanguage(){try{const saved=globalThis.localStorage?.getItem('noody-language');if(['en','ml','hi'].includes(saved))return saved;}catch{}const language=globalThis.navigator?.language||'en';return /^ml/i.test(language)?'ml':/^hi/i.test(language)?'hi':'en';}
export function rememberLanguage(language){if(!['en','ml','hi'].includes(language))return;try{globalThis.localStorage?.setItem('noody-language',language);}catch{}}
