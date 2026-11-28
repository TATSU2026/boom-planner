importScripts('engine.js?v=L5.5.2');
onmessage=e=>{
  try{postMessage({id:e.data.id,result:Planner.compute(e.data.input)});}
  catch(err){postMessage({id:e.data.id,error:String(err)});}
};
