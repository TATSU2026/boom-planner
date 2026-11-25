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
const badge=n=>n>=0?'<img class="rank-badge" src="assets/rank'+n+'.png" alt="'+n+'命星徽">':'';

$('cards').innerHTML=leaders.map((l,i)=>`<article><div class="portrait"><img src="assets/${l.img}.jpg" alt="${l.name}"><div class="caption"><small>预计第${'一二三'[i]}期</small><b>${fullNames[i]}</b><span>${nicknames[i]}</span></div></div><button class="skill-toggle" type="button" aria-expanded="false">查看技能</button><div class="cardbody"><label>当前命座<select id="own${i}">${Array.from({length:7},(_,j)=>`<option value="${j-1}" >${rank(j-1,i)}</option>`).join('')}</select></label><label class="goal-picker">目标命座<select id="target${i}"><option value="auto">自动推荐</option><option value="-1">本期跳过</option>${Array.from({length:6},(_,n)=>`<option value="${n}">${rank(n,i)}</option>`).join('')}</select></label><div class="skills" hidden><dl>${l.skills.map(([k,v])=>`<div class="skill-row"><div class="skill-copy"><dt>${k}</dt><dd>${v}</dd></div></div>`).join('')}</dl></div></div></article>`).join('');
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
function calculate(){
 saveSettings();
 if(!form.checkValidity()){
   $('results').innerHTML='<p>请填写核心秘钥、秘钥碎片、距离保底次数和保底类型。每月抽数可留空，留空按 0 计算。</p>';
   $('state').textContent='填写完整后自动生成建议';
   return false;
 }
 const owned=[0,1,2].map(i=>val('own'+i)),monthly=monthlyIncome();
 const budget=Planner.limits(val('tickets'),val('pieces'),Array(3).fill({tickets:monthly,fragments:0}));
 const pity=80-val('remaining'),guaranteed=val('up')===1;
 const paths=Planner.samples(pity,guaranteed,0,0);
 const targets=owned.map((n,i)=>$('target'+i).value==='auto'?null:Math.max(n,val('target'+i)));
 const label=targets.every(target=>target===null)?'自动推荐':targets.every(target=>target!==null)?'自选目标':'自选目标与自动推荐';
 const rec=Planner.planTargets(owned,targets,budget,paths);
 const formatChance=x=>'模拟达成率'+(x===1?'100':(100*x).toFixed(1))+'%';
 const estimates=rec.copies.map((end,i)=>Planner.drawStats(paths,i?rec.copies[i-1]:0,end));
 const total=Planner.drawStats(paths,0,rec.copies[2]);
 const rows=leaders.map((l,i)=>'<tr><th>'+l.name+'</th><td>'+estimates[i].mean+'</td><td>'+estimates[i].p90+'</td><td>'+budget[i]+'</td></tr>').join('');
 const drawDetails=(mean,p90,available)=>'<dl><div><dt>平均需要多少抽</dt><dd>'+mean+'抽</dd></div><div><dt>多少抽有90%把握</dt><dd>'+p90+'抽</dd></div><div><dt>累计预算</dt><dd>'+available+'抽</dd></div></dl>';
 const mobileCards='<div class="result-cards">'+leaders.map((leader,i)=>
   '<article class="draw-card"><div class="draw-card-header"><img class="draw-avatar" src="assets/'+leader.img+'.jpg" alt="'+leader.name+'"><div><h4 class="draw-card-name">'+leader.name+'</h4><div class="draw-card-goal">'+badge(rec.goal[i])+'<span>目标'+(rec.goal[i]<0?'本期跳过':rec.goal[i]+'命')+'</span></div></div></div><dl><div><dt>当前命座</dt><dd>'+ (owned[i]<0?'未持有':owned[i]+'命')+'</dd></div></dl>'+drawDetails(estimates[i].mean,estimates[i].p90,budget[i])+'</article>'
 ).join('')+'<article class="draw-card draw-total"><div class="draw-card-header"><h4 class="draw-card-name">三期合计</h4></div>'+drawDetails(total.mean,total.p90,budget[2])+'</article></div>';
 $('results').innerHTML='<small>'+label+'</small><div class="recommendations">'+rec.goal.map((n,i)=>'<div class="recommendation">'+badge(n)+'<div><b>'+leaders[i].name+'</b><span>'+rank(n,i)+'</span></div></div>').join('')+'</div>'+(rec.chance<.9?'<p class="note">按当前预算，在各期结束前达成全部目标的概率低于 90%。可以降低自选目标，或增加每月可攒抽数。</p>':'')+'<div class="statrow"><div class="stat">每月能攒的抽数<b>'+monthly+' 抽</b></div><div class="stat">三期可用总抽数<b>'+budget[2]+' 抽</b></div><div class="stat">全部目标的模拟达成率<b>'+formatChance(rec.chance)+'</b></div></div><h3 class="draw-title">达到目标需要多少抽</h3><table class="draw-table"><thead><tr><th>队长</th><th>平均需要多少抽</th><th>多少抽有90%把握</th><th>累计预算</th></tr></thead><tbody>'+rows+'<tr><th>三期合计</th><td>'+total.mean+'</td><td>'+total.p90+'</td><td>'+budget[2]+'</td></tr></tbody></table>'+mobileCards+'<p class="note">累计预算包含此前各期。每位队长的抽数从上一目标完成后起算，跳过或已达标记为 0。按当前命座和保底状态估算，模拟达成率为估算结果，实际抽数会有波动。90%把握表示 5,000 次模拟中约有90%的情况能在这个抽数内达到目标。三期合计按整条招募过程统计。</p><div class="advice">'+leaders.map((l,i)=>'<p><b>'+l.name+'</b>　'+(rec.goal[i]===owned[i]?'本期无需追加抽取。':reasons[i][rec.goal[i]])+'</p>').join('')+'</div>';

 $('state').textContent='已自动生成建议';
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
$('fillFree').onclick=()=>fillIncome([15,10,5,5,0,16,8,10]);
$('clearIncome').onclick=()=>fillIncome(Array(8).fill(''));
$('fillPaid').onclick=()=>fillIncome([15,10,5,20,100,40,18,25]);
document.querySelectorAll('.income-reference > summary').forEach(summary => {
 summary.addEventListener('click', event => {
  if (event.detail !== 0 && !event.target.closest('.shine-text')) event.preventDefault();
 });
});
document.querySelectorAll('.income-reference-end').forEach(button => {
 button.onclick = () => {
  const reference = button.closest('details');
  const summary = reference.querySelector('summary');
  reference.open = false;
  summary.focus({preventScroll:true});
  summary.scrollIntoView({block:'nearest'});
 };
});
form.oninput=event=>{
 updateIncome();calculate();
};
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

document.querySelectorAll('[data-open-dialog]').forEach(button=>{
 button.onclick=()=>document.getElementById(button.dataset.openDialog).showModal();
});
document.querySelectorAll('[data-close-dialog]').forEach(button=>{
 button.onclick=()=>button.closest('dialog').close();
});
