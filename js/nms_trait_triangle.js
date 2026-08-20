/* ---------- geometry ----------
   Equilateral triangle. Every trait owns one corner and the side opposite it.
   At the corner the trait is 100%; on the opposite side it is 0%.
   The dot is the barycentric average of the corners, weighted by the three
   trait values after normalising them so they add up to 1.                */

/* ---------- data ---------- */
var AXES = [
  { key:0, color:"#3ddc84",
    trait:"Helpful", anti:"Playful",       /* trait = corner, anti = opposite side */
    cx:150, cy:409, value:15,
    fx:{ Helpful:"2-turn combat buff on itself",
         Playful:"2-turn dodge chance buff on itself" } },
  { key:1, color:"#ff4d4d",
    trait:"Gentle", anti:"Aggressive",
    cx:340, cy:80, value:100,
    fx:{ Gentle:"2-turn combat debuff on the opponent",
         Aggressive:"Damage over time on the opponent" } },
  { key:2, color:"#4d9dff",
    trait:"Devoted", anti:"Independent",
    cx:530, cy:409, value:90,
    fx:{ Devoted:"Heal over time on itself",
         Independent:"2-turn accuracy debuff on the opponent" } }
];

var BUILDS = {
  "Helpful|Gentle|Independent":{
    name:"Tactical suppressor",
    text:"Boosts its own damage while stripping the opponent's attack power and accuracy. It wins by making the enemy miss and hit softly &mdash; but with no self-heal, a long fight against a healer can stall out."},
  "Helpful|Gentle|Devoted":{
    name:"Steadfast bruiser",
    text:"Raises its own damage, blunts the opponent's, and heals through chip damage. A slow, safe attrition pet: no dodge, no burst, just a fight it refuses to lose."},
  "Helpful|Aggressive|Independent":{
    name:"Relentless duelist",
    text:"Stacks its own damage, bleeds the opponent with damage over time, and blinds their accuracy. Pure offence &mdash; it wins fast or not at all, because nothing here keeps it alive."},
  "Helpful|Aggressive|Devoted":{
    name:"Bloodthirsty warden",
    text:"Damage buff plus damage over time, with a self-heal to trade blows. Tanky offence, but it never reduces incoming damage, so a heavy hitter still hurts."},
  "Playful|Gentle|Independent":{
    name:"Phantom",
    text:"Dodge buff, opponent attack debuff and accuracy debuff &mdash; three layers of not getting hit. Extremely evasive, but its own damage is never improved, so fights run long."},
  "Playful|Gentle|Devoted":{
    name:"Whimsical guardian",
    text:"Dodges, weakens the enemy's attacks, and heals itself. A survival/attrition pet that outlasts rather than outguns &mdash; it has no damage boost of its own."},
  "Playful|Aggressive|Independent":{
    name:"Harrier",
    text:"Dodge buff, damage over time, and an accuracy debuff. A slippery poison build that chips the opponent down while avoiding hits &mdash; fragile if a big attack does land."},
  "Playful|Aggressive|Devoted":{
    name:"Vampiric skirmisher",
    text:"Dodges, bleeds the opponent, and heals itself. Self-sufficient sustain damage, though nothing reduces the enemy's hit power."}
};

/* ---------- helpers ---------- */
function poleOf(ax){ return ax.value >= 50 ? ax.trait : ax.anti; }
function strengthOf(ax){ return ax.value >= 50 ? ax.value : 100 - ax.value; }
function frequency(s){
  if(s === 100) return "Every chance";
  if(s >= 85)   return "Very often";
  if(s >= 70)   return "Often";
  if(s >= 60)   return "Sometimes";
  return "Rarely";
}

/* barycentric position of the dot */
function dotPosition(){
  var sum = AXES[0].value + AXES[1].value + AXES[2].value;
  var w = AXES.map(function(ax){
    return sum > 0 ? ax.value / sum : 1 / 3;   /* 0/0/0 has no direction: sit centre */
  });
  var x = 0, y = 0;
  AXES.forEach(function(ax, i){ x += w[i] * ax.cx; y += w[i] * ax.cy; });
  return { x:x, y:y };
}

/* ---------- sliders ---------- */
var slidersEl = document.getElementById("sliders");
AXES.forEach(function(ax){
  var d = document.createElement("div");
  d.className = "slider";
  d.style.setProperty("--c", ax.color);
  d.innerHTML =
    '<div class="slider-top"><span><b>'+ax.anti+'</b> <span id="s'+ax.key+'a"></span></span>' +
    '<span><span id="s'+ax.key+'b"></span> <b>'+ax.trait+'</b></span></div>' +
    '<input type="range" min="0" max="100" step="1" id="rng'+ax.key+'" value="'+ax.value+'" ' +
    'aria-label="'+ax.anti+' versus '+ax.trait+'">';
  slidersEl.appendChild(d);
  d.querySelector("input").addEventListener("input", function(e){
    ax.value = Number(e.target.value);
    render();
  });
});

/* ---------- render ---------- */
function render(){
  var poles = [], weak = [];

  AXES.forEach(function(ax){
    document.getElementById("v"+ax.key).textContent = ax.value + "%";
    document.getElementById("o"+ax.key).textContent = (100 - ax.value) + "%";
    document.getElementById("s"+ax.key+"a").textContent = (100 - ax.value) + "%";
    document.getElementById("s"+ax.key+"b").textContent = ax.value + "%";
    document.getElementById("rng"+ax.key).value = ax.value;

    var pole = poleOf(ax), s = strengthOf(ax);
    poles.push(pole);
    if(s < 60) weak.push(ax.anti + "/" + ax.trait);
  });

  /* dot and its dashed ties to each corner */
  var p = dotPosition();
  var dot = document.getElementById("dot");
  dot.setAttribute("cx", p.x);
  dot.setAttribute("cy", p.y);
  AXES.forEach(function(ax){
    var tie = document.getElementById("tie"+ax.key);
    tie.setAttribute("x1", p.x); tie.setAttribute("y1", p.y);
    tie.setAttribute("x2", ax.cx); tie.setAttribute("y2", ax.cy);
  });

  var build = BUILDS[poles.join("|")];
  document.getElementById("buildName").textContent = build.name;
  document.getElementById("buildSummary").innerHTML = build.text;

  var note = document.getElementById("buildNote");
  if(weak.length){
    note.hidden = false;
    note.innerHTML = "Below 60% an axis is close to a coin flip and its bonus move rarely triggers. Push " +
      weak.join(" and ") + " toward one end in the Egg Sequencer.";
  } else {
    note.hidden = true;
  }

  var rows = "";
  AXES.forEach(function(ax){
    var pole = poleOf(ax), s = strengthOf(ax);
    rows += '<tr><td class="dot-cell"><span style="background:'+ax.color+'"></span></td>' +
            '<td>'+pole+' '+s+'%</td><td>'+ax.fx[pole]+'</td>' +
            '<td class="freq">'+frequency(s)+'</td></tr>';
  });
  document.getElementById("effects").innerHTML = rows;
}

render();
