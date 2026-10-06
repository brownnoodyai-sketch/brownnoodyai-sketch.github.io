const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const ISLAND_NAMES={AGATTI:'Agatti',KADMAT:'Kadmat',KAVARATTI:'Kavaratti',KALPENI:'Kalpeni'};
const scalar=(value,max)=>typeof value==='string'&&value.length<=max;
export function validateConfig(raw,pageOrigin=''){
 if(!raw||!scalar(raw.apiOrigin,250)||!scalar(raw.whatsappNumber,15)||!/^[1-9][0-9]{7,14}$/.test(raw.whatsappNumber))throw Error('CONFIG_INVALID');
 const u=new URL(raw.apiOrigin),page=pageOrigin?new URL(pageOrigin):null;
 const local=page&&['127.0.0.1','localhost'].includes(page.hostname)&&u.origin===page.origin;
 if((u.protocol!=='https:'&&!local)||u.username||u.password||u.pathname!=='/'||u.search||u.hash||(!local&&(!u.hostname.includes('.')||/^[\d.]+$/.test(u.hostname)||/\.(local|internal|localhost|test|invalid)$/.test(u.hostname))))throw Error('CONFIG_INVALID');
 return {apiOrigin:u.origin,whatsappNumber:raw.whatsappNumber};
}
export function validateCatalogue(raw){
 if(!raw||raw.contract!=='noody.public.v2'||!UUID.test(raw.sourceId)||!/^[a-f0-9]{64}$/.test(raw.revision)||!Array.isArray(raw.islands)||raw.islands.length>4||!Array.isArray(raw.items)||raw.items.length>5000||typeof raw.whatsappNumber!=='string'||!/^[1-9][0-9]{7,14}$/.test(raw.whatsappNumber))throw Error('CATALOGUE_INVALID');
 const islandCodes=new Set();
 const islands=raw.islands.map(i=>{if(!i||!(Object.hasOwn(ISLAND_NAMES,i.code))||islandCodes.has(i.code)||!scalar(i.name,80)||typeof i.active!=='boolean')throw Error('ISLAND_INVALID');islandCodes.add(i.code);return {code:i.code,name:i.name,active:i.active};});
 const active=new Set(islands.filter(i=>i.active).map(i=>i.code)),seen=new Set(),items=[];
 for(const row of raw.items){
  if(!row||!UUID.test(row.id)||!['SERVICE','PRODUCT'].includes(row.kind)||!active.has(row.islandCode)||!scalar(row.name,200)||!row.name.trim()||!scalar(row.category,140)||!scalar(row.description,6000)||!scalar(row.price,160)||!scalar(row.availability,160)||row.canonicalToken!==row.kind+':'+row.id)throw Error('ITEM_INVALID');
  const key=row.kind+':'+row.id+':'+row.islandCode;if(seen.has(key))throw Error('ITEM_DUPLICATE');seen.add(key);
  if(['travelpackage','travelpackages'].includes(row.category.toLowerCase().replace(/[\s_-]/g,'')))continue;
  items.push({id:row.id,kind:row.kind,islandCode:row.islandCode,name:row.name,category:row.category,description:row.description,price:row.price,availability:row.availability,canonicalToken:row.canonicalToken});
 }
 return {contract:raw.contract,sourceId:raw.sourceId,revision:raw.revision,islands,items,whatsappNumber:raw.whatsappNumber};
}
export function visibleItems(catalogue,{island='',kind='ALL',query=''}={}){
 const q=query.normalize('NFKC').toLocaleLowerCase().trim();
 return catalogue.items.filter(i=>(!island||i.islandCode===island)&&(kind==='ALL'||i.kind===kind)&&(!q||[i.name,i.category,i.description].join(' ').normalize('NFKC').toLocaleLowerCase().includes(q)));
}
export function itemKey(item){return item.kind+':'+item.id+':'+item.islandCode;}
export function detailLink(item,pageUrl){
 const url=new URL(pageUrl);url.search='';url.hash='/'+item.kind.toLowerCase()+'/'+item.id+'?island='+item.islandCode;return url.href;
}
export function parseDetail(hash){
 const m=/^#\/(service|product)\/([0-9a-f-]{36})\?island=(AGATTI|KADMAT|KAVARATTI|KALPENI)$/i.exec(hash);
 return m&&UUID.test(m[2])?{kind:m[1].toUpperCase(),id:m[2].toLowerCase(),islandCode:m[3].toUpperCase()}:null;
}
export function enquiryLink(number,island,item=null,language='en',pageUrl=''){
 if(!/^[1-9][0-9]{7,14}$/.test(String(number))||!(Object.hasOwn(ISLAND_NAMES,island)))return null;
 if(item&&(!UUID.test(item.id)||!['SERVICE','PRODUCT'].includes(item.kind)||item.islandCode!==island))return null;
 const greeting={en:'Hello NOODY.AI, please share details, availability and the final price.',ml:'ഹലോ NOODY.AI, വിശദാംശങ്ങളും ലഭ്യതയും അന്തിമ വിലയും അറിയിക്കൂ.',hi:'नमस्ते NOODY.AI, कृपया जानकारी, उपलब्धता और अंतिम कीमत बताएं।'}[language]||'Hello NOODY.AI, please share details.';
 const lines=[greeting,item?item.name:'Island services and products','Island: '+ISLAND_NAMES[island],'NOODY_SOURCE:WEBSITE','NOODY_ISLAND:'+island];
 if(item)lines.push('NOODY_ITEM:'+item.kind+':'+item.id);
 if(pageUrl){const u=new URL(pageUrl);if(['https:','http:'].includes(u.protocol))lines.push('Page: '+(item?detailLink(item,u.href):u.origin+u.pathname));}
 return 'https://wa.me/'+number+'?text='+encodeURIComponent(lines.join('\n'));
}
export async function readPublicJson(response,max=2000000){
 if(!response.ok)throw Error('CATALOGUE_UNAVAILABLE');
 if(Number(response.headers.get('content-length'))>max)throw Error('CATALOGUE_TOO_LARGE');
 const reader=response.body?.getReader();if(!reader)throw Error('CATALOGUE_UNAVAILABLE');const chunks=[];let length=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>max)throw Error('CATALOGUE_TOO_LARGE');chunks.push(value);}}catch(e){await reader.cancel();throw e;}
 const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}return JSON.parse(new TextDecoder().decode(bytes));
}
