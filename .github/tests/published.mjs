import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
const origin='https://brownnoodyai-sketch.github.io',paths=['index.html','item.html','index.mjs','item.mjs','catalogue.mjs','listing.mjs','copy.mjs','config.json','design.mjs','designer.mjs','designer.html','site-design.json','listing-content.mjs','listing-content.json','listing-editor.html','listing-editor.mjs','zip.mjs','reviews.mjs','review.mjs','review.html'];
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const expected=new Map(await Promise.all(paths.map(async path=>[path,digest(await readFile(path))])));
let problem='publication not ready';
for(let attempt=1;attempt<=24;attempt++){
 try{
  await Promise.all(paths.map(async path=>{const response=await fetch(origin+'/'+path+'?noody_release='+encodeURIComponent(process.env.GITHUB_SHA||'verification')+'&attempt='+attempt,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error(path+' HTTP '+response.status);if(path.endsWith('.mjs')&&!/^(application|text)\/(javascript|ecmascript)/i.test(response.headers.get('content-type')||''))throw Error(path+' invalid module MIME');if(digest(Buffer.from(await response.arrayBuffer()))!==expected.get(path))throw Error(path+' different source version');}));
  const privacy=await fetch(origin+'/privacy.html',{redirect:'error',signal:AbortSignal.timeout(8000)});if(!privacy.ok)throw Error('privacy page unavailable');
  for(const path of ['.github/tests/fixture.mjs','README.md']){const response=await fetch(origin+'/'+path+'?noody_release='+encodeURIComponent(process.env.GITHUB_SHA||'verification'),{redirect:'error',signal:AbortSignal.timeout(8000)});if(response.status!==404)throw Error(path+' unexpectedly published');}
  console.log(JSON.stringify({websitePublished:true,url:origin+'/',matchingPublicAssets:paths.length,privacyAvailable:true,ciFixturesPublished:false}));process.exit(0);
 }catch(error){problem=error.message;console.log('Waiting for matching Pages publication ('+attempt+'/24): '+problem);}
 if(attempt<24)await new Promise(resolve=>setTimeout(resolve,10000));
}
console.error('Unable to verify published website: '+problem);process.exitCode=1;
