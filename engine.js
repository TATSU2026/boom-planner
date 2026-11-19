'use strict';
const Planner = (() => {
  // Rates by attempt since the previous drop in that category, in percent.
  const expand = rows => rows.flatMap(([count, rate]) => Array(count).fill(rate));
  const lieutenant = expand([[1,1],[4,.2],[4,.25],[5,.3],[5,.35],[5,.4],[5,.45],[5,.5],[5,.55],[5,.6],[5,.65],[5,.7],[4,.75],[1,2.7],[1,4.1],[1,2.5],[1,3],[1,4],[1,5],[1,7],[1,9],[1,11],[1,13],[1,15],[1,17],[1,19],[1,21],[1,23],[1,25],[1,27],[2,30],[3,100]]);
  const sergeant = expand([[1,2.4],[3,.6],[2,.7],[5,.8],[4,.9],[6,1],[1,1.3],[1,1.5],[1,1.7],[1,1.9],[1,2.1],[1,2.3],[1,2.5],[1,4],[2,6],[1,8],[1,9],[1,10],[1,15],[1,20],[2,25],[2,100]]);
  const gadget = [.5,6,8,10,12,14,20,20,20,100];
  let cacheKey='', cached;
  function samples(pity, guaranteed, gear, soldier) {
    const key = [pity,guaranteed,gear,soldier].join(',');
    if (key === cacheKey) return cached;
    let seed=731931;
    function roll(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;}
    const paths=[];
    for(let trial=0;trial<5000;trial++){
      let l=pity,g=gear,s=soldier,up=guaranteed,pulls=0;
      const costs=[0];
      while(costs.length<=18){
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
    return months.map(m=>{tickets+=m.tickets;pieces+=m.fragments;return tickets+Math.floor(pieces/200);});
  }
  function assess(owned,goal,budget,paths){
    let total=0;
    const copies=goal.map((v,i)=>total+=v-owned[i]);
    let wins=0,missing=0;
    for(const path of paths){
      const deficit=Math.max(0,...copies.map((n,i)=>path[n]-budget[i]));
      if(deficit===0)wins++;
      missing+=Math.ceil(deficit/40);
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
  return {samples,limits,assess,recommend};
})();
if(typeof module!=='undefined')module.exports=Planner;

