import {ISLAND_NAMES,enquiryLink} from './catalogue.mjs';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function parseItemQuery(search){
 const q=new URLSearchParams(search),kind=(q.get('kind')||'').toUpperCase(),id=(q.get('id')||'').toLowerCase(),islandCode=(q.get('island')||'').toUpperCase();
 if(!['SERVICE','PRODUCT'].includes(kind)||!UUID.test(id)||!Object.hasOwn(ISLAND_NAMES,islandCode)||['kind','id','island'].some(k=>q.getAll(k).length!==1))return null;
 return {kind,id,islandCode};
}
export function itemLink(item,pageUrl){
 if(!parseItemQuery(new URLSearchParams({kind:item.kind,id:item.id,island:item.islandCode}).toString()))throw Error('ITEM_LINK_INVALID');
 const url=new URL('./item.html',pageUrl);url.search=new URLSearchParams({kind:item.kind,id:item.id.toLowerCase(),island:item.islandCode}).toString();url.hash='';return url.href;
}
export function websiteEnquiry(number,island,item=null,language='en',pageUrl=''){
 if(!/^[1-9][0-9]{7,14}$/.test(String(number)))return null;
 if(island&&!Object.hasOwn(ISLAND_NAMES,island))return null;
 if(item&&!island)return null;
 let link;
 if(island){link=enquiryLink(number,island,item,language);if(!link)return null;}
 else{const greeting={en:'Hello NOODY.AI, please share island service and product details.',ml:'ഹലോ NOODY.AI, ദ്വീപിലെ സേവനങ്ങളും ഉൽപ്പന്നങ്ങളും അറിയിക്കൂ.',hi:'नमस्ते NOODY.AI, द्वीप की सेवाओं और उत्पादों की जानकारी दें।'}[language]||'Hello NOODY.AI';link='https://wa.me/'+number+'?text='+encodeURIComponent(greeting+'\nNOODY_SOURCE:WEBSITE');}
 const url=new URL(link);
 if(pageUrl){const page=new URL(pageUrl);if(['http:','https:'].includes(page.protocol))url.searchParams.set('text',url.searchParams.get('text')+'\nPage: '+(item?itemLink(item,pageUrl):page.origin+page.pathname));}
 return url.href;
}
export function readLanguage(){
 try{const saved=globalThis.localStorage?.getItem('noody-language');if(['en','ml','hi'].includes(saved))return saved;}catch{}
 const language=globalThis.navigator?.language||'en';return /^ml/i.test(language)?'ml':/^hi/i.test(language)?'hi':'en';
}
export function rememberLanguage(language){if(!['en','ml','hi'].includes(language))return;try{globalThis.localStorage?.setItem('noody-language',language);}catch{}}
