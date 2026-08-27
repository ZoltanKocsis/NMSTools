var AFF = {
  Fire:{color:"var(--fire)", strong:"Frost", weak:"Radioactive"},
  Frost:{color:"var(--frost)", strong:"Desert", weak:"Fire"},
  Desert:{color:"var(--desert)", strong:"Radioactive", weak:"Frost"},
  Radioactive:{color:"var(--radioactive)", strong:"Fire", weak:"Toxic"},
  Toxic:{color:"var(--toxic)", strong:"Tropical", weak:"Mechanical"},
  Tropical:{color:"var(--tropical)", strong:"Anomalous", weak:"Toxic"},
  Anomalous:{color:"var(--anomalous)", strong:"Mechanical", weak:"Desert"},
  Mechanical:{color:"var(--mechanical)", strong:"Toxic", weak:"Anomalous"}
};
var ORDER = ["Fire","Frost","Desert","Radioactive","Toxic","Tropical","Anomalous","Mechanical"];

var FAMILIES = [
{name:"Serrated Claws", cat:"Attack", target:"Enemy", cd:"1-2", effect:"Damage + damage-over-time in one hit", dmg:4, util:3, cdEff:5, score:3.85, v:{Tropical:"Barbed Lash",Fire:"Immolate",Frost:"Snowfall",Toxic:"Toxic Spit",Desert:"Rockfall",Mechanical:"Biological Suppression"}},
{name:"Multi", cat:"Attack", target:"Enemy", cd:"0-1 / 3-5", effect:"Damage that scales the more you use it", dmg:5, util:2, cdEff:4, score:3.55, v:{Tropical:"Rampage",Fire:"Pillar of Flame",Frost:"Howling Wind",Toxic:"Envenom",Desert:"Relentless",Mechanical:"Electron-Storm"}},
{name:"Reset Cd", cat:"Cooldown", target:"Self", cd:"2", effect:"Resets all own move cooldowns", dmg:1, util:5, cdEff:4, score:3.35, v:{Tropical:"Recharge",Fire:"Phoenix Feather",Frost:"Refresh",Toxic:"Self-Consumption",Desert:"Shed Skin",Mechanical:"Protocol Override"}},
{name:"Dotbomb", cat:"Attack", target:"Enemy", cd:"3-4", effect:"DoT that detonates later", dmg:4, util:3, cdEff:3, score:3.35, v:{Tropical:"Solar Ray",Fire:"White Hot",Frost:"Deep Freeze",Toxic:"Fester",Desert:"Cactus Flesh",Mechanical:"Neutron Bomb"}},
{name:"Dispel", cat:"Heal", target:"Self", cd:"1-2", effect:"Removes debuffs from self", dmg:1, util:4, cdEff:5, score:3.2, v:{Tropical:"Purify",Fire:"Cleansing Fire",Frost:"Fresh Snow",Toxic:"Sterilise",Desert:"Bleached Bones",Mechanical:"Debugging Agent"}},
{name:"Debuff Damhit", cat:"Power", target:"Enemy", cd:"~2-3", effect:"Reduces enemy damage AND accuracy", dmg:1, util:5, cdEff:3, score:3.1, v:{Tropical:"Leafmold",Fire:"Dehydrate",Frost:"Cold Feet",Toxic:"Enslime",Desert:"Blind",Mechanical:"X-Ray Blast"}},
{name:"Stun", cat:"Cooldown", target:"Enemy", cd:"3", effect:"Stuns enemy - full turn denial", dmg:1, util:5, cdEff:3, score:3.1, v:{Tropical:"Snaring Roots",Fire:"Heatstroke",Frost:"Icy Chains",Toxic:"Paralyse",Desert:"Petrify",Mechanical:"Containment Field"}},
{name:"Barrage", cat:"Attack", target:"Enemy", cd:"1-2", effect:"Damage; some variants scale with speed", dmg:4, util:1, cdEff:5, score:3.05, v:{Tropical:"Thunderstorm",Fire:"Firestorm",Frost:"Flurry",Toxic:"Corrosive Jet",Desert:"Mudslide",Mechanical:"Arcstorm"}},
{name:"Purge", cat:"Attack", target:"Enemy", cd:"2-3", effect:"Removes enemy buffs (or debuffs)", dmg:1, util:4, cdEff:4, score:2.95, v:{Tropical:"Purge",Fire:"Purged by Fire",Frost:"Sleet",Toxic:"Acid Wash",Desert:"Desert Wind",Mechanical:"Data Harvest"}},
{name:"Bomb", cat:"Attack", target:"Enemy", cd:"3-4", effect:"Delayed burst damage after X turns", dmg:4, util:2, cdEff:3, score:2.95, v:{Tropical:"Bug Bomb",Fire:"Magma Bomb",Frost:"Fractal Pain",Toxic:"Inject Larvae",Desert:"Boulder",Mechanical:"Detonate"}},
{name:"Heal", cat:"Attack", target:"Self", cd:"1-3", effect:"Heals self instantly", dmg:1, util:4, cdEff:4, score:2.95, v:{Tropical:"Restoration",Fire:"Cauterise",Frost:"Transfusion",Toxic:"Wallow",Desert:"Oasis",Mechanical:"Repair"}},
{name:"Debuff Dam", cat:"Attack", target:"Enemy", cd:"2", effect:"Reduces enemy damage output", dmg:1, util:4, cdEff:4, score:2.95, v:{Tropical:"Declaw",Fire:"Baked",Frost:"Freezing Fog",Toxic:"Morass",Desert:"Haunting Wail",Mechanical:"Safety Valve"}},
{name:"Debuff Hit", cat:"Attack", target:"Enemy", cd:"2", effect:"Reduces enemy accuracy", dmg:1, util:4, cdEff:4, score:2.95, v:{Tropical:"Throw Dust",Fire:"Heatblind",Frost:"Snowblind",Toxic:"Sticky Ooze",Desert:"Quicksand",Mechanical:"Anomaly Suppression"}},
{name:"Dot", cat:"Attack", target:"Enemy", cd:"1-3", effect:"Applies an affinity damage-over-time", dmg:3, util:2, cdEff:4, score:2.85, v:{Tropical:"Throw Spores",Fire:"Ignite",Frost:"Frostbite",Toxic:"Necrosis",Desert:"Wither",Mechanical:"Delta Wave Corruption"}},
{name:"Reflect", cat:"Attack", target:"Self", cd:"2-5", effect:"Reflects % of incoming damage", dmg:2, util:4, cdEff:2, score:2.8, v:{Tropical:"Spiny Carapace",Fire:"Mirrorlight",Frost:"Prismatic Shield",Toxic:"Caustic Skin",Desert:"Mirage",Mechanical:"Magnetosphere"}},
{name:"Enrage", cat:"Attack", target:"Enemy", cd:"2", effect:"Damage, several variants", dmg:4, util:1, cdEff:4, score:2.8, v:{Tropical:"Enraging Blow",Fire:"Flashpoint",Frost:"Voidfrost",Toxic:"Infect",Desert:"Sulphurous Touch",Mechanical:"Dissonance"}},
{name:"Wild Charge", cat:"Attack", target:"Enemy", cd:"1-2", effect:"Damage burst", dmg:4, util:1, cdEff:4, score:2.8, v:{Tropical:"Apex Predator",Fire:"Wildfire",Frost:"Frostshock",Toxic:"Acid Spray",Desert:"Pound",Mechanical:"Shockbolt"}},
{name:"Attackboth", cat:"Attack", target:"Enemy", cd:"3-5", effect:"Damage, hits both sides", dmg:4, util:2, cdEff:2, score:2.7, v:{Tropical:"Cyclone",Fire:"Thermal Runaway",Frost:"Hailstorm",Toxic:"Fetid Cloud",Desert:"Undermine",Mechanical:"EMP Pulse"}},
{name:"Speedup", cat:"Attack", target:"Self", cd:"~3", effect:"Big speed boost next round", dmg:2, util:3, cdEff:3, score:2.65, v:{Tropical:"Zephyr",Fire:"Boiling Point",Frost:"Antifreeze Blood",Toxic:"Hormone Sacs",Desert:"Blistering Speed",Mechanical:"Apply Oil"}},
{name:"Chargeup", cat:"Attack", target:"Enemy", cd:"2-5", effect:"Big damage after a charge turn", dmg:5, util:1, cdEff:2, score:2.65, v:{Tropical:"Bubbling Rage",Fire:"Solar Flare",Frost:"Absolute Zero",Toxic:"Outbreak",Desert:"Sandstorm",Mechanical:"Aeron Protocol"}},
{name:"Sacrifice", cat:"Attack", target:"Self", cd:"3", effect:"High damage at a cost to self", dmg:5, util:1, cdEff:2, score:2.65, v:{Tropical:"Sacrifice",Fire:"Phoenix Kiss",Frost:"Storm-born",Toxic:"Recycle Flesh",Desert:"To Dust",Mechanical:"Self-Destruct"}},
{name:"Buff Crit", cat:"Attack", target:"Self", cd:"~3", effect:"Buffs own crit chance", dmg:3, util:2, cdEff:3, score:2.6, v:{Tropical:"Precision",Fire:"Consume Phosphorus",Frost:"Indium Heart",Toxic:"Limb Breaker",Desert:"Cold-Blooded",Mechanical:"Spring-Loaded"}},
{name:"Buff Dam", cat:"Attack", target:"Self", cd:"~3", effect:"Buffs own damage", dmg:3, util:2, cdEff:3, score:2.6, v:{Tropical:"Growth Hormone",Fire:"Flameclaw",Frost:"Frostbloom",Toxic:"Biological Horror",Desert:"Swell Up",Mechanical:"Supercharge"}},
{name:"Hot", cat:"Attack", target:"Self", cd:"1-4", effect:"Heal-over-time on self", dmg:1, util:3, cdEff:4, score:2.55, v:{Tropical:"Regrowth",Fire:"Inner Fire",Frost:"Icy Veins",Toxic:"Regenerate Blood",Desert:"Fresh Breeze",Mechanical:"Living Metal"}},
{name:"Buff Dodge", cat:"Attack", target:"Self", cd:"2-3", effect:"Buffs agility / dodge chance", dmg:1, util:3, cdEff:4, score:2.55, v:{Tropical:"Butterfly Wings",Fire:"Shimmer",Frost:"Well Insulated",Toxic:"Scuttle",Desert:"Shifting Sands",Mechanical:"Dislocation"}},
{name:"Delay Heal", cat:"Heal", target:"Self", cd:"1-3", effect:"Heals self after X turns", dmg:1, util:3, cdEff:4, score:2.55, v:{Tropical:"Lifeblood",Fire:"Await the Dawn",Frost:"Glacial Energy",Toxic:"Produce Larvae",Desert:"Nightfall",Mechanical:"Matter Transfer"}},
{name:"Affinity", cat:"Attack", target:"Enemy", cd:"5", effect:"Morphs into a creature for X turns", dmg:3, util:3, cdEff:1, score:2.5, v:{Tropical:"Call of the Wild",Fire:"Called by the Sun",Frost:"Deep Blue Void",Toxic:"Swamp Thing",Desert:"Dessicate",Mechanical:"Clockwork Heart"}},
{name:"Shield", cat:"Attack", target:"Self", cd:"2-5", effect:"Blocks % of incoming damage", dmg:1, util:4, cdEff:2, score:2.45, v:{Tropical:"Ironbark",Fire:"Firewall",Frost:"Crystal Barrier",Toxic:"Impenetrable Slime",Desert:"Stonewall",Mechanical:"Barricade"}},
{name:"Absorb", cat:"Attack", target:"Self", cd:"2-5", effect:"Absorbs % incoming damage, heals self", dmg:1, util:4, cdEff:2, score:2.45, v:{Tropical:"Siphon",Fire:"Thermal Transfer",Frost:"Supercooled",Toxic:"Mucal Field",Desert:"Consuming Echo",Mechanical:"Dynamo"}},
{name:"Swipe", cat:"Attack", target:"Enemy", cd:"None", effect:"Basic filler damage, no cooldown", dmg:2, util:1, cdEff:5, score:2.35, v:{Tropical:"Lash",Fire:"Burn",Frost:"Freeze",Toxic:"Sting",Desert:"Landslide",Mechanical:"Laser Cannon"}},
{name:"Burrow", cat:"Attack", target:"Self", cd:"~3", effect:"100% dodge for the turn", dmg:1, util:3, cdEff:3, score:2.3, v:{Tropical:"Burrow",Fire:"Evaporate",Frost:"Hibernate",Toxic:"Limb Drop",Desert:"Fissure",Mechanical:"Phase Shift"}},
{name:"Buff Hit", cat:"Attack", target:"Self", cd:"~3", effect:"Buffs own accuracy", dmg:2, util:2, cdEff:3, score:2.25, v:{Tropical:"Hawkeye",Fire:"Fire Eater",Frost:"Sharpened Vision",Toxic:"Precision Delivery",Desert:"Viper's Fangs",Mechanical:"Overclock"}},
{name:"Selfdot", cat:"Attack", target:"Enemy", cd:"3-5", effect:"Damage with a self-cost DoT", dmg:3, util:1, cdEff:2, score:1.95, v:{Tropical:"Plague",Fire:"Eruption",Frost:"Cold Snap",Toxic:"Parasitic Growth",Desert:"Curse of Bones",Mechanical:"Dereference Reality"}},
{name:"Dont Touch", cat:"Attack", target:"Enemy", cd:"n/a", effect:"Debuff that explodes if dispelled", dmg:null, util:null, cdEff:null, score:null, v:{Tropical:"Nagging Itch",Fire:"Parch",Frost:"Permafrost",Toxic:"Gelatinous Mass",Desert:"Burning Lungs",Mechanical:"Overload"}}
];

function tierOf(score){
  if(score===null || score===undefined) return null;
  if(score>=3.3) return "S";
  if(score>=2.95) return "A";
  if(score>=2.55) return "B";
  return "C";
}
var TIER_COLOR = {S:"var(--tierS)", A:"var(--tierA)", B:"var(--tierB)", C:"var(--tierC)"};
FAMILIES.forEach(function(f){ f.tier = tierOf(f.score); });

function statColor(v){
  if(v<=2) return "var(--lo)";
  if(v===3) return "var(--mid)";
  return "var(--hi)";
}

var selected = null;
var petMoves = {};

function cssColor(varStr){
  return getComputedStyle(document.documentElement).getPropertyValue(varStr.replace("var(","").replace(")","")).trim() || varStr;
}

function buildWheel(){
  var cx=200, cy=200, r=140;
  var nodesEl = document.getElementById("nodes");
  var edgesEl = document.getElementById("edges");
  var pos = {};
  ORDER.forEach(function(name, i){
    var angle = (Math.PI*2*i/ORDER.length) - Math.PI/2;
    pos[name] = { x: cx + r*Math.cos(angle), y: cy + r*Math.sin(angle) };
  });

  ORDER.forEach(function(name){
    var a = pos[name], b = pos[AFF[name].strong];
    var dx=b.x-a.x, dy=b.y-a.y, dist=Math.sqrt(dx*dx+dy*dy);
    var ux=dx/dist, uy=dy/dist;
    var startR=26, endR=30;
    var x1=a.x+ux*startR, y1=a.y+uy*startR, x2=b.x-ux*endR, y2=b.y-uy*endR;
    var mx=(x1+x2)/2, my=(y1+y2)/2;
    var nx=-uy*18, ny=ux*18;
    var path = document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("d","M"+x1+","+y1+" Q"+(mx+nx)+","+(my+ny)+" "+x2+","+y2);
    path.setAttribute("class","edge");
    path.setAttribute("stroke", cssColor(AFF[name].color));
    path.setAttribute("data-from", name);
    path.setAttribute("data-to", AFF[name].strong);
    edgesEl.appendChild(path);
  });

  ORDER.forEach(function(name){
    var p = pos[name];
    var g = document.createElementNS("http://www.w3.org/2000/svg","g");
    g.setAttribute("class","aff-node");
    g.setAttribute("data-name", name);
    g.onclick = function(){ selectAffinity(name); };
    var c = document.createElementNS("http://www.w3.org/2000/svg","circle");
    c.setAttribute("cx",p.x); c.setAttribute("cy",p.y); c.setAttribute("r",28);
    c.setAttribute("fill", cssColor(AFF[name].color));
    var t = document.createElementNS("http://www.w3.org/2000/svg","text");
    t.setAttribute("x",p.x); t.setAttribute("y",p.y+4);
    t.textContent = name;
    g.appendChild(c); g.appendChild(t);
    nodesEl.appendChild(g);
  });

  var legend = document.getElementById("legend");
  ORDER.forEach(function(name){
    var span = document.createElement("span");
    span.innerHTML = '<span class="dot" style="background:'+cssColor(AFF[name].color)+'"></span>'+name;
    legend.appendChild(span);
  });
}

function selectAffinity(name){
  selected = (selected === name) ? null : name;
  document.querySelectorAll(".aff-node").forEach(function(n){
    n.classList.toggle("faded", selected && n.getAttribute("data-name") !== selected);
  });
  document.querySelectorAll(".edge").forEach(function(e){
    if(!selected){ e.classList.remove("hl","dim"); return; }
    var involved = e.getAttribute("data-from") === selected || e.getAttribute("data-to") === selected;
    e.classList.toggle("hl", involved);
    e.classList.toggle("dim", !involved);
  });
  var detail = document.getElementById("detail");
  if(!selected){
    detail.innerHTML = '<div class="name" style="color:var(--muted);font-weight:500">Click an affinity for its matchups</div>';
  } else {
    var a = AFF[selected];
    detail.innerHTML =
      '<div class="name"><span class="tag" style="background:'+cssColor(a.color)+'">'+selected+'</span></div>'+
      '<div class="rel"><span>Strong against</span><b style="color:'+cssColor(AFF[a.strong].color)+'">'+a.strong+'</b></div>'+
      '<div class="rel"><span>Weak against</span><b style="color:'+cssColor(AFF[a.weak].color)+'">'+a.weak+'</b></div>';
  }
  document.getElementById("rankAffHead").textContent = selected ? selected+" move" : "Move name";
  buildRankStrip();
  renderFamilies();
}

var activeCat = "All";
function buildCatFilter(){
  var cats = ["All","Attack","Cooldown","Heal","Power"];
  var el = document.getElementById("catFilter");
  cats.forEach(function(c){
    var b = document.createElement("button");
    b.textContent = c;
    if(c==="All") b.classList.add("active");
    b.onclick = function(){
      activeCat = c;
      document.querySelectorAll("#catFilter button").forEach(function(x){x.classList.remove("active")});
      b.classList.add("active");
      renderFamilies();
    };
    el.appendChild(b);
  });
}

function buildRankStrip(){
  var el = document.getElementById("rankStrip");
  el.innerHTML = "";
  var sorted = FAMILIES.slice().sort(function(a,b){
    var as = a.score===null ? -1 : a.score, bs = b.score===null ? -1 : b.score;
    return bs - as;
  });
  sorted.forEach(function(f){
    var row = document.createElement("div");
    row.className = "rank-row" + (petMoves[f.name] ? " picked" : "");
    var affName = selected ? (f.v[selected] || "\u2014") : "\u2014";
    var tierHtml = f.tier ? '<span class="rank-tier" style="background:'+TIER_COLOR[f.tier]+'">'+f.tier+'</span>' : '<span class="rank-tier" style="background:var(--line);color:var(--muted)">-</span>';
    var scoreHtml = f.score===null ? "\u2014" : f.score.toFixed(2);
    var barWidth = f.score===null ? 0 : (f.score/5*100);
    row.innerHTML =
      tierHtml+
      '<span class="rank-name">'+f.name+'</span>'+
      '<span class="rank-aff'+(selected?' active':'')+'">'+affName+'</span>'+
      '<span class="rank-bar-bg"><span class="rank-bar" style="width:'+barWidth+'%;background:'+(f.tier?TIER_COLOR[f.tier]:"var(--line)")+'"></span></span>'+
      '<span class="rank-score">'+scoreHtml+'</span>';
    row.onclick = function(){ togglePetMove(f); };
    el.appendChild(row);
  });
}

function togglePetMove(f){
  if(petMoves[f.name]){ delete petMoves[f.name]; } else { petMoves[f.name] = f; }
  renderPetPanel();
  buildRankStrip();
  renderFamilies();
}

function renderPetPanel(){
  var names = Object.keys(petMoves);
  document.getElementById("petCount").textContent = names.length;
  var avgEl = document.getElementById("petAvg");
  var scored = names.map(function(n){ return petMoves[n]; }).filter(function(f){ return f.score!==null; });
  if(scored.length){
    var sum = scored.reduce(function(s,f){ return s + f.score; }, 0);
    avgEl.textContent = (sum/scored.length).toFixed(2);
  } else {
    avgEl.textContent = "\u2014";
  }
  var chipsEl = document.getElementById("petChips");
  if(!names.length){
    chipsEl.innerHTML = '<span class="pet-empty">Click move families on the right to add them here (a pet typically rolls 4\u20136)</span>';
    return;
  }
  chipsEl.innerHTML = names.map(function(n){
    var f = petMoves[n];
    var displayName = selected && f.v[selected] ? f.v[selected] : f.name;
    var tierTxt = f.tier ? " \u00b7 "+f.tier : "";
    return '<span class="pet-chip">'+displayName+tierTxt+'<button data-remove="'+n+'">&times;</button></span>';
  }).join("");
  chipsEl.querySelectorAll("button[data-remove]").forEach(function(btn){
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      var n = btn.getAttribute("data-remove");
      togglePetMove(FAMILIES.find(function(f){ return f.name===n; }));
    });
  });
}

function renderFamilies(){
  var q = document.getElementById("search").value.trim().toLowerCase();
  var sortBy = document.getElementById("sortBy").value;
  var list = document.getElementById("famList");
  list.innerHTML = "";
  var arr = FAMILIES.filter(function(f){
    if(activeCat !== "All" && f.cat !== activeCat) return false;
    if(q && !(f.name.toLowerCase().indexOf(q)>-1 || f.effect.toLowerCase().indexOf(q)>-1)) return false;
    return true;
  });
  arr.sort(function(a,b){
    if(sortBy==="score"){ var as=a.score===null?-1:a.score, bs=b.score===null?-1:b.score; return bs-as; }
    if(sortBy==="name") return a.name.localeCompare(b.name);
    if(sortBy==="cat"){ var as2=a.score===null?-1:a.score, bs2=b.score===null?-1:b.score; return a.cat.localeCompare(b.cat) || (bs2-as2); }
  });
  arr.forEach(function(f){
    var div = document.createElement("div");
    div.className = "fam" + (petMoves[f.name] ? " picked" : "");
    var chips = ORDER.filter(function(n){ return f.v[n]; }).map(function(n){
      var isSel = selected && n === selected;
      var isDim = selected && !isSel;
      return '<span class="chip'+(isSel?' hl':'')+(isDim?' dim':'')+'" style="background:'+cssColor(AFF[n].color)+'">'+f.v[n]+'</span>';
    }).join("");
    var tierHtml = f.tier ? '<span class="fam-tier" style="background:'+TIER_COLOR[f.tier]+'">'+f.tier+'</span>' : '<span class="fam-tier" style="background:var(--line);color:var(--muted)">-</span>';
    var scoreTxt = f.score===null ? "\u2014" : f.score.toFixed(2);
    var substats = f.score===null ? "" :
      '<div class="substats">'+
        '<div class="substat"><div class="substat-label">Damage '+f.dmg+'/5</div><div class="substat-bar-bg"><div class="substat-bar" style="width:'+(f.dmg/5*100)+'%;background:'+statColor(f.dmg)+'"></div></div></div>'+
        '<div class="substat"><div class="substat-label">Utility '+f.util+'/5</div><div class="substat-bar-bg"><div class="substat-bar" style="width:'+(f.util/5*100)+'%;background:'+statColor(f.util)+'"></div></div></div>'+
        '<div class="substat"><div class="substat-label">CD Eff '+f.cdEff+'/5</div><div class="substat-bar-bg"><div class="substat-bar" style="width:'+(f.cdEff/5*100)+'%;background:'+statColor(f.cdEff)+'"></div></div></div>'+
      '</div>';
    div.innerHTML =
      '<div class="fam-top">'+
        '<div class="fam-left">'+tierHtml+'<span class="fam-name">'+f.name+'</span><span class="fam-meta">'+f.cat+' &middot; '+f.target+' &middot; CD '+f.cd+'</span></div>'+
        '<span class="fam-score">'+scoreTxt+'</span>'+
      '</div>'+
      '<div class="fam-effect">'+f.effect+'</div>'+
      substats+
      '<div class="chips">'+chips+'</div>';
    div.addEventListener("click", function(){ togglePetMove(f); });
    list.appendChild(div);
  });
}

buildWheel();
buildCatFilter();
buildRankStrip();
renderPetPanel();
renderFamilies();
document.getElementById("search").addEventListener("input", renderFamilies);
document.getElementById("sortBy").addEventListener("change", renderFamilies);
