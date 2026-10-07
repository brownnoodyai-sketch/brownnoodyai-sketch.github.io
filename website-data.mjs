export const SITE_SCHEMA='noody.website.v2';
export const LANGUAGES=['en','ml','hi'];
export const ISLAND_NAMES={AGATTI:'Agatti',KADMAT:'Kadmat',KAVARATTI:'Kavaratti',KALPENI:'Kalpeni'};
export const BLOCK_TYPES=['hero','islandSelector','text','imageText','slideshow','gallery','featuredItems','reviews','faq','whatsappCta','spacer'];
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ID=/^[A-Za-z0-9_-]{1,80}$/;
const SLUG=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const scalar=(v,max)=>typeof v==='string'&&v.length<=max?v:undefined;
const localized=(raw,max)=>Object.fromEntries(LANGUAGES.map(l=>[l,scalar(raw?.[l]??'',max)??'']));
const color=(v,fallback='')=>typeof v==='string'&&(/^#[0-9a-f]{6}$/i.test(v)||v==='transparent')?v:fallback;
export function photoUrl(value){
 if(value==='')return '';
 if(typeof value!=='string'||value.length>1800)throw Error('IMAGE_INVALID');
 if(/^\.\/media\/[a-zA-Z0-9_-]+\.(webp|png|jpg|jpeg)$/.test(value))return value;
 const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||!u.hostname.includes('.')||/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[)/i.test(u.hostname)||/^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname))throw Error('IMAGE_INVALID');return u.href;
}
function safeUrl(value){
 if(!value)return '';
 if(typeof value!=='string'||value.length>1600)throw Error('URL_INVALID');
 const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)throw Error('URL_INVALID');return u.href;
}
function validateDetail(row,seen){
 if(!row||typeof row.id!=='string'||!ID.test(row.id)||seen.has(row.id))throw Error('DETAIL_INVALID');seen.add(row.id);
 const label=localized(row.label,180),value=localized(row.value,1200);if(!Object.values(label).some(Boolean)&&!Object.values(value).some(Boolean))throw Error('DETAIL_EMPTY');return {id:row.id,label,value};
}
function validateReview(row){
 if(!row||!UUID.test(row.id)||typeof row.firstName!=='string'||!row.firstName.trim()||row.firstName.length>80||!Number.isInteger(row.stars)||row.stars<1||row.stars>5)throw Error('REVIEW_INVALID');
 const original=typeof row.comment==='string'&&row.comment.length<=4000?row.comment.trim():'';
 const commentText=localized(row.commentText??{en:original},4000);
 return {id:row.id,firstName:row.firstName.trim(),stars:row.stars,comment:original,commentText,date:scalar(row.date??'',40)??'',verified:row.verified===true};
}
function validateLegacyBlock(block,seen){
 if(!block||!ID.test(block.id)||seen.has(block.id))throw Error('ITEM_BLOCK_INVALID');seen.add(block.id);if(!['section','highlight','note','steps'].includes(block.style))throw Error('ITEM_BLOCK_INVALID');
 return {id:block.id,style:block.style,title:localized(block.title,300),body:localized(block.body,10000)};
}
function blockStyle(raw={}){
 const padding=Number.isInteger(raw.padding)&&raw.padding>=0&&raw.padding<=140?raw.padding:48;
 const radius=Number.isInteger(raw.radius)&&raw.radius>=0&&raw.radius<=80?raw.radius:24;
 const bgX=Number.isInteger(raw.bgX)&&raw.bgX>=0&&raw.bgX<=100?raw.bgX:50;
 const bgY=Number.isInteger(raw.bgY)&&raw.bgY>=0&&raw.bgY<=100?raw.bgY:50;
 const overlay=Number.isInteger(raw.overlay)&&raw.overlay>=0&&raw.overlay<=90?raw.overlay:45;
 const minHeight=Number.isInteger(raw.minHeight)&&raw.minHeight>=120&&raw.minHeight<=1000?raw.minHeight:460;
 const contentWidth=Number.isInteger(raw.contentWidth)&&raw.contentWidth>=260&&raw.contentWidth<=1400?raw.contentWidth:700;
 const gap=Number.isInteger(raw.gap)&&raw.gap>=0&&raw.gap<=120?raw.gap:24;
 return {background:color(raw.background,'transparent'),textColor:color(raw.textColor,''),align:['left','center','right'].includes(raw.align)?raw.align:'left',width:['full','wide','normal','narrow'].includes(raw.width)?raw.width:'wide',padding,radius,bgX,bgY,bgSize:['cover','contain','auto'].includes(raw.bgSize)?raw.bgSize:'cover',overlay,minHeight,contentWidth,gap};
}
function validateFaq(row){
 if(!row||!ID.test(row.id))throw Error('FAQ_INVALID');return {id:row.id,question:localized(row.question,500),answer:localized(row.answer,5000)};
}
function validateBlock(raw,seen){
 if(!raw||!ID.test(raw.id)||seen.has(raw.id)||!BLOCK_TYPES.includes(raw.type))throw Error('PAGE_BLOCK_INVALID');seen.add(raw.id);
 const images=Array.isArray(raw.images)?raw.images:[];if(images.length>40)throw Error('BLOCK_IMAGES_LIMIT');
 const faqs=Array.isArray(raw.faqs)?raw.faqs:[];if(faqs.length>50)throw Error('FAQ_LIMIT');
 return {
  id:raw.id,type:raw.type,active:raw.active!==false,
  eyebrow:localized(raw.eyebrow,200),title:localized(raw.title,500),body:localized(raw.body,12000),
  image:photoUrl(raw.image??''),images:images.map(x=>({src:photoUrl(x.src),alt:localized(x.alt,240)})),
  style:blockStyle(raw.style),
  variant:scalar(raw.variant??'',80)??'',
  ctaLabel:localized(raw.ctaLabel,200),ctaAction:['none','whatsapp','page','url'].includes(raw.ctaAction)?raw.ctaAction:'none',
  ctaTarget:raw.ctaAction==='url'?safeUrl(raw.ctaTarget??''):scalar(raw.ctaTarget??'',240)??'',
  itemKind:['SERVICE','PRODUCT','ALL'].includes(raw.itemKind)?raw.itemKind:'ALL',
  category:scalar(raw.category??'',140)??'',islandCode:Object.hasOwn(ISLAND_NAMES,raw.islandCode)?raw.islandCode:'',
  limit:Number.isInteger(raw.limit)&&raw.limit>=1&&raw.limit<=100?raw.limit:8,
  columns:Number.isInteger(raw.columns)&&raw.columns>=1&&raw.columns<=4?raw.columns:3,
  faqs:faqs.map(validateFaq),
  height:Number.isInteger(raw.height)&&raw.height>=20&&raw.height<=500?raw.height:80
 };
}
function validatePage(row,seenSlug){
 if(!row||!UUID.test(row.id)||typeof row.slug!=='string'||!SLUG.test(row.slug)||seenSlug.has(row.slug)||!Array.isArray(row.blocks)||row.blocks.length>100)throw Error('PAGE_INVALID');seenSlug.add(row.slug);
 const seen=new Set();return {id:row.id.toLowerCase(),slug:row.slug,active:row.active!==false,showInNav:row.showInNav===true,navLabel:localized(row.navLabel,100),title:localized(row.title,300),metaDescription:localized(row.metaDescription,500),blocks:row.blocks.map(b=>validateBlock(b,seen))};
}
export function blankPage(slug='new-page'){return {id:crypto.randomUUID(),slug,active:true,showInNav:true,navLabel:{en:'New page',ml:'',hi:''},title:{en:'New page',ml:'',hi:''},metaDescription:{en:'',ml:'',hi:''},blocks:[]};}
export function blankPageBlock(type='text'){return {id:crypto.randomUUID(),type,active:true,eyebrow:{en:'',ml:'',hi:''},title:{en:'',ml:'',hi:''},body:{en:'',ml:'',hi:''},image:'',images:[],style:{background:'transparent',textColor:'',align:'left',width:'wide',padding:48,radius:24,bgX:50,bgY:50,bgSize:'cover',overlay:45,minHeight:460,contentWidth:700,gap:24},variant:'',ctaLabel:{en:'',ml:'',hi:''},ctaAction:'none',ctaTarget:'',itemKind:'ALL',category:'',islandCode:'',limit:8,columns:3,faqs:[],height:80};}
export function blankItem(kind='SERVICE',islandCode='AGATTI'){return {id:crypto.randomUUID(),kind,islandCode,name:'',category:'',active:true,priceText:'Ask on WhatsApp',availabilityText:'Confirm on WhatsApp',categoryLabel:{en:'',ml:'',hi:''},priceLabel:{en:'Ask on WhatsApp',ml:'WhatsApp-ൽ ചോദിക്കൂ',hi:'WhatsApp पर पूछें'},availabilityLabel:{en:'Confirm on WhatsApp',ml:'WhatsApp-ൽ സ്ഥിരീകരിക്കുക',hi:'WhatsApp पर पुष्टि करें'},title:{en:'',ml:'',hi:''},summary:{en:'',ml:'',hi:''},description:{en:'',ml:'',hi:''},photos:[],details:[],blocks:[],reviews:[]};}
function upgradeV1(raw){
 const hero=blankPageBlock('hero');hero.eyebrow.en='LAKSHADWEEP · INDIA';hero.title.en='A little island. A world of possibilities.';hero.body.en='Choose an island, explore services or products, then continue your enquiry through WhatsApp.';hero.variant='split';
 const islands=blankPageBlock('islandSelector');islands.eyebrow.en='START HERE';islands.title.en='Choose your island.';islands.body.en='Choose an island to browse customer information for Services and Products.';islands.variant='cards';
 const home=blankPage('home');home.showInNav=false;home.navLabel.en='Home';home.title.en='NOODY.AI';home.blocks=[hero,islands,...(raw.homepageBlocks||[]).map(x=>{const b=blankPageBlock('text');b.id=x.id;b.title=x.title||b.title;b.body=x.body||b.body;b.variant=x.style||'';return b;})];
 return {...raw,schema:SITE_SCHEMA,brand:{name:'NOODY.AI',logo:'',tagline:{en:'Next-gen Oceanic Operations, Data & Yield.',ml:'',hi:''}},pages:[home],media:[],footer:{text:{en:'Explore Lakshadweep with NOODY.AI.',ml:'',hi:''},showPrivacy:true}};
}
export function validateWebsiteData(input){
 const raw=input?.schema==='noody.website.v1'?upgradeV1(input):input;
 if(!raw||raw.schema!==SITE_SCHEMA||!/^\d{8,15}$/.test(String(raw.whatsappNumber||''))||!Array.isArray(raw.islands)||raw.islands.length>4||!Array.isArray(raw.items)||raw.items.length>5000||!Array.isArray(raw.pages)||raw.pages.length<1||raw.pages.length>100||!Array.isArray(raw.media??[])||(raw.media??[]).length>1000)throw Error('WEBSITE_DATA_INVALID');
 const brand={name:(scalar(raw.brand?.name??'NOODY.AI',100)??'NOODY.AI').trim()||'NOODY.AI',logo:photoUrl(raw.brand?.logo??''),tagline:localized(raw.brand?.tagline,300)};
 const islandSeen=new Set(),islands=raw.islands.map(i=>{if(!i||!Object.hasOwn(ISLAND_NAMES,i.code)||islandSeen.has(i.code)||typeof i.active!=='boolean')throw Error('ISLAND_INVALID');islandSeen.add(i.code);return {code:i.code,name:ISLAND_NAMES[i.code],active:i.active,image:photoUrl(i.image??''),title:localized(i.title,160),description:localized(i.description,600)};});
 const active=new Set(islands.filter(i=>i.active).map(i=>i.code)),itemSeen=new Set();
 const items=raw.items.map(row=>{if(!row||!UUID.test(row.id)||!['SERVICE','PRODUCT'].includes(row.kind)||!Object.hasOwn(ISLAND_NAMES,row.islandCode)||typeof row.active!=='boolean'||!scalar(row.name,200)?.trim()||!scalar(row.category,140))throw Error('ITEM_INVALID');const key=row.kind+':'+row.id+':'+row.islandCode;if(itemSeen.has(key))throw Error('ITEM_DUPLICATE');itemSeen.add(key);if(!active.has(row.islandCode)&&row.active)throw Error('ITEM_ISLAND_INACTIVE');if(['travelpackage','travelpackages'].includes(row.category.toLowerCase().replace(/[\s_-]/g,'')))throw Error('TRAVEL_PACKAGE_DISABLED');const photos=Array.isArray(row.photos)?row.photos:[];if(photos.length>30)throw Error('TOO_MANY_PHOTOS');const details=Array.isArray(row.details)?row.details:[];if(details.length>80)throw Error('TOO_MANY_DETAILS');const seenDetails=new Set(),blocks=Array.isArray(row.blocks)?row.blocks:[];if(blocks.length>100)throw Error('TOO_MANY_BLOCKS');const seenBlocks=new Set(),reviews=Array.isArray(row.reviews)?row.reviews:[];if(reviews.length>200)throw Error('TOO_MANY_REVIEWS');return {id:row.id.toLowerCase(),kind:row.kind,islandCode:row.islandCode,name:row.name.trim(),category:row.category.trim(),active:row.active,priceText:scalar(row.priceText??'',200)??'',availabilityText:scalar(row.availabilityText??'',200)??'',categoryLabel:localized(row.categoryLabel??{en:row.category},200),priceLabel:localized(row.priceLabel??{en:row.priceText??''},300),availabilityLabel:localized(row.availabilityLabel??{en:row.availabilityText??''},300),title:localized(row.title,300),summary:localized(row.summary,800),description:localized(row.description,12000),photos:photos.map(p=>({src:photoUrl(p.src),alt:localized(p.alt,240)})),details:details.map(d=>validateDetail(d,seenDetails)),blocks:blocks.map(b=>validateLegacyBlock(b,seenBlocks)),reviews:reviews.map(validateReview)};});
 const seenSlug=new Set(),pages=raw.pages.map(p=>validatePage(p,seenSlug));if(!pages.some(p=>p.slug==='home'))throw Error('HOME_PAGE_REQUIRED');
 const mediaSeen=new Set(),media=(raw.media??[]).map(m=>{if(!m||!UUID.test(m.id)||mediaSeen.has(m.id))throw Error('MEDIA_INVALID');mediaSeen.add(m.id);return {id:m.id.toLowerCase(),src:photoUrl(m.src),title:localized(m.title,200)};});
 const footer={text:localized(raw.footer?.text,1000),showPrivacy:raw.footer?.showPrivacy!==false};
 return {schema:SITE_SCHEMA,whatsappNumber:String(raw.whatsappNumber),brand,islands,pages,media,footer,items};
}
export async function loadWebsiteData(url=new URL('./website-data.json',import.meta.url)){const r=await fetch(url,{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('WEBSITE_DATA_UNAVAILABLE');const s=await r.text();if(s.length>8000000)throw Error('WEBSITE_DATA_TOO_LARGE');return validateWebsiteData(JSON.parse(s));}
export function visibleItems(data,{island='',kind='ALL',category=''}={}){return data.items.filter(i=>i.active&&(!island||i.islandCode===island)&&(kind==='ALL'||i.kind===kind)&&(!category||i.category===category));}
export function localize(map,lang,fallback=''){return map?.[lang]||map?.en||Object.values(map||{}).find(Boolean)||fallback;}
export function pageLink(page,pageUrl){const url=page.slug==='home'?new URL('./',pageUrl):new URL('./page.html',pageUrl);if(page.slug!=='home')url.search=new URLSearchParams({slug:page.slug}).toString();return url.href;}
