// Vestiaire, rendu des onglets, fiche d’une figure avec chrono.
"use strict";
// Vestiaire : [identifiant, nom, niveau requis]. La médaille se débloque en terminant une quête principale.
const WARD = [
  {slot:"skin", name:"Peau", items:[["s1","Claire"],["s2","Hâlée"],["s3","Mate"],["s4","Foncée"]]},
  {slot:"hair", name:"Coiffure", items:[["none","Rasés"],["short","Courts"],["bun","Chignon"],["tail","Queue de cheval"]]},
  {slot:"hairc", name:"Couleur des cheveux", items:[["brown","Bruns"],["black","Noirs"],["blond","Blonds"],["red","Roux"],["grey","Gris"]]},
  {slot:"top", name:"Haut", items:[["none","Torse nu"],["tank_k","Débardeur noir"],["tee_w","T-shirt blanc"],["tank_w","Débardeur blanc",2],["tee_g","T-shirt gris",2],["tee_k","T-shirt noir",3],
    ["tee_o","T-shirt orange",5],["tank_o","Débardeur orange",6],["tee_b","T-shirt bleu",7],["ls_k","Manches longues noires",9],["tee_v","T-shirt vert",10],["ls_w","Manches longues blanches",11],
    ["tee_y","T-shirt jaune","b:st7"],["tee_r","T-shirt rouge","b:s100"],["tee_p","T-shirt violet","b:e10"],["ls_n","Manches longues marine","b:se10"],
    ["tee_x","T-shirt rose","m:in_holds"],["tank_v","Débardeur vert","m:pl_lean"],["ls_v","Manches longues vertes","m:pl_half"],["tank_r","Débardeur rouge","b:h180"],["ls_r","Manches longues rouges","m:oa_switch"],["tank_p","Débardeur violet","b:se200"],["ls_p","Manches longues violettes","b:se400"],["tank_y","Débardeur jaune","m:pl_press"],
    ["tee_n","T-shirt marine","l:oa_oahs10:1"],["tank_n","Débardeur marine",15],["ls_x","Manches longues roses",18],["tank_x","Débardeur rose",39],["ls_y","Manches longues jaunes",42]]},
  {slot:"bottom", name:"Bas", items:[["short_k","Short noir"],["short_g","Short gris",2],["short_o","Short orange",4],["short_b","Short bleu",5],["pants_k","Pantalon noir",6],["pants_g","Pantalon gris",8],
    ["pants_n","Pantalon marine",10],["short_v","Short vert","b:st3"],["short_r","Short rouge","b:h10"],["pants_w","Pantalon blanc","b:st30"],
    ["short_x","Short rose","m:in_7s"],["short_y","Short jaune","m:pr_lsit"],["pants_o","Pantalon orange","m:oa_wall"],["pants_r","Pantalon rouge","b:se100"],["pants_p","Pantalon violet","m:pr_manna"],["pants_x","Pantalon rose","b:h600"],["pants_y","Pantalon jaune",21]]},
  {slot:"feet", name:"Pieds", items:[["bare","Pieds nus"],["socks_w","Chaussettes blanches",2],["socks_k","Chaussettes noires",3],["shoes_k","Chaussures noires",4],["shoes_w","Chaussures blanches",6],["shoes_o","Chaussures orange",9],["shoes_y","Chaussures jaunes","b:se50"],
    ["socks_r","Chaussettes rouges","m:b2_str15"],["socks_x","Chaussettes roses","m:in_str40"],["shoes_x","Chaussures roses","m:oa_flaghoriz"],["flip_b","Palmes de plongée","m:st_split"],["clown_r","Chaussures de clown","b:se100"],
    ["socks_v","Chaussettes vertes","l:pl_straddle:1"],["shoes_v","Chaussures vertes","l:pl_straddle:2"],["socks_y","Chaussettes jaunes","b:st100"],["shoes_p","Chaussures violettes",33]]},
  {slot:"wrists", name:"Poignets et mains", items:[["none","Rien"],["wraps_w","Bandes blanches",3],["wraps_o","Bandes orange",4],["wraps_k","Bandes noires",7],["chalk","Magnésie","b:h10"],["wraps_r","Bandes rouges","m:in_str60"],["wraps_p","Bandes violettes","m:pl_tuck"],["wraps_y","Bandes jaunes","m:pr_lsitHs"],["box_r","Gants de boxe","m:oa_wall"],["wraps_v","Bandes vertes","l:pr_stalder:1"],["wraps_x","Bandes roses","b:st60"]]},
  {slot:"head", name:"Tête", items:[["none","Rien"],["band_o","Bandeau orange",5],["band_w","Bandeau blanc",5],["beanie_k","Bonnet noir",7],["cap_o","Casquette orange",8],["cap_k","Casquette noire",9],["beanie_r","Bonnet rouge","b:s1000"],["crown","Couronne","b:goal_oahs"],
    ["prop_b","Casquette à hélice",2],["party_r","Chapeau de fête","b:se10"],["cat_k","Oreilles de chat","m:b2_str15"],["chef_w","Toque de chef","m:in_str60"],["viking_g","Casque de viking","m:pl_straddle"],["horn","Corne de licorne","m:oa_oahs"],["halo","Auréole","m:pr_manna"],
    ["band_p","Bandeau violet","l:oa_oahs:1"],["beanie_p","Bonnet violet","l:oa_oahs:2"],["cap_v","Casquette verte","l:pl_full:1"],["beanie_x","Bonnet rose",24],["cap_p","Casquette violette",27],["band_x","Bandeau rose",30]]},
  {slot:"face", name:"Visage", items:[["none","Rien"],["stache","Moustache",3],["nose","Nez de clown","b:st3"],["shades","Lunettes de soleil","m:b1_free5"],["mono","Monocle","m:pr_straddle"],["beard","Barbe de sage","b:h60"]]},
  {slot:"extra", name:"Accessoire", items:[["none","Rien"],["belt_w","Ceinture blanche",3],["belt_o","Ceinture orange",6],["belt_k","Ceinture noire",12],["medal","Médaille","quest"],["medal2","Deux médailles","b:goal_planche"],
    ["bow_r","Nœud papillon","m:in_holds"],["duck","Bouée canard","m:pr_lsit"],["tutu","Tutu rose","m:in_7s"],["cape_r","Cape de super-héros","m:pr_straddle"],["cape_k","Cape noire","m:pl_press"],
    ["cape_v","Cape verte","l:pl_full:2"],["bow_y","Nœud papillon jaune","l:pr_manna:1"],["cape_b","Cape bleue","l:pr_manna:2"],["cape_p","Cape violette","m:ul_c1"],["bow_p","Nœud papillon violet","m:ul_c3"],["belt_p","Ceinture violette","m:ul_c12"],
    ["belt_x","Ceinture rose",36],["cape_y","Cape dorée",45],["cape_x","Cape rose","b:st365"]]},
];
// Postures que le personnage peut prendre : debout, plus celle de chaque jalon validé.
const poseOf = id => POSE3D[id] || (id.startsWith("pl_") ? id : null);
function unlockedPoses(){ const out = [["stand","Debout"]], seen = new Set(["stand"]);
  Object.keys(MS).forEach(id=>{ const p = poseOf(id); if (p && st(id).done && !seen.has(p)) { seen.add(p); out.push([p, MS[id].name]); } });
  return out; }
// les coffres du parcours ajoutent chacun une tenue au vestiaire
Object.entries(CHESTS).forEach(([sid, [slot, id, name]])=>{ const w = WARD.find(x=>x.slot === slot); if (w && !w.items.some(it=>it[0] === id)) w.items.push([id, name, "c:" + sid]); });
const wardOk = (need, Z) => !need || (need === "quest" ? Z.badges.some(b=>b.ok && b.id.startsWith("goal_")) : typeof need === "string" ? need.startsWith("l:") ? (([, id, k]) => MS[id] && lvlOf(MS[id]) >= +k)(need.split(":")) : need.startsWith("m:") ? st(need.slice(2)).done : (need.startsWith("c:") ? (chestOpen(SEC[need.slice(2)]) || (S.chests || []).includes(need.slice(2))) : (Z.badges.find(b=>b.id === need.slice(2)) || {}).ok) : Z.lvl >= need);
const FIT0 = {skin:"s2", hair:"short", hairc:"brown", top:"tee_w", bottom:"short_k", feet:"bare", wrists:"none", head:"none", face:"none", extra:"none"};
const fit = () => Object.assign({}, FIT0, S.fit || {});
// ---------- Vestiaire visuel : chaque élément est dessiné, aux couleurs du personnage ; les verrouillés se voient aussi ----------
const WCOL = {w:"#f2f0ea", k:"#2a2a28", g:"#8a8880", o:"#ff5b2e", b:"#3d5f94", v:"#4f7a5b", y:"#dba622", r:"#c0392b", p:"#6a4c93", n:"#22324f", x:"#e58aa8"};
const WSKIN = {s1:"#f0c8a4", s2:"#d9a074", s3:"#a86e45", s4:"#6b452b"}, WHAIR = {brown:"#3a2a20", black:"#141312", blond:"#c9a45c", red:"#9a4a22", grey:"#9a9892"};
function wIcon(slot, id, F){ const [k, c] = String(id).split("_"), C = WCOL[c] || "#9a9892", sk = WSKIN[F.skin] || WSKIN.s2, hc = WHAIR[F.hairc] || WHAIR.brown, L = "stroke-linecap='round' stroke-linejoin='round'";
  const head = "<circle cx='24' cy='26' r='11' fill='" + sk + "'/>", empty = "<circle cx='24' cy='24' r='13' fill='none' stroke='currentColor' stroke-width='2' stroke-dasharray='3 4' opacity='.5'/>";
  let g = "";
  if (slot === "skin") g = "<circle cx='24' cy='24' r='14' fill='" + (WSKIN[id] || sk) + "'/>";
  else if (slot === "hairc") g = head.replace(sk, sk) + "<path d='M13 24a11 11 0 0 1 22 0c-3-4-8-6-11-6s-8 2-11 6z' fill='" + (WHAIR[id] || hc) + "'/>";
  else if (slot === "hair") g = head + (k === "none" ? "" : "<path d='M13 24a11 11 0 0 1 22 0c-3-4-8-6-11-6s-8 2-11 6z' fill='" + hc + "'/>" + (k === "bun" ? "<circle cx='24' cy='11' r='5' fill='" + hc + "'/>" : k === "tail" ? "<path d='M34 20c6 2 7 10 4 15' stroke='" + hc + "' stroke-width='4' fill='none' " + L + "/>" : ""));
  else if (slot === "top") g = k === "none" ? "<path d='M14 14h20l2 22H12z' fill='" + sk + "'/>" : k === "tank" ? "<path d='M18 9h3c1 4 5 4 6 0h3l2 6v25H16V15z' fill='" + C + "'/>" : k === "ls" ? "<path d='M17 9h14l9 7-3 4v18l-3 1V20 39H14V20v19l-3-1V20l-3-4z' fill='" + C + "'/>" : "<path d='M17 9h14l9 7-4 5-4-3v21H16V18l-4 3-4-5z' fill='" + C + "'/>";
  else if (slot === "bottom") g = k === "pants" ? "<path d='M14 9h20l2 31h-8l-4-20-4 20h-8z' fill='" + C + "'/>" : "<path d='M13 13h22l2 18h-10l-3-9-3 9H11z' fill='" + C + "'/>";
  else if (slot === "feet") g = k === "bare" ? "<path d='M18 10h8v18c4 1 10 3 11 6 1 2-1 4-4 4H17c-2 0-3-1-3-3z' fill='" + sk + "'/>" : k === "socks" ? "<path d='M18 10h9v17c4 1 9 3 10 6 1 2-1 5-4 5H17c-2 0-3-1-3-3z' fill='" + C + "'/>" : k === "clown" ? "<path d='M18 18h8v8c8 0 16 3 17 8s-3 6-8 6H12c-4 0-6-2-5-5s4-3 6-3z' fill='" + C + "'/><circle cx='36' cy='33' r='3' fill='#fff' opacity='.6'/>" : k === "flip" ? "<path d='M18 10h9v14l12 12c1 2-1 4-3 4H14l4-16z' fill='" + C + "'/>" : "<path d='M17 16h9v8c6 1 13 3 14 7 1 3-1 6-5 6H15c-2 0-3-1-3-3l2-10z' fill='" + C + "'/><path d='M12 37h28' stroke='#fff' stroke-width='3' opacity='.55'/>";
  else if (slot === "wrists") g = k === "none" ? empty : k === "box" ? "<path d='M12 18c0-6 5-9 12-9s12 4 12 11-4 12-11 12h-4l-1 7h-6l-1-8c-1-4-1-9-1-13z' fill='" + C + "'/><path d='M14 36h12' stroke='#fff' stroke-width='2' opacity='.6'/>" : "<path d='M17 8v18c-3-1-6 0-6 3l7 11h13l4-8V18c0-2-3-2-3 0v-4c0-2-3-2-3 0v-3c0-2-3-2-3 0V8c0-2-3-2-3 0' fill='" + sk + "'/>" + (k === "chalk" ? "<path d='M15 22l18 10M14 30l14-12M22 16l10 10' stroke='#fff' stroke-width='3' opacity='.75' " + L + "/>" : "<rect x='14' y='34' width='20' height='8' rx='2' fill='" + C + "'/>");
  else if (slot === "head") { const hat = {band:"<rect x='12' y='19' width='24' height='5' rx='2' fill='" + C + "'/>", beanie:"<path d='M12 24a12 12 0 0 1 24 0z' fill='" + C + "'/><rect x='11' y='22' width='26' height='5' rx='2' fill='" + C + "'/>", cap:"<path d='M13 23a11 10 0 0 1 22 0z' fill='" + C + "'/><path d='M24 23h16' stroke='" + C + "' stroke-width='4' " + L + "/>",
      crown:"<path d='M12 22l3-11 5 6 4-8 4 8 5-6 3 11z' fill='#c9a227'/>", prop:"<path d='M13 23a11 10 0 0 1 22 0z' fill='" + C + "'/><path d='M24 13V7M15 7h18' stroke='#dba622' stroke-width='3' " + L + "/>", party:"<path d='M24 2l9 21H15z' fill='" + C + "'/><circle cx='24' cy='3' r='3' fill='#fff'/>",
      cat:"<path d='M14 20l2-11 6 7zM34 20l-2-11-6 7z' fill='" + C + "'/>", chef:"<rect x='16' y='14' width='16' height='9' fill='#f4f2ec'/><circle cx='18' cy='10' r='5' fill='#f4f2ec'/><circle cx='24' cy='8' r='6' fill='#f4f2ec'/><circle cx='30' cy='10' r='5' fill='#f4f2ec'/>",
      viking:"<path d='M13 23a11 10 0 0 1 22 0z' fill='" + C + "'/><path d='M13 19c-5-2-7-8-6-12 3 3 5 6 8 7M35 19c5-2 7-8 6-12-3 3-5 6-8 7' fill='#f2f0ea'/>", horn:"<path d='M21 16l3-14 3 14z' fill='#c9a227'/>", halo:"<ellipse cx='24' cy='9' rx='10' ry='3' fill='none' stroke='#c9a227' stroke-width='2.5'/>"}[k];
    g = k === "none" ? empty : head + (hat || ""); }
  else if (slot === "face") { const f = {stache:"<path d='M17 31c3-3 5-2 7 0 2-2 4-3 7 0-3 2-5 2-7 0-2 2-4 2-7 0z' fill='" + hc + "'/>", nose:"<circle cx='24' cy='28' r='3.5' fill='#d2362b'/>", shades:"<circle cx='19.5' cy='25' r='4' fill='#1b1b19'/><circle cx='28.5' cy='25' r='4' fill='#1b1b19'/><path d='M23 25h2' stroke='#1b1b19' stroke-width='2'/>",
      mono:"<circle cx='19' cy='25' r='1.6' fill='#1b1b19'/><circle cx='29' cy='25' r='4' fill='none' stroke='#c9a227' stroke-width='2'/><path d='M33 26l2 10' stroke='#c9a227' stroke-width='1'/>", beard:"<path d='M14 28c2 10 7 13 10 13s8-3 10-13c-3 3-6 4-10 4s-7-1-10-4z' fill='#f2f0ea'/>"}[k];
    g = k === "none" ? empty : head + "<circle cx='20' cy='25' r='1.4' fill='#1b1b19'/><circle cx='28' cy='25' r='1.4' fill='#1b1b19'/>" + (f || ""); }
  else if (slot === "extra") g = ({none:empty, belt:"<rect x='8' y='20' width='32' height='8' rx='2' fill='" + C + "'/><rect x='21' y='19' width='6' height='10' fill='none' stroke='#c9a227' stroke-width='2'/>",
      medal:"<path d='M17 6l7 14 7-14' fill='none' stroke='#ff5b2e' stroke-width='4'/><circle cx='24' cy='30' r='9' fill='#c9a227'/>", medal2:"<path d='M13 6l5 14 5-14M25 6l5 14 5-14' fill='none' stroke='#ff5b2e' stroke-width='3'/><circle cx='18' cy='30' r='7' fill='#c9a227'/><circle cx='31' cy='30' r='7' fill='#c9a227'/>",
      bow:"<path d='M24 24L10 15v18zM24 24l14-9v18z' fill='" + C + "'/><circle cx='24' cy='24' r='4' fill='" + C + "'/>", duck:"<ellipse cx='24' cy='30' rx='17' ry='8' fill='none' stroke='#f2c230' stroke-width='6'/><circle cx='34' cy='17' r='6' fill='#f2c230'/><path d='M39 17l5 1-5 2z' fill='#d2362b'/>",
      tutu:"<path d='M18 14h12l12 18H6z' fill='#e58aa8'/><path d='M6 32l4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4' fill='none' stroke='#fff' stroke-width='1.5' opacity='.6'/>", cape:"<path d='M16 8h16l6 32H10z' fill='" + C + "'/><path d='M16 8h16' stroke='#1b1b19' stroke-width='3'/>",
      wings:"<path d='M23 24C14 6 4 10 6 18s9 10 17 6zM25 24c9-18 19-14 17-6s-9 10-17 6z' fill='#f2f0ea' stroke='#bbb' stroke-width='1'/>"})[k] || "";
  return "<svg viewBox='0 0 48 48' width='44' height='44' aria-hidden='true'>" + g + "</svg>"; }
// ce qui débloque un élément, en clair
function wardNeed(need, Z){ if (!need) return ""; if (need === "quest") return "Termine une quête"; if (typeof need === "number") return "Niveau " + need;
  if (need.startsWith("m:")) return "Valide « " + MS[need.slice(2)].name + " »";
  if (need.startsWith("l:")) { const [, id, k] = need.split(":"); return "Palier " + k + " de « " + MS[id].name + " »"; } if (need.startsWith("c:")) return "Coffre « " + SEC[need.slice(2)].name + " »";
  const bd = Z.badges.find(b => b.id === need.slice(2)); return bd ? "Badge « " + bd.name + " »" : ""; }
const wNeedShort = (need, Z) => typeof need === "number" ? "niv. " + need : need === "quest" ? "quête" : need.startsWith("m:") ? "figure" : need.startsWith("l:") ? "palier" : need.startsWith("c:") ? "coffre" : "badge";
// aperçu en grand : le personnage du vestiaire, qui porte ce que tu touches (même un élément verrouillé, pour l’essayer)
let fitA = null;
function fitPreview(F, label){ const host = $("fitPrev"); if (!host || !sprMod) { if (host) host.hidden = true; return; } host.hidden = false;
  try { if (!fitA) fitA = sprMod.mount(host); fitA.set(Object.assign({}, a3want || {pose:"stand", level:1}, {fit:F})); } catch(e){ host.hidden = true; }
  $("fitLab").textContent = label || ""; }
function renderFit(tryF){
  const box = $("fitBody"), F = fit(), Z = lastZ || stats(); box.textContent = "";
  const all = WARD.flatMap(w=>w.items), okN = all.filter(([id,name,need])=>wardOk(need, Z)).length;
  fitPreview(tryF ? tryF.f : F, tryF ? tryF.lab : "");
  const cnt0 = el("div","mut", okN + " éléments débloqués sur " + all.length + ". Touche un élément verrouillé pour l’essayer."); cnt0.style.marginTop = "10px"; box.append(cnt0);
  { const s = el("div","slot"), row = el("div","chips"), cur = F.pose || "auto"; s.append(el("div","lab","Posture"));
    [["auto","Automatique (dernière figure)"]].concat(unlockedPoses()).forEach(([id, name])=>{
      const b = el("button","chip" + (cur === id ? " on" : ""), name); b.setAttribute("aria-pressed", cur === id);
      b.onclick = () => { S.fit = Object.assign(fit(), {pose:id}); save(); render(); renderFit(); }; row.append(b); });
    s.append(row); box.append(s); }
  WARD.forEach(w=>{ const s = el("div","slot"); s.append(el("div","lab",w.name)); const grid = el("div","wgrid");
    // débloqués d’abord, puis les verrouillés : on voit ce qui reste à gagner
    w.items.map(it => [it, wardOk(it[2], Z)]).sort((a, b) => (b[1] ? 1 : 0) - (a[1] ? 1 : 0)).forEach(([[id, name, need], ok]) => {
      const on = F[w.slot] === id, b = el("button","wt" + (on ? " on" : "") + (ok ? "" : " lk")); b.innerHTML = wIcon(w.slot, id, F); b.append(el("span","wn", name));
      if (!ok) { b.append(el("span","wl", wNeedShort(need, Z))); b.insertAdjacentHTML("beforeend", "<svg class='wlk' viewBox='0 0 24 24' width='14' height='14' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round'><rect x='5' y='11' width='14' height='10' rx='2'/><path d='M8 11V8a4 4 0 0 1 8 0v3'/></svg>"); }
      b.setAttribute("aria-label", name + (on ? ", porté" : ok ? "" : ", verrouillé : " + wardNeed(need, Z))); b.setAttribute("aria-pressed", on);
      b.onclick = () => { if (!ok) { renderFit({f:Object.assign(fit(), {[w.slot]:id}), lab:"Aperçu : " + name + ", " + wardNeed(need, Z)}); return; }
        S.fit = Object.assign(fit(), {[w.slot]:id}); save(); if (A3 && a3want) { a3want.fit = fit(); A3.set(a3want); } clearTimeout(sprT); sprT = setTimeout(buildSprites, 900); renderFit(); };
      grid.append(b); });
    s.append(grid); box.append(s); });
}
$("fitOpen").onclick = () => { delete S.newFit; save(); $("fitOpen").classList.remove("new"); renderFit(); window.scrollTo(0, 0); $("fitDlg").showModal(); };
document.querySelectorAll("#fbDlg [data-k]").forEach(b=>b.onclick = () => { if (b.dataset.k === "pain") { $("fbZone").hidden = false; return; } feedback(b.dataset.k); });
document.querySelectorAll("#fbDlg [data-z]").forEach(b=>b.onclick = () => { S.painZone = b.dataset.z; feedback("pain"); $("fbZone").hidden = true; });
$("plX").onclick = () => { S.placed = true; save(); $("plDlg").close(); render(); };
// fenêtres : la croix ferme, et un toucher à côté de la fenêtre aussi
[["qkDlg","qkX"],["vdDlg","vdX"],["bdDlg","bdX"],["etaDlg","etaX"],["fitDlg","fitX"],["dlg","dX"],["sd","sdX"]].forEach(([id, x]) => { const d = $(id);
  const ok = () => id !== "qkDlg" || !document.querySelector("#qkBody .cedit") || typeof qkGuard !== "function" || qkGuard();   // atelier de cours : rien ne se perd sans confirmation
  $(x).onclick = () => { if (ok()) d.close(); }; d.addEventListener("click", e => { if (e.target === d && ok()) d.close(); }); d.addEventListener("cancel", e => { if (!ok()) e.preventDefault(); }); });
function setAvatar(s){
  a3want = s; if (A3) { A3.set(s); return; }
  if (a3tried) return; a3tried = true;
  try { const c = document.createElement("canvas"); if (!(c.getContext("webgl2") || c.getContext("webgl"))) return; } catch(e){ return; }
  import(new URL("avatar3d.js", document.baseURI).href).then(m=>{ sprMod = m; buildSprites(); const host = $("av3d"); host.hidden = false; A3 = m.mount(host); $("av").style.display = "none"; A3.set(a3want); })
    .catch(()=>{ $("av3d").hidden = true; $("av").style.display = ""; });
}

// ---------- Rendu ----------
function render(){
  window._bb = null;
  const ids = GOALS[0].ms;
  const Z = stats(), weekAgo = Date.now() - 7*864e5;
  $("stStreak").textContent = Z.streak;
  $("stWeek").textContent = new Set(S.log.filter(l=>l.t>weekAgo).map(l=>dayKey(l.t))).size;
  $("stDone").textContent = Z.done;
  // personnage : sa posture est celle du dernier jalon validé de la quête ; l’anneau montre la progression vers le niveau suivant
  const stage = ids.filter(id=>st(id).done && FIG[id]).pop() || "_stand", frac = (Z.xp - Z.lo) / (Z.hi - Z.lo), R = 48, C = 2*Math.PI*R;
  $("av").innerHTML = '<svg class="ring" viewBox="0 0 104 104" width="104" height="104" fill="none" aria-hidden="true"><circle cx="52" cy="52" r="' + R + '" stroke="var(--line)" stroke-width="4"/>'
    + '<circle cx="52" cy="52" r="' + R + '" stroke="var(--acc)" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + (C*frac).toFixed(1) + ' ' + C.toFixed(1) + '"/></svg><span class="me">' + figMini(stage, 72) + '</span>';
  $("av").setAttribute("aria-label","Ton personnage, niveau " + Z.lvl);
  const autoPose = POSE3D[stage] || (stage.startsWith("pl_") ? stage : "stand"), want = (S.fit || {}).pose;
  setAvatar({pose:want && want !== "auto" && unlockedPoses().some(p=>p[0] === want) ? want : autoPose, frac, level:Z.lvl, fit:fit(), label:"Ton personnage en 3D, niveau " + Z.lvl + ", " + Z.rank});
  lastZ = Z; $("fitOpen").classList.toggle("new", !!S.newFit);
  renderScene(Z); $("lvRank").textContent = Z.rank;
  { const [c, src] = penseeDuJour(0), pj = $("pJour"); pj.textContent = ""; pj.append(el("span","lab","Pensée du jour"), el("q",null,c), el("span","mut",src)); pj.onclick = () => { vpK = 0; showTab("voie"); vForce(); window.scrollTo(0, 0); }; }
  renderCycle(); renderRecords(); renderSommet(); renderVoie(); $("ecoute").hidden = !(S.ecoute && Date.now() - S.ecoute < 3 * 3600e3); $("lvNum").textContent = "Niveau " + Z.lvl;
  $("xpBar").style.width = (frac*100) + "%"; $("xpTxt").textContent = Z.xp + " / " + Z.hi + " points d’expérience";
  const seen = S.seen, nowB = Z.badges.filter(b=>b.ok).map(b=>b.id);
  if (seen){ const nbs = Z.badges.filter(b=>b.ok && !seen.b.includes(b.id)), up = Z.lvl > seen.lvl;
    // tout ce qui vient d’être gagné, d’un coup : badges, niveau, et les tenues qui vont avec
    const gifts = nbs.flatMap(b => badgeReward(b.id)).concat(up ? WARD.flatMap(w => w.items.filter(it => typeof it[2] === "number" && it[2] > seen.lvl && it[2] <= Z.lvl).map(it => it[1])) : []);
    const nbsT = nbs.filter(b => !(/^sec_/.test(b.id) && CHESTS[b.id.slice(4)]));   // l’étage terminé se fête une seule fois : au coffre, badge compris
    const parts = []; if (nbsT.length) parts.push((nbsT.length > 1 ? "Badges : " : "Badge : ") + nbsT.map(b => b.name).join(", ")); if (up) parts.push("Niveau " + Z.lvl + ", " + Z.rank);
    if (parts.length) { toast(parts.join(". ") + (gifts.length ? ". Nouveau au vestiaire : " + gifts.slice(0, 3).join(", ") + (gifts.length > 3 ? " et " + (gifts.length - 3) + " autres" : "") : "")); if (gifts.length) { S.newFit = true; } if (A3) A3.celebrate(); } }
  { const op = Object.keys(CHESTS).filter(sid=>SEC[sid] && chestOpen(SEC[sid])), had = S.chests;
    if (had) { const nw = op.find(sid=>!had.includes(sid)); if (nw) { S.newFit = true; S.chestQ = nw; } }
    const all = [...new Set((had || []).concat(op))]; if (!had || had.length !== all.length) { S.chests = all; save(); } }   // un coffre ouvert le reste
  // coffre gagné : la scène d’ouverture attend qu’aucune fenêtre ne soit ouverte (jamais au milieu d’une série)
  if (S.chestQ && !document.querySelector("dialog[open]")) { const q = S.chestQ; delete S.chestQ; save(); setTimeout(() => chestScene(q), 350); }
  if (!seen || seen.lvl !== Z.lvl || seen.b.length !== nowB.length) { S.seen = {lvl:Z.lvl, b:nowB}; save(); }

  const nextId = ids.find(id=>!reqDone(id) && !msLocked(MS[id])) || ids.find(id=>!reqDone(id));
  today: { // Aujourd’hui : la séance du jour d’un coup d’œil, et un seul bouton pour tout lancer
    const nc = $("nextCard"); nc.textContent = ""; pickP(); $("sessToggle").hidden = $("sess").hidden = false;
    const today = todayIdx(), day = pDay(today), vals = wkGet(today), all = allP();
    const tot = day.blocks.reduce((n,b)=>n + b.sets.length, 0), dn = Object.keys(vals).length;
    nc.append(el("div","lab", DAYN[today] + ", séance du jour"));
    if (!S.placed && Object.keys(MS).filter(id=>st(id).done).length < 6) { const pb = el("button","place");
      pb.append(el("b",null,"Commence par ton bilan"), el("span",null,"Quelques questions rapides sur ce que tu sais déjà faire : l’app compose ensuite ta séance."));
      pb.onclick = () => startPlacement(); nc.append(pb); $("sessToggle").hidden = $("sess").hidden = true;   // avant le bilan : rien d’autre à l’écran
      const sk = el("button","golink","Passer : je pars de zéro"); sk.onclick = () => { S.placed = true; save(); render(); }; nc.append(sk);
      break today; }
    // quel programme aujourd’hui : une pastille par programme, un seul toucher pour changer
    const chips = el("div","srcs"); Object.keys(all).sort((a,b)=>(progLock(a) ? 1 : 0) - (progLock(b) ? 1 : 0)).forEach(id=>{ const lock = progLock(id), c = el("button","src" + (P.id === id ? " on" : "") + (lock ? " lk" : ""));
      if (lock) c.append(icon("lock","lki")); c.append(all[id].name); c.setAttribute("aria-pressed", P.id === id); if (lock) c.setAttribute("aria-label", all[id].name + ", verrouillé");
      c.onclick = () => { if (lock) { toast("« " + all[id].name + " » s’ouvre après : " + lock); return; } pg().cur = id; save(); render(); }; chips.append(c); }); nc.append(chips);
    // météo du corps : comment tu te sens aujourd’hui ? (règle la séance d’équilibre)
    if (P.builtin && dn && dn < tot) { const md = MOODS.find(x => x[0] === moodToday()); delete S.moodEdit; nc.append(el("div","moodset", (S.mins || 30) + " min" + (md ? ", " + md[1] : "") + ", séance en cours")); }   /* séance commencée : on ne change plus la durée ni l’humeur */
    else if (P.builtin && moodToday() && !S.moodEdit) { const mk = moodToday(), md = MOODS.find(x => x[0] === mk), mb = el("button","moodset"); mb.textContent = nbsp((S.mins || 30) + " min, " + md[1] + ", changer"); mb.onclick = () => { S.moodEdit = 1; render(); }; nc.append(mb); }
    else if (P.builtin) { const mw = el("div","mood"), mk = moodToday(); mw.append(el("span",null,"Aujourd’hui, je suis…"));
      MOODS.forEach(([k, lab, ico]) => { const b = el("button", mk === k ? "on" : ""); b.append(el("b",null,lab)); b.setAttribute("aria-pressed", mk === k); b.onclick = () => { delete S.moodEdit; setMood(k); }; mw.append(b); });
      nc.append(mw);
      if (mk === "fatigue") { const z = el("button","zenhint"); z.append(el("b",null,"Aujourd’hui : récup active, 8 min"), el("span",null,"Mobilité, ou la séance allégée ci-dessous.")); z.onclick = () => openZen("recup"); nc.append(z); } }
    if (P.builtin && !(dn && dn < tot) && (!moodToday() || S.moodEdit)) { const tm = el("div","mins"); 
      [15,30,45,60].forEach(v=>{ const b = el("button", (S.mins || 30) === v ? "on" : "", v + " min"); b.setAttribute("aria-label", v + " minutes"); b.setAttribute("aria-pressed", (S.mins || 30) === v); b.onclick = () => { S.mins = v; if (S.bday && !dn) S.bday = null; save(); render(); }; tm.append(b); }); nc.append(tm); }
    if (P.builtin && needRest()) nc.append(el("div","painnote","Jour de récup : trois jours d’entraînement de suite. Mobilité et poignets aujourd’hui, la force revient demain."));
    if (P.builtin && deloadWeek() && !cycTest()) nc.append(el("div","painnote","Semaine légère : moins de séries et pas de tentative à fond. Les tendons récupèrent."));
    { const PS = painState(); if (PS.phase) nc.append(el("div","painnote", PS.phase === 1 ? (PS.zone === "poignet" ? "Poignets au repos encore " + PS.days + " j : pas d’appui sur les mains." : PS.zone === "epaule" || PS.zone === "coude" ? "Encore " + PS.days + " j sans travail à un bras, ni planche, ni montées." : "Séance allégée encore " + PS.days + " j.") : PS.phase === 2 ? "Reprise : 60 % de la charge, sans tentative à fond." : "Reprise : 80 % de la charge.")); }
    { const rep3 = (S.fb || []).filter(x=>x.k === "pain" && Date.now() - x.t < 10 * 864e5).length; if (rep3 >= 3) nc.append(el("div","painnote","Trois douleurs en dix jours : arrête-toi et demande l’avis d’un professionnel de santé avant de reprendre.")); }
    // Maîtrise : on choisit sa séance de postures tenues (poignets, compression, ligne, contrôle, récup)
    if (P.zen) { const zw = el("div","srcs zchips"); ZEN.forEach((z, i) => { const b = el("button","src" + (pp().step === i ? " on" : ""), z.name); b.setAttribute("aria-pressed", pp().step === i); b.onclick = () => { pp().step = i; save(); render(); }; zw.append(b); });
      const z = ZEN[pp().step] || ZEN[0]; nc.append(zw, el("div","zt2", z.when + ". " + zenTxt(z)));
      if (forceDays().has((() => { const x = new Date(); x.setDate(x.getDate() - 1); return dayKey(x); })()) && ["poignets","controle"].includes((ZEN[pp().step] || {}).id)) nc.append(el("p","zt2","Hier : force. Ligne ou Compression ménagent mieux les poignets aujourd’hui."));
    }

    if (!tot){ nc.append(el("h2",null,"Repos aujourd’hui"), el("p",null, P.builtin ? "Aucune figure accessible pour l’instant." : "Rien de prévu ce jour-là dans « " + P.name + " ». Choisis un autre programme ci-dessus, ou repose-toi.")); }
    else {
      let secs = 0; const list = el("div","tlist");
      day.blocks.forEach((b,bi)=>{ const r = el("div","trow"), art = el("span","art"), g = el("div","grow"), done = b.sets.filter((_,si)=>vals[bi + "-" + si] != null).length;
        if (b.ms && MS[b.ms]) { const sp = el("span","sp"); sp.dataset.pose = poseId(b.ms); sp.dataset.anim = b.ms; sp.dataset.lk = ""; sprPaint(sp, 64); art.append(sp); } else if (blockAnim(b)) art.append(drSp(b, 64)); else art.append(el("span","num", String(bi + 1)));
        const s0 = b.sets[0], work = b.sets.filter(s=>!s.max), mx = b.sets.filter(s=>s.max);
        const one = s => s.goal ? (b.kind === "hold" ? s.goal + " s" : "× " + s.goal) : fixed(s) ? fixTxt(b, s, day.scale) : s.pct ? s.pct + " %" : "max";
        const u = s => b.kind === "hold" ? one(s) : one(s).replace("× ", "") + " rép.", ess = n => n + (n > 1 ? " essais" : " essai");
        const dose = mx.length && !work.length ? ess(mx.length) + " calmes" : mx.length ? work.length + " × " + u(work[0]) + " + " + ess(mx.length) + " à " + u(mx[0]) : b.sets.length > 1 ? (s0.lab ? b.sets.length + " " + s0.lab + (b.sets.length > 1 ? "s" : "") : b.sets.length + " × " + (fixed(s0) ? fixTxt(b, s0, day.scale) : u(s0))) : fixed(s0) ? fixTxt(b, s0, day.scale) : u(s0);
        g.append(el("div","tn2", b.name), el("div","td", dose + (b.ms && !b.confirm && canValToday(b.ms) ? ", validation possible aujourd’hui" : "")));
        const dots = el("div","dots"); if (dn) b.sets.forEach((s,si)=>{ const v = vals[bi + "-" + si]; dots.append(el("i", (v != null ? (b.kind === "hold" && s.goal && v < s.goal * 0.95 ? "half" : "ok") : "") + (s.max ? " t" : ""))); }); g.append(dots);
        b.sets.forEach(s=>{ secs += (s.rest || 20) + (s.goal && b.kind === "hold" ? s.goal : s.dur ? sDur(s, day.scale) * (s.sides ? 2 : 1) : 25); });
        r.append(art, g); if (done >= b.sets.length) r.classList.add("ok"); list.append(r); });
      nc.append(list);
      // gilet lesté : s’il n’est pas là aujourd’hui, un toucher et les exercices lestés passent en version lente sans charge
      if ((S.equip || {}).kg && (noVest() || day.blocks.some(b => b.dk && DRILLS[b.dk].eq === "kg"))) { const v = el("button","vest" + (noVest() ? " off" : "")); v.setAttribute("aria-pressed", noVest());
        v.append(el("b",null, noVest() ? "Sans gilet aujourd’hui" : "Gilet lesté prévu"), el("span",null, noVest() ? "Dips et pompes en version lente. Touche si tu l’as finalement." : "Pas de gilet sous la main ? Touche pour la version sans charge."));
        v.onclick = () => setNoVest(!noVest()); nc.append(v); }
      const bt = el("button","btn big" + (dn >= tot ? " done" : ""), dn >= tot ? "Séance faite. Voir mon parcours" : dn ? "Reprendre (" + dn + " / " + tot + ")" : "Démarrer" + " (" + Math.max(5, Math.round(estSecs(day.blocks) / 60)) + " min)"); 
      bt.onclick = () => { if (dn >= tot) { showTab("path"); return; } startGuided(); const it = (S.cyc || {}).intent; if (it && !dn) setTimeout(() => toast("Ton intention : " + it), 600); }; nc.append(bt);
      if (dn >= tot && P.builtin) { const z = el("button","zenhint"); z.append(el("b",null,"Récup active, 8 min"), el("span",null,"Mobilité après l’effort.")); z.onclick = () => openZen("recup"); nc.append(z); }
      if (dn >= tot) nc.append(el("div","tmeta", daySummary()));
      // effacer le dernier enregistrement du jour (une erreur de saisie, une série notée deux fois)
      { const u = undoList().pop(); if (u) { const ub = el("button","lnk undo", "Effacer le dernier enregistrement : " + u.label); ub.onclick = () => { if (!confirm("Effacer « " + u.label + " » ?")) return; const r = undoLast(); if (r) { render(); toast("Effacé : " + r.label); } }; nc.append(ub); }
        if (ukGet("day") && dn) { const ud = el("button","lnk undo", "Annuler l’entraînement du jour"); ud.onclick = () => { if (!confirm("Effacer tout ce qui a été enregistré aujourd’hui (séries, records, validations) ?")) return; if (undoDay()) { render(); toast("Entraînement du jour annulé."); } }; nc.append(ud); } }
    }
    // la semaine en un coup d’œil : un point par jour, plein si tu t’es entraîné
    const wk = el("div","twk"), d0 = new Date(); d0.setDate(d0.getDate() - today);
    DAYL.forEach((l,i)=>{ const dd = new Date(d0); dd.setDate(d0.getDate() + i); const did = S.log.some(x=>dayKey(x.t) === dayKey(dd)); const c = el("span", (did ? "did" : "") + (i === today ? " today" : "")); c.append(el("i"), el("b",null,l)); if (did) { c.setAttribute("role","button"); c.setAttribute("aria-label", DAYN[i] + " : voir ce que tu as fait"); c.onclick = () => { histN = 30; openHist(dayKey(dd)); }; } wk.append(c); });
    nc.append(wk);
    { const g = nextGift(); if (g) { const b = el("button","gift"); b.innerHTML = g.icon; { const tx = el("span","gtx"); tx.append(el("span",null,"Prochain cadeau : "), el("b",null, g.name), " ", el("span","mut","(" + (g.wk <= 1 ? "cette semaine" : "dans ≈ " + gainTxt(g.wk)) + ")")); b.append(tx); } b.onclick = () => { $("fitOpen").click(); }; nc.append(b); } }
  }

  { const pt = $("pathTop"), gms = GOALS[0].ms, dn = doneIn(gms); pt.textContent = "";
    const c = el("div","ptop"), fins = el("div","fins"); ["oa_oahs","pl_full"].forEach(id=>{ const w = el("span","fin"), sp = el("span","sp"); sp.dataset.pose = poseId(id); sp.dataset.anim = id; sp.dataset.lk = ""; sprPaint(sp, 60); w.append(sp); fins.append(w); });
    const g = el("div","grow"); g.append(el("div","pt2", dn + " / " + gms.length + " figures"));
    const bar = el("div","bar"), bi = el("i"); bi.style.width = (dn / gms.length * 100) + "%"; bar.append(bi); const nxt = gms.find(id=>!reqDone(id) && !msLocked(MS[id])) || gms.find(id=>!reqDone(id)); g.append(bar, el("div","pn2", nxt ? "Prochaine étape : " + MS[nxt].name + (MS[nxt].target ? ", " + unitTxt(MS[nxt], nextStep(MS[nxt]) || MS[nxt].target) : "") : "Combo ultime : tout est validé."));
    { const P = plan(), gw = P.fin.ul_full; if (gw) { const eb = el("button","etab"); eb.append(el("span",null,"Combo ultime : "), el("b",null, dateTxt(gw)), el("span",null,", "), el("span","etm","mes dates")); eb.onclick = () => { openEta(); $("etaDlg").showModal(); }; g.append(eb); } }
    c.append(fins, g);
    if (nextId) { const here = el("button","here"); here.setAttribute("aria-label","Aller à ma position : " + MS[nextId].name);
      here.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>'; here.onclick = () => goHere(nextId); c.append(here); }
    pt.append(c);
  }
  const tree = $("tree"), keepY = window.scrollY; tree.textContent = "";
  tree.append(journey(nextId));
  if (keepY) window.scrollTo(0, keepY);

  $("countdown").value = String(Math.max(3, S.countdown || 0)); $("theme").value = S.theme || "light";
  renderQuest(Z, nextId);
  renderSess();
}
function logRow(l, withName){
  const m = MS[l.id] || (String(l.id).startsWith("pg:") ? {name:l.id.slice(3), type:l.k} : null); const r = el("div","log"); if (!m) { r.style.display = "none"; return r; }
  const when = new Date(l.t).toLocaleDateString("fr-FR",{day:"numeric",month:"short"}) + ", " + new Date(l.t).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
  const left = el("span","grow"); if (withName) left.append(el("div",null,m.name)); left.append(el("div","mut",when + (l.pr ? ", record" : "")));
  r.append(left, el("span","v" + (l.pr ? " pr" : ""), l.v === true ? (String(l.id).startsWith("pg:") ? "Séance terminée" : "Validé") : fmt(m,l.v)));
  return r;
}

// ce que la séance du jour a apporté, en une ligne qui reste sur la carte
function daySummary(){ const d = dayKey(Date.now()), H = S.hit || {}, tl = S.log.filter(l => dayKey(l.t) === d);
  const val = Object.keys(H).find(id => MS[id] && st(id).done && (H[id].days || []).slice(-1)[0] === d);
  if (val) return "« " + MS[val].name + " » validée, " + doneIn(GOALS[0].ms) + "/" + GOALS[0].ms.length;
  const part = Object.keys(H).find(id => MS[id] && !st(id).done && (H[id].days || []).slice(-1)[0] === d);
  if (part) return MS[part].name + " : séance validée " + H[part].days.length + "/" + valRule(part).n;
  const pr = tl.filter(l => l.pr).pop(); if (pr) return "Record : " + num(pr.v) + (pr.k === "hold" ? " s" : " rép.") + ", " + pr.id.replace(/^pg:/, "");
  const hold = Math.round(tl.filter(l => l.k === "hold" && typeof l.v === "number").reduce((n, l) => n + l.v, 0));
  return tl.filter(l => typeof l.v === "number").length + " séries" + (hold ? ", " + (hold >= 60 ? Math.floor(hold / 60) + " min " + (hold % 60) + " s" : hold + " s") + " en appui" : "") + ", séance n° " + (cnt().sess || 1); }
// la figure peut-elle être validée dès aujourd’hui ? (dernière séance manquante, écart et étendue respectés)
function canValToday(id){ const h = (S.hit || {})[id], V = valRule(id), d = dayKey(Date.now()); if (!h || !h.days || h.days.length !== V.n - 1 || st(id).done || h.days.includes(d)) return false;
  return dayDiff(d, h.days[h.days.length - 1]) >= V.gap && dayDiff(d, h.days[0]) >= V.span; }
// ---------- Fiche jalon + chrono ----------
let cur = null, timer = null, phase = "idle", t0 = 0, beeped = false, ac = null, wake = null;
function beep(freq, ms){
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended" || ac.state === "interrupted") ac.resume().catch(()=>{});
    const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = freq; o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(0.25, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + ms/1000);
    o.start(); o.stop(ac.currentTime + ms/1000);
  } catch(e){}
  if (navigator.vibrate) navigator.vibrate(ms);
}
function openMs(id){
  cur = id; const m = MS[id];
  $("dT").textContent = m.name + (m.target ? ", " + goalTxt(m) : "");
  $("dS").textContent = [SEC[m.sec].name, m.sub].filter(Boolean).join(", ");
  $("dEn").textContent = m.en && m.en !== m.name ? "Nom d’origine : " + m.en : "";
  $("dDesc").textContent = m.desc || "";
  const fg = $("dFig"); fg.textContent = "";
  { const pz = poseId(id);
    if (SPR[id]) { const sp = el("span","sp demo"); sp.dataset.pose = pz; sp.dataset.anim = id; sp.dataset.lk = ""; sprPaint(sp, 132); fg.append(sp); }
    else if (pz !== "stand") { const im = el("img","demo"); im.alt = ""; im.width = im.height = 132; im.src = "anim/" + (animOn() && STILLS.has(pz) ? "demo_" : "still_") + stillOf(pz) + ".webp"; im.onerror = () => { im.remove(); const f2 = figure(id); if (f2) fg.append(f2); }; fg.append(im); }
    else { const f2 = figure(id); if (f2) fg.append(f2); } }
  const dd = $("dMore"); dd.textContent = ""; const D = DETAILS[id];
  if (D){
    const part = (title, items, ordered) => { if (!items || !items.length) return;
      dd.append(el("h3",null,title)); const list = el(ordered ? "ol" : "ul"); items.forEach(t=>list.append(el("li",null,t))); dd.append(list); };
    part("Comment faire", D.how, true);
    part("Repères", D.cue);
    part("Erreur fréquente", D.err ? [D.err] : null);
    part("Validé quand", D.ok ? [D.ok] : null);
  }
  const dv = $("dVid"); dv.textContent = "";
  (m.img||[]).forEach(src=>{ const im = el("img","ph"); im.src = src; im.alt = "Exemple : " + m.name; im.loading = "lazy"; dv.append(im); });
  (m.yt||[]).forEach(([vid,title])=>{
    const a = el("a","yt"); a.href = "https://www.youtube.com/watch?v=" + vid; a.target = "_blank"; a.rel = "noopener";
    const im = el("img"); im.src = "https://i.ytimg.com/vi/" + vid + "/mqdefault.jpg"; im.alt = ""; im.loading = "lazy"; im.onerror = () => im.remove();
    const tx = el("span","grow"); tx.append(el("div","t",title), el("div","mut","Voir sur YouTube"));
    a.append(im, tx); dv.append(a);
  });
  $("dHold").style.display = m.type === "hold" ? "" : "none";
  $("dReps").style.display = m.type === "reps" ? "" : "none";
  $("reps").value = String(st(id).best > 0 ? st(id).best : m.target || 1);   // un compteur déjà réglé : on ajuste avec − et +, pas besoin du clavier
  resetClock(); fillDlg(); $("dlg").showModal(); $("dlg").scrollTop = 0;
}
function fillDlg(){
  const m = MS[cur], x = st(cur), lk = !x.done && msLocked(m);
  $("toggle").textContent = x.done ? "Retirer la validation" : "Réussi aujourd’hui"; $("toggle").hidden = !x.done && m.type !== "check";   // tenues et répétitions : seule la mesure valide
  $("toggle").className = "btn" + (!x.done && m.type === "check" ? "" : " line");
  const parts = [];
  if (m.type !== "check") parts.push(x.best ? "Record : " + fmt(m,x.best) : "Aucun essai enregistré");
  { const L = lvls(m), k = lvlOf(m), nx = nextStep(m); if (L.length > 1) parts.push("Niveau " + k + " sur " + L.length + (nx ? ", niveau suivant : " + unitTxt(m, nx) : "")); }
  if (x.done) parts.push("Jalon validé");
  if (lk) parts.push("Recommandé après : " + missing(m));
  $("dBest").textContent = parts.join(". ") + ".";
  { const dp = $("dPlan"), L = lvls(m), k = lvlOf(m), pl = planFor(m); dp.textContent = "";
    if (L.length > 1){ dp.append(el("h3",null,"Les niveaux")); const ld = el("div","ladder");
      L.forEach((v,i)=>{ const r = el("div","lv" + (i < k ? " ok" : i === k ? " now" : "")); r.append(el("span","b", i < k ? "" : String(i+1)), el("span","grow","Niveau " + (i+1) + (i === L.length - 1 ? ", jalon validé" : "")), el("span","v", unitTxt(m, v))); if (i < k) r.firstChild.innerHTML = ICON.check; ld.append(r); });
      dp.append(ld); }
    dp.append(el("h3",null,pl.head)); const ul = el("ul","plan"); pl.lines.forEach(t=>ul.append(el("li",null,t))); dp.append(ul);
    if (pl.prog) { const pb = el("button","btn line","Programme associé : " + PS[pl.prog[0]].name + (PS[pl.prog[0]].steps[pl.prog[1]] && pl.prog[0] === "planche-domination" ? ", " + PS[pl.prog[0]].steps[pl.prog[1]].name : "")); pb.onclick = () => { $("dlg").close(); openProg(pl.prog[0], pl.prog[0] === "planche-domination" ? pl.prog[1] : null); }; dp.append(pb); }
  }
  const dl = $("dLog"); dl.textContent = "";
  S.log.filter(l=>l.id===cur).slice(-5).reverse().forEach(l=>dl.append(logRow(l,false)));
}
function record(v){
  const m = MS[cur], x = st(cur), lv0 = lvlOf(m); let pr = false;
  if (v === true && msLocked(m)) { toast("Valide d’abord : " + missing(m) + "."); return; }
  pushUndo(m.name + ", " + (v === true ? "réussi" : num(v) + (m.type === "hold" ? " s" : " rép."))); base0(cur);
  if (v === true) chkHit(cur);
  else { if (v > x.best) { pr = x.best > 0; x.best = v; } if (v >= m.target && !x.done && SIDED.has(cur)) toast("Cible tenue. Cette figure se valide des deux côtés : fais-la dans la séance du jour, côtés alternés."); else if (v >= m.target && !x.done) { const msg = hitTarget(cur); toast(msg || "« " + m.name + " » validée."); } if (m.type === "hold") cnt().hold += v; }
  stamp(cur); S.log.push({t:Date.now(), id:cur, v, pr}); if (S.log.length > 2000) S.log = S.log.slice(-2000);
  save(); fillDlg(); render();
  const lv1 = lvlOf(m); if (lv1 > lv0 && lv1 < lvls(m).length) toast(m.name + ", niveau " + lv1 + " atteint.");
  const nd = document.querySelector('.jn[data-id="' + cur + '"]'); if (nd && lv1 > lv0) nd.classList.add("pop");
}
function resetClock(){
  clearInterval(timer); phase = "idle"; beeped = false;
  $("clock").textContent = "0,0"; $("clock").className = "clock";
  $("go").textContent = "Démarrer"; $("clockHint").textContent = cur && MS[cur].target ? "Objectif : " + goalTxt(MS[cur]) : "";
  if (wake) { wake.release().catch(()=>{}); wake = null; }
}
$("go").onclick = async () => {
  const m = MS[cur], ck = $("clock");
  if (phase === "idle"){
    keepAwake(w => wake = w);
    const left = cdSec(); let lastShown = -1;
    const startRun = () => { phase = "run"; t0 = performance.now(); ck.className = "clock"; $("go").textContent = "Arrêter"; $("clockHint").textContent = "Appuie sur Arrêter en redescendant"; beep(880, 350); };
    if (left > 0) { phase = "count"; ck.className = "clock count"; $("go").textContent = "Annuler"; $("clockHint").textContent = "Mets-toi en place"; t0 = performance.now(); } else startRun();
    timer = setInterval(()=>{
      const e = (performance.now() - t0) / 1000;
      if (phase === "count"){
        const r = Math.ceil(left - e);
        if (r <= 0) startRun();
        else { ck.textContent = String(r); if (r !== lastShown) { lastShown = r; if (r <= 3) beep(440, 120); } }
      } else if (phase === "run"){
        ck.textContent = e.toFixed(1).replace(".", ",");
        if (!beeped && e >= m.target) { beeped = true; ck.className = "clock hit"; beep(1320, 600); }
      }
    }, 50);
  } else if (phase === "count"){ resetClock(); }
  else if (phase === "run"){
    const v = Math.floor((performance.now() - t0) / 100) / 10;
    clearInterval(timer); phase = "idle"; $("go").textContent = "Nouvel essai";
    if (wake) { wake.release().catch(()=>{}); wake = null; }
    $("clockHint").textContent = v >= m.target ? "Objectif atteint" : "Il manque " + num(m.target - v) + " s";
    if (v >= 0.5) record(v);
  }
};
$("repsM").onclick = () => { $("reps").value = String(Math.max(1, (parseInt($("reps").value, 10) || 1) - 1)); };
$("repsP").onclick = () => { $("reps").value = String((parseInt($("reps").value, 10) || 0) + 1); };
$("saveReps").onclick = () => { const v = parseInt($("reps").value, 10); if (!(v > 0)) { toast("Entre un nombre de répétitions."); return; } if (!saneReps(v, MS[cur] && MS[cur].target)) return; record(v); };
$("toggle").onclick = () => { const x = st(cur); if (x.done) { if (!confirm("Retirer la validation de « " + MS[cur].name + " » ?")) return; x.done = false; if (S.hit && S.hit[cur]) S.hit[cur].days = (S.hit[cur].days || []).slice(0, -1); if (S.chk) delete S.chk[cur]; save(); fillDlg(); render(); } else record(true); };
$("dlg").addEventListener("close", resetClock);

// ---------- Historique : chaque jour d’entraînement, ce qui a été fait, dans l’ordre ----------
let histN = 30;
function histName(id){ if (MS[id]) return MS[id].name; return String(id).replace(/^pg:/, ""); }
function histVal(l){ const m = MS[l.id], k = m ? m.type : l.k; if (l.k === "try") return l.v ? "réussi" : "pas encore"; if (l.v === true || k === "check") return l.v === 0 ? "pas encore" : "réussi"; if (l.k === "fix") return l.v >= 60 ? Math.round(l.v / 60) + " min" : l.v + " s"; if (typeof l.v !== "number") return "";
  return k === "hold" ? num(l.v) + " s" : l.v + " rép."; }
// ---------- Modifier l’historique : effacer une journée, un exercice ou une série, corriger une valeur ----------
// tout ce qui en découle suit : records, compteurs, séances validées, validation d’une figure
const histFig = id => MS[id] ? id : (Object.values(MS).find(m => "pg:" + m.name === id) || {}).id || null;
function histApply(drop, change){   // drop : entrées à effacer ; change : [entrée, nouvelle valeur]
  pushUndo("Modification de l’historique"); const days = new Set(), figs = new Set(), names = new Set(), c = cnt(), top = {}, hadDays = {};
  // temps en appui cumulé : seules les tenues de figures y entrent (depuis la fiche ou en séance)
  const holdOf = l => typeof l.v === "number" && ((MS[l.id] && MS[l.id].type === "hold") || (l.k === "hold" && !!histFig(l.id)));
  // le record d’une figure venait-il d’une entrée touchée ? (sinon il vient d’ailleurs, du bilan par exemple, et on n’y touche pas)
  drop.concat(change.map(x => x[0])).forEach(l => { const f = histFig(l.id); if (f && typeof l.v === "number" && l.v >= st(f).best - 1e-9) top[f] = true; });
  Object.keys(S.hit || {}).forEach(id => { hadDays[id] = ((S.hit[id] || {}).days || []).slice(); });
  const rmSet = ref => { const [k, bs] = String(ref).split("#"), o = pg().wk[k]; if (o && bs in o) { delete o[bs]; c.sets = Math.max(0, c.sets - 1); if (!Object.keys(o).length) delete pg().wk[k]; } };
  drop.forEach(l => { days.add(dayKey(l.t)); const f = histFig(l.id); if (f) figs.add(f); if (String(l.id).startsWith("pg:")) names.add(l.id.slice(3));
    const end = l.k === "check" && String(l.id).startsWith("pg:") && !histFig(l.id);
    if (end) c.sess = Math.max(0, c.sess - 1); else if (l.s) rmSet(l.s);   // la série exacte est libérée dans la séance du jour
    if (holdOf(l)) c.hold = Math.max(0, c.hold - l.v); });
  change.forEach(([l, v]) => { days.add(dayKey(l.t)); const f = histFig(l.id); if (f) figs.add(f); if (String(l.id).startsWith("pg:")) names.add(l.id.slice(3));
    if (holdOf(l)) c.hold = Math.max(0, c.hold + v - l.v);
    if (l.s) { const [k, bs] = l.s.split("#"); if (pg().wk[k] && bs in pg().wk[k]) pg().wk[k][bs] = v; } l.v = v; });
  c.hold = Math.round(c.hold * 10) / 10;
  S.log = S.log.filter(l => !drop.includes(l));
  // journée vidée : ce qui reste rangé pour ce jour (séries d’avant l’historique complet) s’efface aussi, compteur compris
  days.forEach(d => { if (S.log.some(x => dayKey(x.t) === d)) return; const dd = dk(d), di = (dd.getDay() + 6) % 7, ws = new Date(dd); ws.setDate(dd.getDate() - di); const pre = dayKey(ws) + "|", suf = "|" + DAYK[di];
    Object.keys(pg().wk).forEach(k => { if (k.startsWith(pre) && k.endsWith(suf)) { c.sets = Math.max(0, c.sets - Object.keys(pg().wk[k]).length); delete pg().wk[k]; } }); });
  names.forEach(n => { const v = S.log.filter(l => l.id === "pg:" + n && typeof l.v === "number").map(l => l.v); if (v.length) pg().best[n] = Math.max(...v); else delete pg().best[n]; });
  let lost = [];
  figs.forEach(id => { const m = MS[id], x = st(id), vals = S.log.filter(l => (l.id === id || l.id === "pg:" + m.name) && typeof l.v === "number").map(l => l.v), mx = vals.length ? Math.max(...vals) : 0;
    x.best = top[id] ? Math.max(mx, x.b0 || 0) : Math.max(x.best, mx);   // un record effacé redescend, jamais sous celui du bilan
    const h = (S.hit || {})[id]; if (h && h.days) days.forEach(d => { const okDay = S.log.some(l => dayKey(l.t) === d && (l.id === id || l.id === "pg:" + m.name) && (l.v === true || (typeof l.v === "number" && m.target && l.v >= m.target)));
      if (!okDay) { h.days = h.days.filter(x => x !== d); if (h.d === d) h.n = 0; } });
    if ((S.chk || {})[id] && days.has(S.chk[id].d)) delete S.chk[id];
    // validée grâce à une journée effacée (n’importe laquelle de celles qui comptaient) : elle ne l’est plus
    const lostDay = h && (hadDays[id] || []).some(d => !h.days.includes(d));
    if (x.done && lostDay && h.days.length < valRule(id).n) { x.done = false; delete x.dt; lost.push(m.name); } });
  lastZ = null; save(); render(); openHist(histEdit); if (lost.length) toast("Plus validée : " + lost.join(", ") + ".");
}
let histEdit = null;
function openHist(focus){ const box = $("histBody"); box.textContent = ""; if (focus) histEdit = histEdit === focus ? focus : histEdit;
  const days = new Map(); S.log.forEach(l => { const k = dayKey(l.t); if (!days.has(k)) days.set(k, []); days.get(k).push(l); });
  const keys = [...days.keys()].reverse();
  if (!keys.length) { box.append(el("p","mut","Rien encore : tes séances apparaîtront ici, jour par jour.")); return; }
  keys.slice(0, histN).forEach(k => { const L = days.get(k), d = new Date(L[0].t), wrap = el("div","hday"); wrap.dataset.day = k;
    const end = L.filter(l => l.k === "check" && l.v === true && String(l.id).startsWith("pg:") && !MS[l.id]);
    const work = L.filter(l => !end.includes(l)), groups = [];
    work.forEach(l => { const g = groups[groups.length - 1]; if (g && g.id === l.id) g.ls.push(l); else groups.push({id:l.id, ls:[l]}); });
    const mins = Math.round((L[L.length - 1].t - L[0].t) / 60000);
    wrap.append(el("div","hd hdr", DAYN[(d.getDay() + 6) % 7] + " " + d.getDate() + " " + MOIS[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? " " + d.getFullYear() : "")),
      el("div","mut hs", groups.length + (groups.length > 1 ? " exercices" : " exercice") + ", " + work.length + (work.length > 1 ? " séries" : " série") + (mins >= 5 ? ", " + mins + " min" : "") + (end.length ? ", séance terminée" : "")));
    const ed = histEdit === k, eb = el("button","lnk hedit", ed ? "Terminé" : "Modifier"); eb.onclick = () => { histEdit = ed ? null : k; openHist(); }; wrap.firstChild.append(eb);
    if (ed) wrap.append(el("div","mut hs","Touche une série pour la corriger ou l’effacer, la corbeille efface tout l’exercice."));
    groups.forEach(g => { const r = el("div","hrow"), pr = g.ls.some(l => l.pr);
      if (!ed) { r.append(el("span","hn", histName(g.id)), el("span","hv", g.ls.map(histVal).filter(Boolean).join(", ") + (pr ? ", record" : ""))); if (pr) r.classList.add("pr"); wrap.append(r); return; }
      // mode modification : chaque série est un bouton (corriger ou effacer), et l’exercice entier s’efface
      r.classList.add("ed"); const vs = el("div","hvs");
      g.ls.forEach(l => { const b = el("button","hvb", histVal(l) || "—"); b.onclick = () => { const num0 = typeof l.v === "number";
          const a = prompt(num0 ? "Nouvelle valeur pour « " + histName(g.id) + " » (laisse vide pour effacer cette série) :" : "Effacer cette entrée ? (OK pour effacer)", num0 ? String(l.v).replace(".", ",") : "");
          if (a === null) return; const v = parseFloat(String(a).replace(",", "."));
          if (String(a).trim() === "" || !num0) histApply([l], []); else if (v > 0 && v < 10000) histApply([], [[l, Math.round(v * 10) / 10]]); else toast("Valeur non reconnue."); };
        vs.append(b); });
      const del = el("button","hdel"); del.setAttribute("aria-label", "Effacer « " + histName(g.id) + " » de cette journée"); del.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>';
      del.onclick = () => { if (confirm("Effacer « " + histName(g.id) + " » de cette journée ?")) histApply(g.ls, []); };
      r.append(el("span","hn", histName(g.id)), del); wrap.append(r, vs); });
    if (ed) { const dd = el("button","btn line hdday", "Supprimer toute cette journée"); dd.onclick = () => { if (confirm("Supprimer tout ce qui a été enregistré ce jour-là ? Les records, badges et validations qui en venaient seront recalculés.")) { histEdit = null; histApply(L, []); } }; wrap.append(dd); }
    box.append(wrap); });
  if (keys.length > histN) { const more = el("button","golink","Plus ancien"); more.onclick = () => { histN += 30; openHist(); }; box.append(more); }
  if (!$("histDlg").open) $("histDlg").showModal();
  if (focus) { const t = box.querySelector('[data-day="' + focus + '"]'); if (t) { t.classList.add("on"); t.scrollIntoView({block:"start"}); } } }
$("histOpen").onclick = () => { histN = 30; openHist(); };
$("histX").onclick = () => $("histDlg").close(); $("histDlg").addEventListener("click", e => { if (e.target === $("histDlg")) $("histDlg").close(); });

// le prochain élément du vestiaire qui tombera, d’après les dates estimées (figures et paliers)
function nextGift(){ let P; try { P = plan(); } catch(e){ return null; } const Z = lastZ || stats(), F = fit(); let best = null;
  WARD.forEach(w => w.items.forEach(([id, name, need]) => { if (typeof need !== "string" || wardOk(need, Z)) return; let wk = null;
    if (need.startsWith("m:")) wk = P.fin[need.slice(2)]; else if (need.startsWith("l:")) { const [, f, k] = need.split(":"), m = MS[f]; if (m && P.fin[f] != null) { const L = lvls(m).length, s0 = P.start[f] || 0; wk = s0 + (P.fin[f] - s0) * (+k) / Math.max(1, L); } }
    else if (need.startsWith("c:")) { const sec = SEC[need.slice(2)]; if (sec) wk = Math.max(0, ...sec.ms.filter(m => !m.alt).map(m => P.fin[m.id] || 0)); }
    if (wk != null && (!best || wk < best.wk)) best = {wk, name, icon:wIcon(w.slot, id, F)}; })); return best; }

// ---------- Scène du coffre : il tremble, s’ouvre, la tenue sort, et on l’enfile d’un toucher ----------
function chestScene(sid, locked){ const C = CHESTS[sid]; if (!C) return; const [slot, id, name] = C, F = fit(), sc = $("chestScene");
  sc.className = "cscene"; sc.innerHTML = '<div class="rays"></div><div class="gift">' + wIcon(slot, id, F) + '</div>' +
    '<svg class="box" viewBox="0 0 150 120" aria-hidden="true"><rect x="12" y="52" width="126" height="62" rx="8" fill="#8a5a2b"/><rect x="12" y="52" width="126" height="12" fill="#6e4520"/><rect x="66" y="60" width="18" height="22" rx="3" fill="#c9a227"/>' +
    '<path d="M12 52h126v34H12z" fill="none"/><g class="lid"><path d="M10 52c0-26 18-38 65-38s65 12 65 38z" fill="#9c6a35"/><rect x="10" y="44" width="130" height="10" rx="3" fill="#c9a227"/></g></svg>';
  $("chestSec").textContent = "Coffre, " + (SEC[sid] ? SEC[sid].name : ""); $("chestName").textContent = name;
  const worn = fit()[slot] === id, w = $("chestWear");
  if (locked) { const cm = SEC[sid] ? SEC[sid].ms.filter(m => !m.alt) : [], left = cm.filter(m => !reqDone(m.id)); $("chestTxt").textContent = left.length ? "Encore " + left.length + (left.length > 1 ? " figures" : " figure") + " de l’étage : " + left.slice(0, 3).map(m => m.name).join(", ") + (left.length > 3 ? "…" : "") + "." : ""; w.textContent = "Essayer dans le vestiaire"; w.onclick = () => { $("chestDlg").close(); renderFit({f:Object.assign(fit(), {[slot]:id}), lab:"Aperçu : " + name + ", coffre « " + SEC[sid].name + " »"}); $("fitDlg").showModal(); }; }
  else { $("chestTxt").textContent = (SEC[sid] ? "Étage terminé : badge « " + SEC[sid].name + " » gagné. " : "") + (worn ? "Tu la portes déjà." : "Nouveau dans ton vestiaire."); w.textContent = worn ? "Fermer" : "Enfiler"; w.onclick = () => { if (!worn) { S.fit = Object.assign(fit(), {[slot]:id}); delete S.newFit; save(); if (A3 && a3want) { a3want.fit = fit(); A3.set(a3want); A3.celebrate(); } clearTimeout(sprT); sprT = setTimeout(buildSprites, 900); toast(name + " : porté."); render(); } $("chestDlg").close(); }; }
  if (!$("chestDlg").open) { $("chestDlg").showModal(); w.focus({preventScroll:true}); w.blur(); }
  if (locked) { sc.classList.add("go"); sc.querySelector(".lid").style.animation = "none"; sc.querySelector(".rays").style.display = "none"; sc.querySelector(".gift").style.cssText = "opacity:.35;transform:none;filter:grayscale(1)"; return; }   // verrouillé : il tremble, sans s’ouvrir
  requestAnimationFrame(() => sc.classList.add("go")); setTimeout(() => { if (typeof beep === "function") { beep(660, 120); setTimeout(() => beep(990, 260), 140); } }, 1000); }
$("chestX").onclick = () => $("chestDlg").close(); $("chestDlg").addEventListener("click", e => { if (e.target === $("chestDlg")) $("chestDlg").close(); });
