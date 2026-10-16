import nextEnv from '@next/env';
const {loadEnvConfig}=nextEnv;
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {rm} from 'node:fs/promises';

const [command,...input]=process.argv.slice(2);
if(!['dev','build','start'].includes(command))throw new Error('Expected dev, build or start');
const args=input.filter(arg=>arg!=='--strictPort').map(arg=>arg==='--host'?'--hostname':arg);
const projectRoot=path.dirname(fileURLToPath(new URL('../package.json',import.meta.url)));
loadEnvConfig(projectRoot,command==='dev');
if(command==='build'&&process.env.CMS_PUBLISH_FROM_SUPABASE==='true'){
 const pull=spawnSync(process.execPath,['--experimental-strip-types','scripts/pull-supabase.mjs'],{cwd:projectRoot,stdio:'inherit',env:process.env});
 if(pull.status!==0)process.exit(pull.status??1);
}
if(command==='dev'&&!args.some(arg=>arg==='--port'||arg==='-p'))args.push('--port','3000');
if(command==='dev'&&!args.includes('--hostname'))args.push('--hostname','0.0.0.0');
if(command==='build'){
 // Next can retain old hashed chunks in .next/static and copy them into a fresh
 // export. Clear both build outputs so repeated builds ship one coherent version.
 await rm(path.join(projectRoot,'out'),{recursive:true,force:true});
 await rm(path.join(projectRoot,'.next'),{recursive:true,force:true});
 args.push('--webpack');
}
if(command==='start')throw new Error('This phase exports the public website to out/. Serve that directory, or switch to a server deployment when adding the CMS.');
const child=spawn(process.execPath,[fileURLToPath(new URL('../node_modules/next/dist/bin/next',import.meta.url)),command,...args],{
 cwd:projectRoot,
 stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}
});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;});
