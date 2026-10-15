import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
http.createServer(async(req,res)=>{try{const p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/\/$/,'/index.html'));if(!p.startsWith(root+path.sep))throw Error();const b=await fs.readFile(p);res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json'})[path.extname(p)]??'application/octet-stream');res.setHeader('Cache-Control','no-cache');res.end(b);}catch{res.statusCode=404;res.end('not found')}}).listen(8765,'127.0.0.1',()=>console.log('http://127.0.0.1:8765'));
