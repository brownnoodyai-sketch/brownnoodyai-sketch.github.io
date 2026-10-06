import {DEFAULT_DESIGN,TEXT_KEYS,validateDesign,safeImage} from './design.mjs';
import {copy} from './copy.mjs';
const $=id=>document.getElementById(id),key='noody.website.design.draft.v1';
let draft=structuredClone(DEFAULT_DESIGN),language='en',ready=false;
function status(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error);}
function preview(){if(ready)$('preview').contentWindow.postMessage({type:'NOODY_DESIGN_PREVIEW',design:draft,language:$('editLanguage').value},location.origin);}
function save(){try{draft=validateDesign(draft);try{localStorage.setItem(key,JSON.stringify(draft));status('Draft saved on this device.');}catch{status('Preview updated. Download your design to keep it on this device.');}preview();}catch(error){status(error.message,true);}}
function sectionControls(){
 const box=$('sections');box.replaceChildren();
 for(const [index,name]of draft.order.entries()){
  const row=document.createElement('div');row.className='row';const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=!draft.hidden.includes(name);check.disabled=name==='explore';check.onchange=()=>{draft.hidden=draft.hidden.filter(k=>k!==name);if(!check.checked)draft.hidden.push(name);save();};label.append(check,' '+({hero:'Banner',explore:'Island selection',how:'How it works',about:'About'}[name]));
  const actions=document.createElement('div');for(const [text,delta]of [['↑',-1],['↓',1]]){const button=document.createElement('button');button.type='button';button.textContent=text;button.setAttribute('aria-label','Move '+name+(delta<0?' up':' down'));button.disabled=index+delta<0||index+delta>=draft.order.length;button.onclick=()=>{[draft.order[index],draft.order[index+delta]]=[draft.order[index+delta],draft.order[index]];sectionControls();save();};actions.append(button);}row.append(label,actions);box.append(row);
 }
}
function textControls(){
 const box=$('textFields');box.replaceChildren();
 for(const name of TEXT_KEYS){const label=document.createElement('label');label.textContent=name.replace(/([A-Z])/g,' $1');const input=document.createElement('textarea');input.rows=name.toLowerCase().includes('copy')||['intro','howIntro','islandIntro'].includes(name)?3:2;input.maxLength=1600;input.dataset.textKey=name;input.value=draft.text[language][name]??'';input.placeholder=copy(language,name);input.oninput=()=>{if(input.value)draft.text[language][name]=input.value;else delete draft.text[language][name];save();};label.append(input);box.append(label);}
}
function controls(){
 document.querySelectorAll('[data-color]').forEach(input=>input.value=draft.colors[input.dataset.color]);
 for(const id of ['font','radius','columns'])$(id).value=draft[id];$('radiusValue').textContent=draft.radius+' px';$('animations').checked=draft.animations;
 for(const name of ['logo','banner'])$(name).value=draft[name].startsWith('data:')?'':draft[name];
 sectionControls();textControls();preview();
}
document.querySelectorAll('[data-color]').forEach(input=>input.oninput=()=>{draft.colors[input.dataset.color]=input.value;save();});
for(const id of ['font','radius','columns'])$(id).oninput=()=>{draft[id]=id==='font'?$(id).value:Number($(id).value);$('radiusValue').textContent=draft.radius+' px';save();};
$('animations').onchange=()=>{draft.animations=$('animations').checked;save();};
for(const name of ['logo','banner']){
 $(name).onchange=()=>{try{const value=safeImage($(name).value.trim());draft[name]=value;save();}catch(error){status(error.message,true);}};
 $(name+'Upload').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>1000000)throw Error('Choose a PNG, JPEG or WebP smaller than 1 MB.');const value=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});draft[name]=safeImage(value);$(name).value='';save();}catch(error){status(error.message,true);}finally{event.target.value='';}};
}
document.querySelectorAll('[data-clear]').forEach(button=>button.onclick=()=>{draft[button.dataset.clear]='';$(button.dataset.clear).value='';save();});
$('editLanguage').onchange=()=>{language=$('editLanguage').value;textControls();preview();};
$('download').onclick=()=>{try{const design=validateDesign(draft),blob=new Blob([JSON.stringify(design,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='site-design.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Design downloaded. Upload site-design.json to publish.');}catch(error){status(error.message,true);}};
$('reset').onclick=()=>{draft=structuredClone(DEFAULT_DESIGN);controls();save();};
$('import').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>3500000)throw Error('Design file is too large.');const candidate=validateDesign(JSON.parse(await file.text()));draft=candidate;controls();save();}catch(error){status('Import failed: '+error.message,true);}finally{event.target.value='';}};
for(const name of ['desktop','mobile'])$(name).onclick=()=>{$('preview').classList.toggle('mobile',name==='mobile');$('desktop').setAttribute('aria-pressed',String(name==='desktop'));$('mobile').setAttribute('aria-pressed',String(name==='mobile'));};
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==$('preview').contentWindow)return;if(event.data?.type==='NOODY_DESIGN_READY'){ready=true;preview();}if(event.data?.type==='NOODY_DESIGN_APPLIED')document.body.dataset.previewApplied='true';});
$('publishLink').href='https://github.com/brownnoodyai-sketch/brownnoodyai-sketch.github.io/upload/main';
try{const local=localStorage.getItem(key);if(local){draft=validateDesign(JSON.parse(local));status('Restored your device draft.');}else{const response=await fetch('./site-design.json',{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('Current design is unavailable.');const content=await response.text();if(content.length>3500000)throw Error('Design file is too large.');draft=validateDesign(JSON.parse(content));status('Current public design loaded.');}}
catch{draft=structuredClone(DEFAULT_DESIGN);status('Original design loaded.');}
controls();document.body.dataset.state='ready';
