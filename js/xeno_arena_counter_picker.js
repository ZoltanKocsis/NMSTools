const data = [
  {a:"Fire",        as:"Frost",       aw:"Desert",     ds:"Anomalous",  dw:"Radioactive"},
  {a:"Frost",       as:"Mechanical",  aw:"Radioactive",ds:"Toxic",      dw:"Fire"},
  {a:"Radioactive", as:"Fire",        aw:"Toxic",      ds:"Frost",      dw:"Anomalous"},
  {a:"Toxic",       as:"Tropical",    aw:"Frost",      ds:"Radioactive",dw:"Desert"},
  {a:"Mechanical",  as:"Desert",      aw:"Anomalous",  ds:"Tropical",   dw:"Frost"},
  {a:"Anomalous",   as:"Radioactive", aw:"Fire",       ds:"Mechanical", dw:"Tropical"},
  {a:"Desert",      as:"Toxic",       aw:"Tropical",   ds:"Fire",       dw:"Mechanical"},
  {a:"Tropical",    as:"Anomalous",   aw:"Mechanical", ds:"Desert",         dw:"Toxic"}
];
const affinities = data.map(d=>d.a);
const byName = Object.fromEntries(data.map(d=>[d.a,d]));

// Build reference table
const refBody = document.getElementById('refTable');
data.forEach(d=>{
  const tr = document.createElement('tr');
  const ds = d.ds ? d.ds : '<span style="color:var(--muted)">— unknown —</span>';
  const dw = d.dw ? d.dw : '<span style="color:var(--muted)">— unknown —</span>';
  tr.innerHTML = `<td>${d.a}</td><td>${d.as}</td><td>${d.aw}</td><td>${ds}</td><td>${dw}</td>`;
  refBody.appendChild(tr);
});

// Build 3 dropdown inputs
const inputsDiv = document.getElementById('inputs');
for(let i=1;i<=3;i++){
  const f = document.createElement('div');
  f.className='field';
  f.innerHTML = `<label>Opponent Pet ${i}</label>
    <select id="opp${i}">${affinities.map(a=>`<option value="${a}">${a}</option>`).join('')}</select>`;
  inputsDiv.appendChild(f);
}

// matchScore: how good is `candidate` when facing `opponent`
// +1 if candidate attacks opponent effectively, -1 if poorly
// +1 if candidate defends against opponent effectively, -1 if poorly
function matchScore(candidate, opponent){
  const c = byName[candidate];
  let score = 0;
  if(c.as === opponent) score += 1;
  if(c.aw === opponent) score -= 1;
  if(c.ds === opponent) score += 1;
  if(c.dw === opponent) score -= 1;
  return score;
}

function tagFor(score){
  if(score >= 2) return '<span class="tag good">clean counter +2 (atk+def)</span>';
  if(score === 1) return '<span class="tag ok">solid counter +1 </span>';
  if(score === 0) return '<span class="tag warn">neutral matchup 0 </span>';
  return '<span class="tag bad">risky pick -1,2</span>';
}

// Generates all ways to assign 3 DISTINCT affinities (no repeats) to the 3 opponent slots in order.
function allDistinctAssignments(){
  const perms = [];
  for(let i=0;i<affinities.length;i++){
    for(let j=0;j<affinities.length;j++){
      if(j===i) continue;
      for(let k=0;k<affinities.length;k++){
        if(k===i||k===j) continue;
        perms.push([affinities[i], affinities[j], affinities[k]]);
      }
    }
  }
  return perms; // 8*7*6 = 336 combos
}

// Finds the best-scoring distinct-affinity assignment against the given opponents.
function bestAssignment(opps){
  let best = null, bestScore = -Infinity;
  allDistinctAssignments().forEach(p=>{
    let score = 0;
    opps.forEach((o,idx)=> score += matchScore(p[idx], o));
    if(score > bestScore){ bestScore = score; best = p; }
  });
  return { assignment: best, score: bestScore };
}

function renderTeam(containerId, assignment, opps){
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  assignment.forEach((c,idx)=>{
    const o = opps[idx];
    const raw = matchScore(c,o);
    const div = document.createElement('div');
    div.className='pet-slot';
    const unknownNote = (byName[c].ds===null || byName[c].dw===null) ? '<span class="tag warn">partial defense data</span>' : '';
    div.innerHTML = `<div class="left"><b>${c}</b> — vs opponent's <b>${o}</b></div>${tagFor(raw)}${unknownNote}`;
    container.appendChild(div);
  });
}

// Ranks every affinity by its SUMMED score if it had to fight all 3 opponents
// one-on-one in sequence (no "one pet per affinity" constraint - this is about
// each individual pet's flexibility, not a 3-pet team assignment).
function rankIndividualPets(opps){
  const ranked = affinities.map(a=>{
    const scores = opps.map(o=>matchScore(a,o));
    const total = scores.reduce((s,v)=>s+v,0);
    return {affinity:a, scores, total};
  });
  ranked.sort((x,y)=> y.total - x.total);
  return ranked;
}

function renderRankingTable(opps){
  const headerRow = document.getElementById('rankHeaderRow');
  headerRow.innerHTML = `<th>Rank</th><th>Affinity</th><th>vs ${opps[0]}</th><th>vs ${opps[1]}</th><th>vs ${opps[2]}</th><th>Total</th>`;

  const ranked = rankIndividualPets(opps).slice(0,5);
  const body = document.getElementById('rankTableBody');
  body.innerHTML = '';
  ranked.forEach((r,idx)=>{
    const tr = document.createElement('tr');
    const scoreCells = r.scores.map(s=>`<td>${s>=0?'+'+s:s}</td>`).join('');
    tr.innerHTML = `<td>#${idx+1}</td><td><b>${r.affinity}</b></td>${scoreCells}<td>${tagFor(r.total)} (${r.total>=0?'+'+r.total:r.total})</td>`;
    body.appendChild(tr);
  });
  return ranked;
}

function calculate(){
  const opps = [1,2,3].map(i=>document.getElementById('opp'+i).value);

  // --- Table A: Best Team (one pet per affinity, assigned to one opponent each) ---
  document.getElementById('summaryA').textContent =
    `Scored by searching every possible trio of 3 distinct affinities (336 combinations) and picking the ` +
    `assignment with the highest combined Attack+Defense score (+1/-1 each) against your 3 chosen opponents. ` +
    `Assumes you field exactly one pet per affinity, each matched to one specific opponent.`;

  const primary = bestAssignment(opps);
  renderTeam('resultsA', primary.assignment, opps);
  document.getElementById('extraNoteA').textContent =
    `Total type-matchup score: ${primary.score >= 0 ? '+' + primary.score : primary.score}. ` +
    `This is the highest-scoring team possible using 3 different affinities, one pet per type.`;

  // --- Table B: Top 5 individual pets, each fighting all 3 opponents alone ---
  document.getElementById('summaryB').textContent =
    `Ignores the "one pet per affinity" team constraint. Each of the 8 affinities is scored against each ` +
    `opponent individually (+1/-1 per matchup) and the 3 results are summed. The top 5 by total score are ` +
    `shown, so you can see which single pets are the most flexible/reliable picks overall.`;

  renderRankingTable(opps);
  document.getElementById('extraNoteB').textContent =
    `This ranks pets by raw type-matchup flexibility across all 3 opponents at once - useful when building ` +
    `a broader roster, since real combat outcomes also depend on stats and abilities the type chart doesn't capture.`;

  document.getElementById('resultCard').style.display='block';

  const gaps = data.filter(d=>d.ds===null || d.dw===null).map(d=>d.a);
  document.getElementById('gapNote').textContent = gaps.length
    ? `Note: ${gaps.join(', ')} has no recorded Defense Strong/Weak value in your source table — scored on attack data only where marked "partial defense data". Also remember: this tool is a pre-fight filter based on type matchups only - it doesn't know your pets' actual Combat Effectiveness/Agility/Health, ability cooldowns, or personality-trait triggers. Use it to shortlist, then finalize with real in-game stats.`
    : `This tool is a pre-fight filter based on type matchups only - it doesn't know your pets' actual Combat Effectiveness/Agility/Health, ability cooldowns, or personality-trait triggers. Use it to shortlist, then finalize with real in-game stats.`;
  document.getElementById('feedbackCard').style.display='block';
}
