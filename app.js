(()=> {
'use strict';
const leaders=[
 {name:'科菲',img:'kofi',role:'冻结联动',tip:'常带冰冻单位可考虑二命，雪崩命中后有 10 秒集火窗口。',skills:[
 ["主动 · 雪崩","队长移除附近一个冰冻目标身上的冰冻效果并对该目标造成额外伤害。该效果会扩散至附近其他冰冻目标。\n1级 · 能量消耗 7 (+5) · 雪崩伤害 300% +10%"],
 ["被动 · 寒流","为4.0格内的友方单位提供额外生命值。每过2秒，这些单位就会获得额外生命值，数值相当于队长最大生命值的5%。\n10级 · 额外生命值上限 65% +5%"],
 ["一命 · 寒意护体","通过寒流获得的生命值提升至7.5%。"],["二命 · 深度冻结","被雪崩命中的目标受到的伤害提升25%，持续10秒。"],["三命 · 额外训练","队长的主动和被动技能等级提升+2级。"],["四命 · 低温反馈","每有一个目标被雪崩命中，通过寒流获得的生命值就会提升0.2%，持续5秒。"],["五命 · 绝对零度","雪崩触发时，会在每个目标身上附加一枚炸药。当这些目标受到火焰伤害时，炸药会被引爆并造成伤害，数值相当于队长攻击伤害的1000%。"]]},
 {name:'安娜',img:'anna',role:'状态支援',tip:'二命给集火目标挂腐蚀。常用效果加时的玩家可再考虑三命。',skills:[
 ["主动 · 效果加时","发射一枚导弹，使范围内敌人的负面状态效果、友军的增益状态效果持续更长时间。\n10级 · 能量消耗 6 (+4) · 延长时间 7.5秒 +0.5秒"],["被动 · 能量转换","队长受到状态效果影响时会进行充能，每次充能可获得一枚集束弹药。充能有冷却时间。集束弹药会附加到她的攻击中。\n13级 · 充能冷却时间 4.5秒 · 充能攻击 集束弹药"],["一命 · 额外弹药","小分队队员获得状态效果时，队长可额外获得集束弹药。"],["二命 · 腐蚀弹","效果加时还可对目标区域内的敌方目标施加腐蚀效果，持续10秒。被腐蚀的目标会额外受到15%伤害。"],["三命 · 额外训练","队长的主动和被动技能等级提升+2级。"],["四命 · 原样奉还","队长身上的负面效果，也会反作用于效果的施加者。"],["五命 · 净化弹","效果加时还可清除友方目标身上的负面效果。"]]},
 {name:'林尼亚',img:'medic',role:'林尼亚 · 治疗支援',tip:'二命扩大减伤范围，四命为圈内部队增伤，五命解锁信标复活。',skills:[
 ["主动 · 治疗信标","治疗范围内的单位。当队长造成伤害时，下个治疗信标还会附加爆发治疗。爆发治疗总量相当于造成伤害的200%。爆发治疗的数值上限相当于队长最大生命值的300%。\n10级 · 能量消耗 6 (+6) · 持续时间 7.5秒 · 每秒治疗量 126 +7"],["被动 · 纳米机器集群","为队长附近4.0格内的部队提供减伤效果。\n13级 · 伤害减免 42%"],["一命 · 援助之手","治疗信标部署后，爆发治疗提供的治疗量中，超出单位最大生命值的部分将转化为护盾。护盾数值上限为单位最大生命值的30%。"],["二命 · 别怕，我来了！","纳米机器集群的效果范围提升至6.0格。"],["三命 · 额外训练","队长的主动和被动技能等级提升+2级。"],["四命 · 不要怕，动起来！","纳米机器集群还会额外为部队提供25%的伤害加成。"],["五命 · 绝不退场","治疗信标生效范围内的单位被消灭时，他们会被立刻复活！这一效果遵循常规复活的规则。"]]}
];
const $=id=>document.getElementById(id),val=id=>Number($(id).value);
const fullNames=['科菲·恩武努中尉','安娜·施林格尔中尉','林尼亚·弗里斯可达中尉'];
const nicknames=['冷酷法则！','战术戏法！','混乱也是治病良方！'];
const rank=(n,i)=>n<0?'未持有':n===0?'0命（本体）':n+'命（'+leaders[i].skills[n+1][0].split(' · ')[1]+'）';
const badge=n=>n>=0?'<img class="rank-badge" src="assets/rank'+n+'.webp" alt="'+n+'命星徽">':'';

$('cards').innerHTML=leaders.map((l,i)=>`<article><div class="portrait"><img src="assets/${l.img}.webp" alt="${l.name}"><div class="caption"><small>预计第${'一二三'[i]}期</small><b>${fullNames[i]}</b><span>${nicknames[i]}</span></div></div><button class="skill-toggle" type="button" aria-expanded="false" aria-controls="skills0 skills1 skills2">查看技能</button><div class="cardbody"><label>当前命座<select id="own${i}">${Array.from({length:7},(_,j)=>`<option value="${j-1}" >${rank(j-1,i)}</option>`).join('')}</select></label><label class="goal-picker">目标命座<select id="target${i}"><option value="auto">自动推荐</option><option value="-1">本期跳过</option>${Array.from({length:6},(_,n)=>`<option value="${n}">${rank(n,i)}</option>`).join('')}</select></label><div class="skills" id="skills${i}" hidden><dl>${l.skills.map(([k,v])=>`<div class="skill-row"><div class="skill-copy"><dt>${k}</dt><dd>${v}</dd></div></div>`).join('')}</dl></div></div></article>`).join('');
const skillLists=[...document.querySelectorAll('.skills dl')];
function alignSkills(){
 const columns=new Set(skillLists.map(list=>list.closest('article').offsetTop)).size===1;
 const tops=skillLists.map(list=>list.firstElementChild.getBoundingClientRect().top);
 for(const [i,list] of skillLists.entries()){
  const padding=parseFloat(list.style.paddingTop)||0;
  tops[i]-=padding;
 }
 for(const [i,list] of skillLists.entries())list.style.paddingTop=columns ? Math.max(0,Math.max(...tops)-tops[i])+'px' : '';
 for(let i=0; i<(skillLists[0]?.children.length || 0); i++){
  const rows=skillLists.map(list=>list.children[i]);
  const height=columns ? Math.max(...rows.map(row=>row.firstElementChild.getBoundingClientRect().height)) : 0;
  for(const row of rows)row.style.minHeight=height ? height+'px' : '';
 }
}
if(typeof ResizeObserver==='function'){
 const observer=new ResizeObserver(alignSkills);
 for(const list of skillLists)for(const copy of list.querySelectorAll('.skill-copy'))observer.observe(copy);
}
document.querySelectorAll('.skill-toggle').forEach(button=>button.onclick=()=>{
 const open=button.getAttribute('aria-expanded')==='false';
 document.querySelectorAll('.skill-toggle').forEach(b=>{b.setAttribute('aria-expanded',String(open));b.textContent=open?'收起技能':'查看技能';});
 document.querySelectorAll('.skills').forEach(el=>el.hidden=!open);
 alignSkills();
});
const form=$('planner'),inputs=[...form.querySelectorAll('input,select')];
const storageKey='elite-planner-v3';
const reasons=[
 ['先解锁科菲，获得冻结联动与寒流生命支援。','一命加强寒流提供的生命值。','二命解锁 25% 易伤，适合冰冻队集中输出。','三命提升主动和被动等级，关键机制到位后再补数值。','四命强化雪崩与寒流联动，收益依赖实际命中数量。','五命需要火焰伤害引爆，预算充裕时再投入。'],
 ['先解锁安娜，获得状态延长能力。','一命让队员受到状态效果时也能提供弹药。','二命解锁 15% 腐蚀易伤，适合用余券补强集火输出。','三命提升两项技能等级，进一步强化状态支援。','四命将负面状态反作用于施加者，依赖战场环境。','五命增加友军净化，适合经常受到负面状态的队伍。'],
 ['先解锁林尼亚，获得治疗与减伤。','一命将溢出爆发治疗转成护盾。','二命将减伤范围扩大到 6 格，是通用支援的重要档位。','三命提升治疗与减伤技能等级。','四命为范围内部队提供 25% 伤害加成。','五命解锁信标范围内复活，是优先争取的完整支援档位。']
];
const SAMPLE_COUNT=Planner.SAMPLE_COUNT;
let runId=0,seq=0,timer=0,worker=null;
const pending=new Map();
try{
 worker=new Worker('worker.js?v=L5.5.2');
 worker.onmessage=e=>{const p=pending.get(e.data.id);if(!p)return;pending.delete(e.data.id);e.data.error?p.fail():p.done(e.data.result);};
 worker.onerror=()=>{worker=null;for(const [id,p] of pending){pending.delete(id);p.fail();}};
}catch{worker=null;}
function compute(input){
 return new Promise(done=>{
  const local=()=>done(Planner.compute(input));
  if(!worker)return local();
  const id=++seq;pending.set(id,{done,fail:local});worker.postMessage({id,input});
 });
}
function schedule(){clearTimeout(timer);timer=setTimeout(calculate,200);}
const pct=x=>(x===1?'100':(100*x).toFixed(1))+'%';
function buildResult(r,owned,targets){
 const label=targets.every(t=>t===null)?'自动推荐':targets.every(t=>t!==null)?'自选目标':'自选目标与自动推荐';
 const detail=(mean,p90,avail,chance)=>'<dl><div><dt>平均需要多少抽</dt><dd>'+mean+'抽</dd></div><div><dt>多少抽有90%把握</dt><dd>'+p90+'抽</dd></div><div><dt>累计预算</dt><dd>'+avail+'抽</dd></div>'+(typeof chance==='number'?'<div><dt>该期达成率</dt><dd>'+pct(chance)+'</dd></div>':'')+'</dl>';
 const cards=leaders.map((l,i)=>'<article class="draw-card"><div class="draw-card-header"><img class="draw-avatar" src="assets/'+l.img+'.webp" loading="lazy" decoding="async" alt="'+l.name+'"><div><h4 class="draw-card-name">'+l.name+'</h4><div class="draw-card-goal">'+badge(r.goal[i])+'<span>目标'+(r.goal[i]<0?'本期跳过':r.goal[i]+'命')+'</span></div></div></div><dl><div><dt>当前命座</dt><dd>'+(owned[i]<0?'未持有':owned[i]+'命')+'</dd></div></dl>'+detail(r.estimates[i].mean,r.estimates[i].p90,r.budget[i],r.leaders[i].chance)+'</article>').join('')
  +'<article class="draw-card draw-total"><div class="draw-card-header"><h4 class="draw-card-name">三期合计</h4></div>'+detail(r.total.mean,r.total.p90,r.budget[2])+'</article>';
 const merged=leaders.map((l,i)=>'<b class="advice-name">'+l.name+'</b>'+'<p class="advice-reason">'+(r.goal[i]===owned[i]?'本期无需追加抽取。':reasons[i][r.goal[i]])+'</p>'+'<p class="advice-next">'+(r.leaders[i].next?'<span>再升一档：</span> <b>'+rank(r.leaders[i].next.rank,i)+'</b>　<span>全部目标达成率：</span> <b>'+pct(r.leaders[i].next.chance)+'</b>':'<span>已是最高档位</span>')+'</p>').join('');
 return '<small>'+label+'</small><div class="recommendations">'+r.goal.map((n,i)=>'<div class="recommendation">'+badge(n)+'<div><b>'+leaders[i].name+'</b><span>'+rank(n,i)+'</span></div></div>').join('')+'</div>'
  +(r.chance<.9?'<p class="note">当前预算下，按期达成全部目标的把握低于90%。可以降低自选目标，或增加每月可攒抽数。</p>':'')
  +'<div class="statrow"><div class="stat">每月能攒的抽数<b>'+r.monthly+' 抽</b></div><div class="stat">三期可用总抽数<b>'+r.budget[2]+' 抽</b></div><div class="stat">全部目标的模拟达成率<b>模拟达成率'+pct(r.chance)+'</b></div></div>'
  +'<h3 class="draw-title">达到目标需要多少抽</h3><div class="result-cards">'+cards+'</div>'
  +'<p class="note">累计预算包含此前各期。每位队长的抽数从上一目标完成后起算，跳过或已达标记为 0。按当前命座和保底状态估算，模拟达成率为估算结果，实际抽数会有波动。90%把握表示 10,000 次模拟中约有90%的情况能在这个抽数内达到目标。三期合计按整条招募过程统计。</p>'
  +'<h3 class="draw-title">推荐方案说明</h3><div class="advice advice-merged">'+merged+'</div><p class="note">模型假设：三期共用同一条中尉保底进度，期间不重置；按每期一个月累计收入；秘钥碎片每200个折算1抽；首次获得为0命，每次重复获得提升1命。</p>';
}
function calculate(){
 saveSettings();
 const mine=++runId;
 if(!form.checkValidity()){
   $('results').innerHTML='<p>请填写核心秘钥、秘钥碎片、距离保底次数和保底类型。每月抽数可留空，留空按 0 计算。</p>';
   $('state').textContent='填写完整后自动生成建议';
   return false;
 }
 const owned=[0,1,2].map(i=>val('own'+i));
 const targets=owned.map((n,i)=>$('target'+i).value==='auto'?null:Math.max(n,val('target'+i)));
 $('state').textContent='正在计算…';$('results').setAttribute('aria-busy','true');
 compute({owned,targets,monthly:monthlyIncome(),tickets:val('tickets'),pieces:val('pieces'),remaining:val('remaining'),guaranteed:val('up')===1,count:SAMPLE_COUNT}).then(r=>{
  if(mine!==runId)return;
  $('results').innerHTML=buildResult(r,owned,targets);
  $('results').removeAttribute('aria-busy');$('state').textContent='已自动生成建议';
 });
}
function saveSettings(){
 try{
   localStorage.setItem(storageKey,JSON.stringify(Object.fromEntries(inputs.map(el=>[el.id,el.type==='checkbox'?el.checked:el.value]))));
 }catch{}
}
function sourceTotal(){
 let sum=0;
 for(let i=0;i<8;i++)sum+=val('amount'+i);
 return sum;
}
function monthlyIncome(){return sourceTotal();}
function updateIncome(){
 $('incomeSum').textContent='合计每月 '+sourceTotal()+' 抽';
}
function fillIncome(values){
 values.forEach((value,i)=>{$('amount'+i).value=String(value);});
 updateIncome();
 calculate();
}
let pendingFill=null;
function askFill(values){
 // Only ask when something would actually be overwritten.
 if(sourceTotal()===0)return fillIncome(values);
 pendingFill=values;
 openDialog($('confirmFill'),document.activeElement);
}
$('confirmFillOk').onclick=()=>{$('confirmFill').close();if(pendingFill)fillIncome(pendingFill);pendingFill=null;};
$('fillFree').onclick=()=>askFill([15,10,5,5,0,16,8,10]);
$('fillPaid').onclick=()=>askFill([15,10,5,20,100,40,18,25]);
$('clearIncome').onclick=()=>fillIncome(Array(8).fill(''));
$('resetAll').onclick=()=>openDialog($('confirmReset'),$('resetAll'));
$('confirmResetOk').onclick=()=>{
 $('confirmReset').close();
 try{localStorage.removeItem(storageKey);}catch{}
 form.reset();
 updateIncome();
 calculate();
};
form.oninput=()=>{updateIncome();schedule();};
form.onsubmit=e=>{e.preventDefault();if(form.reportValidity())calculate();$('results').scrollIntoView({behavior:'smooth'});};
try{
 const saved=JSON.parse(localStorage.getItem(storageKey));
 if(saved)inputs.forEach(el=>{
   if(el.id in saved){
     if(el.type==='checkbox')el.checked=saved[el.id]===true;
     else el.value=saved[el.id];
   }
 });
}catch{}
updateIncome();
calculate();
})();

function openDialog(dialog,opener){
 dialog._opener=opener||document.activeElement;
 dialog.showModal();
}
document.querySelectorAll('dialog').forEach(dialog=>{
 // Close when the grey area outside the dialog is clicked.
 dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
 });
 dialog.addEventListener('close',()=>{const o=dialog._opener;dialog._opener=null;if(o&&o.isConnected)o.focus({preventScroll:true});});
});
document.querySelectorAll('[data-open-dialog]').forEach(button=>{
 button.onclick=()=>openDialog(document.getElementById(button.dataset.openDialog),button);
});
document.querySelectorAll('[data-close-dialog]').forEach(button=>{
 button.onclick=()=>button.closest('dialog').close();
});


// ---- L5.5.2 budget pickers (the hidden native selects keep the value, validation and saving)
(()=>{
 const rem=document.getElementById('remaining'),up=document.getElementById('up');
 const trig=document.getElementById('remainingBtn'),grid=document.getElementById('remainingGrid');
 const cells=[...grid.querySelectorAll('button')],seg=[...document.querySelectorAll('.bf-seg button')];
 function sync(){
  trig.querySelector('.bf-value').textContent=rem.value;
  for(const c of cells)c.setAttribute('aria-pressed',String(c.dataset.v===rem.value));
  for(const s of seg)s.setAttribute('aria-pressed',String(s.dataset.v===up.value));
 }
 function set(sel,v){sel.value=v;sel.dispatchEvent(new Event('input',{bubbles:true}));sel.dispatchEvent(new Event('change',{bubbles:true}));sync();}
 function open(){
  grid.hidden=false;trig.setAttribute('aria-expanded','true');
  (cells.find(c=>c.dataset.v===rem.value)||cells[0]).focus();
 }
 function close(focus){
  if(grid.hidden)return;
  grid.hidden=true;trig.setAttribute('aria-expanded','false');
  if(focus)trig.focus();
 }
 trig.addEventListener('click',e=>{e.preventDefault();grid.hidden?open():close(true);});
 grid.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.preventDefault();set(rem,b.dataset.v);close(true);});
 grid.addEventListener('keydown',e=>{
  const i=cells.indexOf(document.activeElement);if(i<0)return;
  const rtl=document.documentElement.dir==='rtl';
  const step={ArrowRight:rtl?-1:1,ArrowLeft:rtl?1:-1,ArrowDown:10,ArrowUp:-10}[e.key];
  if(step){e.preventDefault();cells[Math.min(cells.length-1,Math.max(0,i+step))].focus();}
  else if(e.key==='Escape'){e.preventDefault();close(true);}
  else if(e.key==='Tab')close(false);
 });
 document.addEventListener('click',e=>{if(!e.target.closest('.bf-picker'))close(false);});
 for(const s of seg)s.addEventListener('click',e=>{e.preventDefault();set(up,s.dataset.v);});
 const form=document.getElementById('planner');
// Only the boxes themselves respond: clicks on the label text or the empty part of a row do nothing
 // (otherwise the browser forwards them to the first control in the row, including the hidden native select).
 for(const row of document.querySelectorAll('#plan .budget-fields > .fields > label')){
  row.addEventListener('click',e=>{if(!e.target.closest('input,button,.bf-picker,.bf-seg'))e.preventDefault();});
 }
 form.addEventListener('input',sync);
 form.addEventListener('reset',()=>setTimeout(sync));
 sync();
})();
