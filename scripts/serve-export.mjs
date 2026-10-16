import http from 'node:http';
import path from 'node:path';
import {stat,readFile} from 'node:fs/promises';
import {preparePreviewAssets} from './prepare-preview.mjs';
const root=path.resolve('out');
const version=JSON.parse(await readFile('package.json','utf8')).version;
const args=process.argv.slice(2);
const port=Number(args[args.indexOf('--port')+1]||process.env.PORT||3000);
const mime={'.html':'text/html; charset=utf-8','.txt':'text/plain; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.xml':'application/xml','.ico':'image/x-icon','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2','.gz':'application/octet-stream'};
await stat(path.join(root,'index.html'));
await preparePreviewAssets();
http.createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end();}
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/__version'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify({project:'Midnight Studios',version}));}
  const target=path.resolve(root,'.'+pathname);
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  const candidates=path.extname(target)?[target]:[target+'.html',path.join(target,'index.html')];
  let file;
  for(const candidate of candidates){try{if((await stat(candidate)).isFile()){file=candidate;break;}}catch{}}
  const status=file?200:404;file??=path.join(root,'404.html');
  const body=await readFile(file);
  res.writeHead(status,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Content-Length':body.length,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','X-Midnight-Version':version});
  res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(400);res.end('Bad request');}
}).on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is already in use. Close the previous preview window and retry.`:error.message);process.exitCode=1;}).listen(port,'127.0.0.1',()=>console.log(`Midnight Studios v${version}: http://localhost:${port}`));
