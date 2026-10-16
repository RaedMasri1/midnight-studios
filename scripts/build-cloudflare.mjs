import nextEnv from '@next/env';
import {spawnSync} from 'node:child_process';
nextEnv.loadEnvConfig(process.cwd(),false);
for(const name of ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY']){
 if(!process.env[name])throw new Error('Set '+name+' in the Cloudflare Pages build environment.');
}
const origin=process.env.SITE_URL;
if(!origin||!origin.startsWith('https://'))throw new Error('Set SITE_URL to the HTTPS address assigned to this Cloudflare Pages project.');
// Always load the latest published CMS content before building. Never silently
// deploy the source ZIP's seed content when the hosting setting was omitted.
const result=spawnSync(process.execPath,['scripts/run-next.mjs','build'],{stdio:'inherit',env:{...process.env,CMS_PUBLISH_FROM_SUPABASE:'true'}});
process.exitCode=result.status??1;
