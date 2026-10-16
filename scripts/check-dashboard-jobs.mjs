import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const source=await readFile('supabase/functions/studio-jobs/index.ts','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},reportDiagnostics:true});
assert(!(compiled.diagnostics??[]).some(d=>d.category===ts.DiagnosticCategory.Error));
const code=compiled.outputText.replace('npm:@supabase/supabase-js@2.118.0',import.meta.resolve('@supabase/supabase-js')).replace('../_shared/store-review-import.js',new URL('../supabase/functions/_shared/store-review-import.js',import.meta.url).href);
let handler;const requests=[];const realFetch=globalThis.fetch;
globalThis.Deno={env:{get:name=>({SUPABASE_URL:'https://studio-test.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-service-key',STUDIO_JOB_SECRET:'test-scheduled-secret'}[name])},serve:fn=>{handler=fn;}};
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
globalThis.fetch=async(input,options={})=>{
 const url=new URL(typeof input==='string'?input:input.url??String(input));requests.push(url.href);
 if(url.hostname!=='studio-test.supabase.co')throw new Error('Unexpected network access during job test');
 const headers=new Headers(options.headers??(input instanceof Request?input.headers:undefined));
 if(url.pathname==='/auth/v1/user')return headers.get('authorization')==='Bearer invalid'?json({msg:'invalid'},401):json({id:headers.get('authorization')==='Bearer outsider'?'outsider':'admin'});
 if(url.pathname==='/rest/v1/cms_admins')return json(url.searchParams.get('user_id')==='eq.admin'?[{user_id:'admin'}]:[]);
 if(url.pathname==='/rest/v1/rpc/cms_acquire_review_lease')return json(true);
 if(url.pathname==='/rest/v1/rpc/cms_release_review_lease')return json(null);
 if(url.pathname==='/rest/v1/cms_publication')return json({snapshot:{games:[{status:'In development'}]}});
 if(url.pathname==='/rest/v1/cms_store_cache')return options.method==='PATCH'?new Response(null,{status:204}):json({reviews:[]});
 throw new Error('Unexpected database request '+url.pathname);
};
try{
 await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const invoke=(headers={},action='deploy')=>handler(new Request('https://studio-test.supabase.co/functions/v1/studio-jobs',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify({action})}));
 assert.equal((await invoke()).status,401);
 assert.equal((await invoke({authorization:'Bearer invalid'})).status,401);
 assert.equal((await invoke({authorization:'Bearer outsider'})).status,403);
 const admin=await invoke({authorization:'Bearer admin'});assert.equal(admin.status,200);assert.match((await admin.json()).message,/Hosting is not connected/);
 const run=await invoke({authorization:'Bearer admin'},'reviews');assert.equal(run.status,200);assert.match((await run.json()).message,/No released store connections/);
 const scheduled=await invoke({'x-studio-job-secret':'test-scheduled-secret'},'reviews');assert.equal(scheduled.status,200);
 assert.equal((await invoke({'x-studio-job-secret':'test-scheduled-secret'},'deploy')).status,400);
 assert.equal((await invoke({'x-studio-job-secret':'wrong-secret'},'reviews')).status,401);
 assert(requests.every(url=>url.startsWith('https://studio-test.supabase.co/')),'No undeclared store requests or real deployment');
 console.log('PASS: transpiled Edge Function, missing/invalid user rejection, non-admin rejection, admin job authorization, honest unconfigured deployment, released-store guard and scheduled-secret scope. All API responses mocked.');
}finally{globalThis.fetch=realFetch;delete globalThis.Deno;}
