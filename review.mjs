import {validateConfig,readPublicJson} from './catalogue.mjs';import {REVIEW_COPY} from './reviews.mjs';import {readLanguage,rememberLanguage} from './listing.mjs';
const $=id=>document.getElementById(id),token=location.hash.slice(1);let language=readLanguage(),config=null;
const text=key=>REVIEW_COPY[language][key];
function render(){document.documentElement.lang=language;$('language').value=language;document.querySelectorAll('[data-review-copy]').forEach(node=>node.textContent=text(node.dataset.reviewCopy));}
render();history.replaceState(null,'',location.pathname+location.search);$('usedOn').max=new Date().toLocaleDateString('en-CA');
$('language').onchange=e=>{language=e.target.value;rememberLanguage(language);render();};
if(!/^[A-Za-z0-9_-]{43}$/.test(token)){$('reviewForm').hidden=true;$('status').textContent=text('invalid');document.body.dataset.state='unavailable';}
else{document.body.dataset.state='ready';}
$('reviewForm').onsubmit=async event=>{event.preventDefault();$('submitReview').disabled=true;try{
 if(!config){const response=await fetch('./config.json',{credentials:'omit',signal:AbortSignal.timeout(8000)});config=validateConfig(await readPublicJson(response,4096),location.origin);}
 const response=await fetch(config.apiOrigin+'/v1/public/reviews',{method:'POST',credentials:'omit',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,stars:Number($('stars').value),firstName:$('firstName').value,comment:$('comment').value,usedOn:$('usedOn').value||null,publicConsent:$('consent').checked}),signal:AbortSignal.timeout(15000)}),result=await readPublicJson(response,4096);
 if(result.received!==true||result.moderation!=='PENDING')throw Error('REVIEW_RESPONSE_INVALID');$('reviewForm').hidden=true;$('status').textContent=text('thanks');$('status').classList.remove('error');
 }catch{$('status').textContent=text('failed');$('status').classList.add('error');}finally{$('submitReview').disabled=false;}};
