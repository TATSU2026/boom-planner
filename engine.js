'use strict';
const Planner = (() => {
  // Rates by attempt since the previous drop in that category, in percent.
  const expand = rows => rows.flatMap(([count, rate]) => Array(count).fill(rate));
  const lieutenant = expand([[1,1],[4,.2],[4,.25],[5,.3],[5,.35],[5,.4],[5,.45],[5,.5],[5,.55],[5,.6],[5,.65],[5,.7],[4,.75],[1,2.7],[1,4.1],[1,2.5],[1,3],[1,4],[1,5],[1,7],[1,9],[1,11],[1,13],[1,15],[1,17],[1,19],[1,21],[1,23],[1,25],[1,27],[2,30],[3,100]]);
  const sergeant = expand([[1,2.4],[3,.6],[2,.7],[5,.8],[4,.9],[6,1],[1,1.3],[1,1.5],[1,1.7],[1,1.9],[1,2.1],[1,2.3],[1,2.5],[1,4],[2,6],[1,8],[1,9],[1,10],[1,15],[1,20],[2,25],[2,100]]);
  const gadget = [.5,6,8,10,12,14,20,20,20,100];
  const SAMPLE_COUNT=10000, MAX_COPIES=18, PACK_SIZE=40, FRAGMENTS_PER_PULL=200; // 3 leaders x 6 copies (rank 0..5) at most
  let cacheKey='', cached;
  function samples(pity, guaranteed, gear, soldier, count=SAMPLE_COUNT) {
    const key=[pity,guaranteed,gear,soldier,count].join(',');
    if (key===cacheKey) return cached;
    let seed=1;
    const roll=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
    const paths=[];
    for(let trial=0;trial<count;trial++){
      seed=(Math.imul(trial+1,0x9E3779B1)^731931)>>>0||1; roll();roll();roll(); // every trial has its own seed
      let l=pity,g=gear,s=soldier,up=guaranteed,pulls=0;
      const costs=[0];
      while(costs.length<=MAX_COPIES){
        pulls++;
        const a=gadget[Math.min(g++,9)], b=sergeant[Math.min(s++,39)], c=lieutenant[Math.min(l++,79)];
        const r=roll()*100;
        if(a===100 || (b<100 && c<100 && r<a)){g=0;continue;}
        if(b===100 || (c<100 && r<a+b)){s=0;continue;}
        if(c===100 || r<a+b+c){
          l=0;
          if(up || roll()<.5){costs.push(pulls);up=false;}else up=true;
        }
      }
      paths.push(costs);
    }
    cacheKey=key;cached=paths;return paths;
  }
  function limits(stock,fragments,months){
    let tickets=stock, pieces=fragments;
    return months.map(m=>{tickets+=m.tickets;pieces+=m.fragments;return tickets+Math.floor(pieces/FRAGMENTS_PER_PULL);});
  }
  function assess(owned,goal,budget,paths){
    let total=0;
    const copies=goal.map((v,i)=>total+=Math.max(0,v-owned[i]));
    let wins=0,missing=0;
    for(const path of paths){
      const deficit=Math.max(0,...copies.map((n,i)=>(path[n]??Infinity)-budget[i]));
      if(deficit===0)wins++;
      missing+=Math.ceil(deficit/PACK_SIZE);
    }
    return {chance:wins/paths.length,packs:missing/paths.length,copies};
  }
  function recommend(owned,budget,paths){
    // Compare every attainable rank combination against the same banner deadlines.
    const milestones = [[2,0],[1,0],[0,0],[2,1],[1,1],[2,2],[2,5],[2,4],
                        [1,2],[0,2],[0,3],[1,3]];
    let goal = owned.slice();
    goal[2] = Math.max(0, goal[2]);
    let bestScore = -1;
    // Omitted tiers remain valid starting ranks. Otherwise save for a useful upgrade.
    const stops = (current, ranks) => [current, ...ranks.filter(rank => rank > current)];
    for (const k of stops(owned[0], [0,2,3])) {
      for (const a of stops(owned[1], [0,1,2,3])) {
        for (const l of stops(Math.max(0,owned[2]), [1,2,4,5])) {
          // Save spare pulls for Linnea before buying optional early-banner ranks.
          if (l < 5 && (k > Math.max(owned[0],0) || a > Math.max(owned[1],1))) continue;
          if (a > Math.max(owned[1],2) && k < 2) continue;
          const candidate = [k,a,l];
          const score = milestones.reduce((v,[i,n]) => 2*v + Number(candidate[i]>=n), 0);
          if (score <= bestScore) continue;
          const first = k-owned[0], second = first+a-owned[1], third = second+l-owned[2];
          let wins = 0;
          for (const path of paths) {
            if (path[first]<=budget[0] && path[second]<=budget[1] && path[third]<=budget[2]) wins++;
          }
          if (wins >= .9*paths.length) {
            goal = candidate;
            bestScore = score;
          }
        }
      }
    }
    return {goal,...assess(owned,goal,budget,paths)};
  }
  function planTargets(owned, targets, budget, paths) {
    if (targets.every(target => target === null)) return recommend(owned,budget,paths);
    const fixed = targets.map((target,i) => target === null ? owned[i] : Math.max(owned[i],target));
    const stops = [[0,2,3],[0,1,2,3],[0,1,2,4,5]];
    const choices = targets.map((target,i) => target === null
      ? [owned[i], ...stops[i].filter(rank => rank > owned[i])]
      : [fixed[i]]);
    const milestones = [[2,0],[1,0],[0,0],[2,1],[1,1],[2,2],[2,5],[2,4],[1,2],[0,2],[0,3],[1,3]];
    let goal = fixed.slice(), bestScore = -1;
    for (const k of choices[0]) {
      for (const a of choices[1]) {
        for (const l of choices[2]) {
          const candidate = [k,a,l];
          const score = milestones.reduce((total,[i,rank]) => 2*total + Number(candidate[i]>=rank),0);
          if (score <= bestScore) continue;
          const result = assess(owned,candidate,budget,paths);
          if (result.chance >= .9) {
            goal = candidate;
            bestScore = score;
          }
        }
      }
    }
    return {goal,...assess(owned,goal,budget,paths)};
  }
  function drawStats(paths, start, end) {
    const draws = paths.map(path => path[end] - path[start]).sort((a,b) => a-b);
    const sum = draws.reduce((total,n) => total+n, 0);
    return {mean: Math.round(sum/draws.length), p90: draws[Math.ceil(.9*draws.length)-1]};
  }
  // One call for the whole page: plain data in, plain data out (also used inside the Web Worker).
  function compute({owned,targets,monthly,tickets,pieces,remaining,guaranteed,count=SAMPLE_COUNT}) {
    const budget=limits(tickets,pieces,Array(3).fill({tickets:monthly,fragments:0}));
    const paths=samples(80-remaining,guaranteed,0,0,count);
    const rec=planTargets(owned,targets,budget,paths);
    const estimates=rec.copies.map((end,i)=>drawStats(paths,i?rec.copies[i-1]:0,end));
    const total=drawStats(paths,0,rec.copies[2]);
    const leaders=rec.goal.map((g,i)=>{
      const end=rec.copies[i], needs=end>(i?rec.copies[i-1]:0);
      const own=needs?paths.filter(p=>p[end]<=budget[i]).length/paths.length:null;
      const next=g<5?{rank:g+1,chance:assess(owned,rec.goal.map((v,j)=>j===i?g+1:v),budget,paths).chance}:null;
      return {chance:own,next};
    });
    return {goal:rec.goal,chance:rec.chance,copies:rec.copies,budget,estimates,total,leaders,monthly,count:paths.length};
  }
  return {samples,limits,assess,recommend,planTargets,drawStats,compute,SAMPLE_COUNT};
})();
if(typeof module!=='undefined')module.exports=Planner;

