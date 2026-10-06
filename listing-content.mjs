export const CONTENT_SCHEMA='noody.listing-content.v1';
export const LANGUAGES=['en','ml','hi'];
export const FIELDS=['title','summary','description','highlights','included','notIncluded','precautions','requirements','specifications','goodFor','duration','meetingPoint','delivery','faq'];
export const FIELD_LABELS={title:'Listing title',summary:'Short introduction',description:'Full description',highlights:'Why customers will like it',included:'What is included',notIncluded:'What is not included',precautions:'Things to keep in mind',requirements:'What to bring / eligibility',specifications:'Materials, ingredients, sizes or technical details',goodFor:'Who this is suitable for',duration:'Duration / turnaround time',meetingPoint:'Meeting point / service area',delivery:'Delivery, pickup and gift options',faq:'Common questions and answers'};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function contentKey(item){if(!item||!['SERVICE','PRODUCT'].includes(item.kind)||!UUID.test(item.id)||!['AGATTI','KADMAT','KALPENI','KAVARATTI'].includes(item.islandCode))throw Error('Choose a valid listing and island.');return item.kind.toLowerCase()+'_'+item.id.toLowerCase()+'_'+item.islandCode.toLowerCase();}
export function photoUrl(value){
 if(typeof value!=='string'||value.length>1500)throw Error('Image link is invalid.');
 if(/^\.\/media\/[a-zA-Z0-9_-]+\.(webp|png|jpg|jpeg)$/.test(value))return value;
 let url;try{url=new URL(value);}catch{throw Error('Use a public HTTPS image URL.');}
 if(url.protocol!=='https:'||url.username||url.password||!url.hostname.includes('.')||/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[)/i.test(url.hostname)||/^172\.(1[6-9]|2\d|3[01])\./.test(url.hostname))throw Error('Use a public HTTPS image URL.');
 return url.href;
}
export function blankContent(item){contentKey(item);return {schema:CONTENT_SCHEMA,kind:item.kind,id:item.id.toLowerCase(),islandCode:item.islandCode,template:item.kind==='SERVICE'?'service':'product',text:{en:{},ml:{},hi:{}},photos:[]};}
export function validateContent(raw,target){
 if(!raw||raw.schema!==CONTENT_SCHEMA)throw Error('Unsupported listing content.');
 const out=blankContent(raw);if(target&&contentKey(target)!==contentKey(raw))throw Error('This content belongs to another listing or island.');
 if(!['service','product','gift','photography'].includes(raw.template))throw Error('Invalid listing style.');out.template=raw.template;
 for(const language of LANGUAGES)for(const field of FIELDS){const value=raw.text?.[language]?.[field];if(value!==undefined){const max=field==='title'?200:field==='summary'?400:6000;if(typeof value!=='string'||value.length>max)throw Error(FIELD_LABELS[field]+' is too long.');if(value.trim())out.text[language][field]=value.trim();}}
 if(!Array.isArray(raw.photos)||raw.photos.length>8)throw Error('Use up to eight photos.');
 out.photos=raw.photos.map(photo=>{const alt={};for(const language of LANGUAGES){const value=photo.alt?.[language]??'';if(typeof value!=='string'||value.length>200)throw Error('Image description is too long.');alt[language]=value;}return {src:photoUrl(photo.src),alt};});
 return out;
}
export function validateContentIndex(raw){
 if(!raw||raw.schema!=='noody.listing-index.v1'||!Array.isArray(raw.entries)||raw.entries.length>2000)throw Error('Invalid listing index.');
 const seen=new Set();return {schema:raw.schema,entries:raw.entries.map(entry=>{
  const key=contentKey(entry);if(seen.has(key))throw Error('Duplicate listing content.');seen.add(key);const text={en:{},ml:{},hi:{}};
  for(const language of LANGUAGES)for(const field of ['title','summary']){const v=entry.text?.[language]?.[field];if(v!==undefined){if(typeof v!=='string'||v.length>(field==='title'?200:400))throw Error('Invalid listing introduction.');text[language][field]=v;}}
  const cover=entry.cover?{src:photoUrl(entry.cover.src),alt:Object.fromEntries(LANGUAGES.map(l=>[l,typeof entry.cover.alt?.[l]==='string'?entry.cover.alt[l].slice(0,200):'']))}:null;
  return {kind:entry.kind,id:entry.id.toLowerCase(),islandCode:entry.islandCode,path:'./listing-content/'+key+'.json',text,cover};
 })};
}
export function updateContentIndex(index,content){
 const valid=validateContent(content),key=contentKey(valid),entry={kind:valid.kind,id:valid.id,islandCode:valid.islandCode,text:Object.fromEntries(LANGUAGES.map(l=>[l,{title:valid.text[l].title||'',summary:valid.text[l].summary||''}])),cover:valid.photos[0]||null};
 return validateContentIndex({schema:'noody.listing-index.v1',entries:[...index.entries.filter(e=>contentKey(e)!==key),entry]});
}
export function localized(content,language,field,fallback=''){return content?.text?.[language]?.[field]||content?.text?.en?.[field]||Object.values(content?.text||{}).map(t=>t[field]).find(Boolean)||fallback;}
async function read(response,max){if(!response.ok)throw Error('Content unavailable.');const reader=response.body.getReader(),chunks=[];let size=0;try{for(;;){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.length;if(size>max)throw Error('Content too large.');chunks.push(chunk.value);}}catch(error){await reader.cancel();throw error;}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return JSON.parse(new TextDecoder().decode(bytes));}
let indexPromise;
export function loadContentIndex(){return indexPromise??=fetch(new URL('./listing-content.json',import.meta.url),{credentials:'omit',signal:AbortSignal.timeout(8000)}).then(r=>read(r,2500000)).then(validateContentIndex).catch(()=>({schema:'noody.listing-index.v1',entries:[]}));}
export async function loadListingContent(item){const index=await loadContentIndex(),entry=index.entries.find(e=>contentKey(e)===contentKey(item));if(!entry)return null;try{return validateContent(await read(await fetch(new URL(entry.path,import.meta.url),{credentials:'omit',signal:AbortSignal.timeout(8000)}),300000),item);}catch{return null;}}
export function entryFor(index,item){return index.entries.find(entry=>contentKey(entry)===contentKey(item))||null;}
export const SECTION_TITLES={
 en:{highlights:'Highlights',included:'Included',notIncluded:'Not included',precautions:'Before you choose',requirements:'What you need',specifications:'Product / service details',goodFor:'Best suited for',duration:'Duration & timing',meetingPoint:'Location & meeting point',delivery:'Delivery, pickup & gifting',faq:'Questions answered',gallery:'Photos',reviews:'Customer reviews',noReviews:'No verified reviews yet',fallback:'Some information is shown in the original language.',back:'Previous photo',next:'Next photo'},
 ml:{highlights:'പ്രധാന പ്രത്യേകതകൾ',included:'ഉൾപ്പെടുന്ന കാര്യങ്ങൾ',notIncluded:'ഉൾപ്പെടാത്ത കാര്യങ്ങൾ',precautions:'തിരഞ്ഞെടുക്കുന്നതിന് മുമ്പ് ശ്രദ്ധിക്കൂ',requirements:'ആവശ്യമായ കാര്യങ്ങൾ',specifications:'ഉൽപ്പന്നം / സേവന വിവരങ്ങൾ',goodFor:'ആർക്കാണ് അനുയോജ്യം',duration:'ദൈർഘ്യവും സമയവും',meetingPoint:'സ്ഥലവും കൂടിക്കാഴ്ചയും',delivery:'Delivery, pickup, gift വിവരങ്ങൾ',faq:'പതിവ് ചോദ്യങ്ങൾ',gallery:'ഫോട്ടോകൾ',reviews:'Customer reviews',noReviews:'Verified reviews ഇതുവരെ ഇല്ല',fallback:'ചില വിവരങ്ങൾ original language-ൽ കാണിക്കുന്നു.',back:'മുൻ ഫോട്ടോ',next:'അടുത്ത ഫോട്ടോ'},
 hi:{highlights:'मुख्य बातें',included:'क्या शामिल है',notIncluded:'क्या शामिल नहीं है',precautions:'चुनने से पहले ध्यान दें',requirements:'आपको क्या चाहिए',specifications:'उत्पाद / सेवा विवरण',goodFor:'किसके लिए उपयुक्त है',duration:'अवधि और समय',meetingPoint:'स्थान और मिलने की जगह',delivery:'डिलीवरी, पिकअप और उपहार',faq:'आम सवाल',gallery:'तस्वीरें',reviews:'ग्राहकों की राय',noReviews:'अभी सत्यापित समीक्षाएं नहीं हैं',fallback:'कुछ जानकारी मूल भाषा में दिखाई गई है।',back:'पिछली तस्वीर',next:'अगली तस्वीर'}
};
