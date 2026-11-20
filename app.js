(()=> {
'use strict';
const leaders=[
 {name:'科菲',img:'kofi',role:'冻结联动',tip:'常带冰冻单位可考虑二命，雪崩命中后有 10 秒集火窗口。',skills:[
 ['主动 · 雪崩','解除附近一个目标的冰冻并造成额外伤害，再向附近其他冰冻目标扩散。能量 7（+5）。'],
 ['被动 · 寒流','每 2 秒为 4 格内友军提供相当于队长最大生命值 5% 的额外生命。数值来自预览。'],
 ['一命 · 寒意护体','寒流每次提供的生命值提高到队长最大生命值的 7.5%。'],['二命 · 深度冻结','雪崩命中的目标受到的伤害提高 25%，持续 10 秒。'],['三命 · 额外训练','主动与被动各升 2 级。满级技能的具体增幅待核实。'],['四命 · 低温反馈','雪崩每命中一个目标，寒流提供的生命值提高 0.2%，持续 5 秒。'],['五命 · 绝对零度','雪崩在目标身上留下炸弹。火焰伤害可将其引爆，造成相当于队长攻击力 1000% 的伤害。']]},
 {name:'安娜',img:'anna',role:'状态支援',tip:'二命给集火目标挂腐蚀。常用效果加时的玩家可再考虑三命。',skills:[
 ['主动 · 效果加时','延长范围内敌方负面状态和友军增益状态。13 级延长 9 秒，能量 6（+4）。'],['被动 · 能量转换','安娜受到状态效果影响时充能，获得一枚集束弹药附加到攻击中。13 级充能冷却 4.5 秒。'],['一命 · 额外弹药','小分队队员获得状态效果时，安娜也可额外获得集束弹药。'],['二命 · 腐蚀弹','效果加时使区域内敌人受到腐蚀，持续 10 秒。被腐蚀的目标额外受到 15% 伤害。'],['三命 · 额外训练','主动与被动各升 2 级，当前 13 级可升到 15 级。'],['四命 · 原样奉还','安娜受到的负面效果同时作用于施加者。'],['五命 · 净化弹','效果加时还会清除友方目标身上的负面效果。']]},
 {name:'林尼亚',img:'medic',role:'林尼亚 · 治疗支援',tip:'二命扩大减伤范围，四命为圈内部队增伤，五命解锁信标复活。',skills:[
 ['主动 · 治疗信标','治疗范围内单位。队长造成的伤害为下个信标积累爆发治疗，治疗总量为所造成伤害的 200%，上限为队长最大生命值的 300%。13 级持续 7.5 秒，能量 6（+6）。'],['被动 · 纳米机器集群','为附近 4 格内的部队提供减伤。13 级面板减伤 42%。'],['一命 · 援助之手','信标的爆发治疗溢出时转为护盾，上限为受益单位最大生命值的 30%。'],['二命 · 别怕，我来了！','纳米机器集群的作用范围扩大到 6 格。'],['三命 · 额外训练','主动与被动各升 2 级。'],['四命 · 不要怕，动起来！','纳米机器集群额外为范围内部队提供 25% 伤害加成。'],['五命 · 绝不退场','单位在生效的治疗信标范围内被消灭时立即复活，遵循常规复活规则。']]}
];
const $=id=>document.getElementById(id),val=id=>Number($(id).value);
const fullNames=['科菲·恩武努中尉','安娜·施林格尔中尉','林尼亚·弗里斯可达中尉'];
const nicknames=['冰牢大、科比','核弹鸭、鸭精','金医、医精'];
const rank=(n,i)=>n<0?'未持有':n===0?'0命（本体）':n+'命（'+leaders[i].skills[n+1][0].split(' · ')[1]+'）';
const badge=n=>n>=0?'<img class="rank-badge" src="assets/rank'+n+'.png" alt="'+n+'命星徽">':'';

$('cards').innerHTML=leaders.map((l,i)=>`<article><div class="portrait"><img src="assets/${l.img}.jpg" alt="${l.name}"><div class="caption"><small>预计第${'一二三'[i]}期</small><b>${fullNames[i]}</b><span>${nicknames[i]}</span></div></div><button class="skill-toggle" type="button" aria-expanded="false">查看技能</button><div class="cardbody"><label>当前命座<select id="own${i}">${Array.from({length:7},(_,j)=>`<option value="${j-1}" >${rank(j-1,i)}</option>`).join('')}</select></label><label class="goal-picker">目标命座<select id="target${i}"><option value="auto">自动推荐</option><option value="-1">本期跳过</option>${Array.from({length:6},(_,n)=>`<option value="${n}">${rank(n,i)}</option>`).join('')}</select></label><div class="skills" hidden><dl>${l.skills.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div></div></article>`).join('');
document.querySelectorAll('.skill-toggle').forEach(button=>button.onclick=()=>{
 const open=button.getAttribute('aria-expanded')==='false';
 document.querySelectorAll('.skill-toggle').forEach(b=>{b.setAttribute('aria-expanded',String(open));b.textContent=open?'收起技能':'查看技能';});
 document.querySelectorAll('.skills').forEach(el=>el.hidden=!open);
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
 const formatChance=x=>x===1?'全部样本达成':x===0?'样本中未达成':(100*x).toFixed(1)+'%';
 const estimates=rec.copies.map((end,i)=>Planner.drawStats(paths,i?rec.copies[i-1]:0,end));
 const total=Planner.drawStats(paths,0,rec.copies[2]);
 const rows=leaders.map((l,i)=>'<tr><th>'+l.name+'</th><td>'+estimates[i].mean+'</td><td>'+estimates[i].p90+'</td><td>'+budget[i]+'</td></tr>').join('');
 $('results').innerHTML='<small>'+label+'</small><div class="recommendations">'+rec.goal.map((n,i)=>'<div class="recommendation">'+badge(n)+'<div><b>'+leaders[i].name+'</b><span>'+rank(n,i)+'</span></div></div>').join('')+'</div>'+(rec.chance<.9?'<p class="note">当前预算下，按期达成全部目标的把握低于90%。可以降低自选目标，或增加每月可攒抽数。</p>':'')+'<div class="statrow"><div class="stat">每月新增<b>'+monthly+' 抽</b></div><div class="stat">三期总预算<b>'+budget[2]+' 抽</b></div><div class="stat">按期达成全部目标<b>'+formatChance(rec.chance)+'</b></div></div><h3 class="draw-title">达到目标需要多少抽</h3><table><thead><tr><th>队长</th><th>平均需要多少抽</th><th>多少抽有90%把握</th><th>累计预算</th></tr></thead><tbody>'+rows+'<tr><th>三期合计</th><td>'+total.mean+'</td><td>'+total.p90+'</td><td>'+budget[2]+'</td></tr></tbody></table><p class="note">累计预算包含此前各期。每位队长的抽数从上一目标完成后起算，跳过或已达标记为 0。按当前命座和保底状态估算，实际抽数会有波动。90%把握表示 5,000 次模拟中约有90%的情况能在这个抽数内达到目标。三期合计按整条招募过程统计。</p><div class="advice">'+leaders.map((l,i)=>'<p><b>'+l.name+'</b>　'+(rec.goal[i]===owned[i]?'本期无需追加抽取。':reasons[i][rec.goal[i]])+'</p>').join('')+'</div>';

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
$('fillPaid').onclick=()=>fillIncome([15,10,5,20,100,40,18,20]);
const pieces = $('pieces');
function adjustPieces(delta){
 const next = Math.min(Number(pieces.max), Math.max(0, (Number(pieces.value) || 0) + delta));
 pieces.value = String(next);
 calculate();
}
document.querySelectorAll('[data-change]').forEach(button => {
 button.onclick = () => adjustPieces(Number(button.dataset.change));
});
pieces.onkeydown = event => {
 if (event.key === 'ArrowUp' || event.key === 'ArrowDown'){
   event.preventDefault();
   adjustPieces(event.key === 'ArrowUp' ? 100 : -100);
 }
};
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
