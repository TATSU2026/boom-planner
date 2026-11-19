import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT || 8788);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg'};
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/api/advice'){
      if(req.method!=='POST'||req.headers.origin!=='http://127.0.0.1:'+port || req.headers.host!=='127.0.0.1:'+port)return json(res,403,{error:'请从本机服务首页打开。'});
      if(!process.env.OPENAI_API_KEY)return json(res,503,{error:'AI 解读尚未配置。请在启动服务前设置 OPENAI_API_KEY。'});
      let body='';
      for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>20000)return json(res,413,{error:'方案内容过长。'});}
      let plan;try{plan=JSON.parse(body);}catch{return json(res,400,{error:'方案格式有误。'});}
      const answer=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},signal:AbortSignal.timeout(40000),body:JSON.stringify({model:process.env.OPENAI_MODEL || 'gpt-4.1-mini',store:false,max_output_tokens:650,instructions:'你是海岛奇兵队长规划助手。仅依据传入的预算、技能描述和概率，对玩家给出简洁中文逐期收手建议和理由。保留计算结果，不编造概率、抽数或技能数据。注明抽样概率与硬保底的区别。',input:JSON.stringify(plan)})});
      if(!answer.ok)return json(res,502,{error:'AI 服务未返回结果，请检查 API 密钥、模型权限和余额。'});
      const data=await answer.json();
      const text=data.output?.flatMap(item=>item.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n');
      return json(res,text?200:502,text?{text}:{error:'模型返回空内容，请重试。'});
    }
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
    const filename=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
    if(!/^\/(?:index\.html|app\.js|engine\.js|style\.css|settings\.js|community\.(?:js|css)|(?:contact|guestbook)\.html|assets\/(?:anna|medic|kofi)\.jpg)$/.test(filename)){res.writeHead(404);return res.end();}
    const file=await readFile(path.join(root,filename));
    res.writeHead(200,{'Content-Type':types[path.extname(filename)]});
    res.end(req.method==='HEAD'?undefined:file);
  }catch{return json(res,502,{error:'服务请求失败，请稍后重试。'});}
});
server.listen(port,'127.0.0.1',()=>console.log('http://127.0.0.1:'+port));
