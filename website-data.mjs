export const SITE_SCHEMA='noody.website.v1';
export const LANGUAGES=['en','ml','hi'];
export const ISLAND_NAMES={AGATTI:'Agatti',KADMAT:'Kadmat',KAVARATTI:'Kavaratti',KALPENI:'Kalpeni'};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text=(v,max)=>typeof v==='string'&&v.length<=max?v:undefined;
const localizedText=(raw,max)=>Object.fromEntries(LANGUAGES.map(l=>[l,text(raw?.[l]??'',max)??'']));
export function photoUrl(value){
 if(typeof value!=='string'||value.length>1600)throw Error('IMAGE_INVALID');
 if(/^\.\/media\/[a-zA-Z0-9_-]+\.(webp|png|jpg|jpeg)$/.test(value))return value;
 const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||!u.hostname.includes('.')||/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[)/i.test(u.hostname)||/^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname))throw Error('IMAGE_INVALID');return u.href;
}
function validateBlock(block,seen){
 if(!block||typeof block.id!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(block.id)||seen.has(block.id))throw Error('BLOCK_INVALID');seen.add(block.id);
 if(!['section','highlight','note','steps'].includes(block.style))throw Error('BLOCK_INVALID');
 return {id:block.id,style:block.style,title:localizedText(block.title,300),body:localizedText(block.body,10000)};
}
function validateReview(row){
 if(!row||typeof row.id!=='string'||!UUID.test(row.id)||typeof row.firstName!=='string'||!row.firstName.trim()||row.firstName.length>80||!Number.isInteger(row.stars)||row.stars<1||row.stars>5||typeof row.comment!=='string'||row.comment.length>4000)throw Error('REVIEW_INVALID');
 const date=typeof row.date==='string'&&row.date.length<=40?row.date:'';
 return {id:row.id,firstName:row.firstName.trim(),stars:row.stars,comment:row.comment.trim(),date,verified:row.verified===true};
}
export function blankItem(kind='SERVICE',islandCode='AGATTI'){
 const id=crypto.randomUUID();return {id,kind, islandCode,name:'',category:'',active:true,priceText:'Ask on WhatsApp',availabilityText:'Confirm on WhatsApp',title:{en:'',ml:'',hi:''},summary:{en:'',ml:'',hi:''},description:{en:'',ml:'',hi:''},photos:[],blocks:[],reviews:[]};
}
export function validateWebsiteData(raw){
 if(!raw||raw.schema!==SITE_SCHEMA||!/^\d{8,15}$/.test(String(raw.whatsappNumber||''))||!Array.isArray(raw.islands)||raw.islands.length>4||!Array.isArray(raw.items)||raw.items.length>5000||!Array.isArray(raw.homepageBlocks)||raw.homepageBlocks.length>100)throw Error('WEBSITE_DATA_INVALID');
 const islandSeen=new Set(),islands=raw.islands.map(i=>{if(!i||!Object.hasOwn(ISLAND_NAMES,i.code)||islandSeen.has(i.code)||typeof i.active!=='boolean')throw Error('ISLAND_INVALID');islandSeen.add(i.code);return {code:i.code,name:ISLAND_NAMES[i.code],active:i.active};});
 const active=new Set(islands.filter(i=>i.active).map(i=>i.code)),itemSeen=new Set();
 const items=raw.items.map(row=>{
  if(!row||!UUID.test(row.id)||!['SERVICE','PRODUCT'].includes(row.kind)||!Object.hasOwn(ISLAND_NAMES,row.islandCode)||typeof row.active!=='boolean'||!text(row.name,200)||!row.name.trim()||!text(row.category,140))throw Error('ITEM_INVALID');
  const key=row.kind+':'+row.id+':'+row.islandCode;if(itemSeen.has(key))throw Error('ITEM_DUPLICATE');itemSeen.add(key);
  if(!active.has(row.islandCode)&&row.active)throw Error('ITEM_ISLAND_INACTIVE');
  if(['travelpackage','travelpackages'].includes(row.category.toLowerCase().replace(/[\s_-]/g,'')))throw Error('TRAVEL_PACKAGE_DISABLED');
  const photos=Array.isArray(row.photos)?row.photos:[];if(photos.length>30)throw Error('TOO_MANY_PHOTOS');
  const cleanPhotos=photos.map(p=>({src:photoUrl(p.src),alt:localizedText(p.alt,240)}));
  const seenBlocks=new Set(),blocks=(Array.isArray(row.blocks)?row.blocks:[]);if(blocks.length>100)throw Error('TOO_MANY_BLOCKS');
  const reviews=(Array.isArray(row.reviews)?row.reviews:[]);if(reviews.length>200)throw Error('TOO_MANY_REVIEWS');
  return {id:row.id.toLowerCase(),kind:row.kind,islandCode:row.islandCode,name:row.name.trim(),category:row.category.trim(),active:row.active,priceText:text(row.priceText??'',200)??'',availabilityText:text(row.availabilityText??'',200)??'',title:localizedText(row.title,300),summary:localizedText(row.summary,800),description:localizedText(row.description,12000),photos:cleanPhotos,blocks:blocks.map(b=>validateBlock(b,seenBlocks)),reviews:reviews.map(validateReview)};
 });
 const seenHome=new Set(),homepageBlocks=raw.homepageBlocks.map(b=>validateBlock(b,seenHome));
 return {schema:SITE_SCHEMA,whatsappNumber:String(raw.whatsappNumber),islands,homepageBlocks,items};
}
export async function loadWebsiteData(url=new URL('./website-data.json',import.meta.url)){
 const r=await fetch(url,{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('WEBSITE_DATA_UNAVAILABLE');const s=await r.text();if(s.length>6000000)throw Error('WEBSITE_DATA_TOO_LARGE');return validateWebsiteData(JSON.parse(s));
}
export function visibleItems(data,{island='',kind='ALL'}={}){return data.items.filter(i=>i.active&&(!island||i.islandCode===island)&&(kind==='ALL'||i.kind===kind));}
export function localize(map,lang,fallback=''){return map?.[lang]||map?.en||Object.values(map||{}).find(Boolean)||fallback;}
