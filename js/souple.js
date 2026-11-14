// ---------- Souplesse : une couche d’accompagnement, mesurée ----------
// Sept repères d’amplitude, notés par paliers (pas de règle à sortir : on choisit la phrase qui décrit la position).
// Ils ne prennent jamais la place d’une figure : 5 min actives en fin de séance, et les jours de récup deviennent « Souplesse douce ».
const ROM = [
  {id:"pike", name:"Pliage en pike", yoga:"Paścimottānāsana", how:"Assis jambes serrées et tendues, genoux verrouillés, dos long : penche-toi depuis les hanches.",
    lv:["Mains aux tibias","Mains aux chevilles","Paumes à plat à côté des pieds","Avant-bras au sol","Poitrine sur les cuisses"], act:"pikeAct", pas:["pliage"], an:"z_pliage", for:["press","manna"]},
  {id:"pancake", name:"Écart penché", yoga:"Upaviṣṭha Koṇāsana", how:"Assis jambes écartées au plus large, genoux vers le plafond, dos plat : penche-toi vers l’avant.",
    lv:["Mains devant les genoux","Mains à 30 cm devant le bassin","Avant-bras au sol","Coudes au sol, loin devant","Poitrine au sol"], act:"ecartAct", pas:["pancake"], an:"z_pancake", for:["press","planche","onearm"]},
  {id:"middle", name:"Grand écart facial", yoga:"Samakoṇāsana", how:"Jambes écartées de face, pointes vers le plafond, un bloc ou un coussin sous le bassin : descends sans forcer.",
    lv:["Bassin à plus de 30 cm du sol","Bassin à 30 cm","Bassin à 15 cm","Presque au sol","Au sol"], act:"cavalier", pas:["ecartF"], an:"z_midsplit", split:true, for:["press","planche"]},
  {id:"front", name:"Grand écart antéro-postérieur", yoga:"Hanumanāsana", how:"Bassin de face, genou arrière posé, un bloc sous la cuisse avant : descends des deux côtés.", sides:true,
    lv:["Bassin à plus de 30 cm du sol","Bassin à 30 cm","Bassin à 15 cm","Presque au sol","Au sol"], act:"jambesMur", pas:["demiEcart","fente","ecartAP"], an:"z_frontsplit", split:true, for:[]},
  {id:"epaules", name:"Épaules au-dessus de la tête", yoga:"Uttāna Śiśosana", how:"Allongé sur le dos, genoux pliés, bas du dos et côtes plaqués : monte les bras tendus au-dessus de la tête.",
    lv:["Poignets à 20 cm du sol","Poignets à 10 cm","Poignets au sol, côtes basses"], act:"epAct", pas:["epaules"], an:"z_murEp", for:["onearm","b1","b2","inter","ultime"]},
  {id:"pont", name:"Pont", yoga:"Ūrdhva Dhanurāsana", how:"Pont sur les mains, bras tendus, épaules au-dessus des poignets : rapproche les mains des talons.",
    lv:["Pont bras pliés","Pont bras tendus","Mains à 40 cm des talons","Mains à 20 cm","Mains aux talons"], act:"epAct", pas:["pont"], an:"z_bridge", back:true, hands:true, sh:true, for:["ultime"]},
  {id:"ext", name:"Épaules en extension", yoga:"Pūrvottānāsana", how:"Debout, mains jointes dans le dos, bras tendus : penche-toi en avant et laisse les mains monter vers le plafond.",
    lv:["Mains au bas du dos","Bras à 45°","Bras à l’horizontale","Bras au-dessus de la tête"], act:"extEp", pas:["extEp"], an:"dr_extEp", hands:true, sh:true, for:["manna"]},
  {id:"poignets", name:"Poignets en extension", yoga:"", how:"À genoux, paumes à plat, doigts vers l’avant, bras tendus : avance les épaules au-delà des mains sans décoller les paumes.",
    lv:["Épaules au-dessus des mains","Épaules 5 cm devant","Épaules 10 cm devant","Épaules 15 cm devant"], act:"poignetsAct", pas:["poignetsExt"], an:"z_poigF", hands:true, for:["planche","onearm","low"]},
];
const ROMI = Object.fromEntries(ROM.map(r => [r.id, r]));
const romLog = id => { const L = (S.rom || {})[id], r = ROMI[id]; return Array.isArray(L) ? L.filter(e => e && typeof e.t === "number" && Number.isInteger(e.v) && e.v >= 0 && e.v < r.lv.length) : []; };   // une sauvegarde abîmée ne casse pas l’affichage
const romLv = (id, until) => { const L = romLog(id).filter(e => !until || e.t < until); return L.length ? L[L.length - 1].v : -1; };
// séances de souplesse douce faites cette semaine (7 jours glissants)
const softWeek = () => { const t0 = Date.now() - 7 * 864e5; return new Set((S.soft || []).filter(t => t > t0).map(t => dayKey(t))).size; };
// le repère le plus en retard : jamais mesuré compte comme le premier palier, puis la part du chemin faite
const romWeak = pool => pool.slice().sort((a, b) => Math.max(0, romLv(a.id)) / (a.lv.length - 1) - Math.max(0, romLv(b.id)) / (b.lv.length - 1));
// la mesure du cycle : un repère différent à chaque cycle, toujours après l’échauffement, dans le même ordre
const romOfCycle = () => ROM[(cycN() - 1) % ROM.length];

// le personnage montre le repère : image fixe tout de suite, animation dès qu’elle est calculée
const romSp = (r, size) => { const sp = el("span","sp"); sp.dataset.anim = r.an; sp.dataset.pose = ANIM_STILL[r.an] || "stand"; sp.dataset.lk = ""; sprPaint(sp, size); return sp; };
function romOpen(id, after){
  const r = ROMI[id], box = $("qkBody"); box.textContent = "";
  const art = el("div","plart"); art.append(romSp(r, 150)); box.append(art, el("div","lab", r.yoga || "Souplesse"), el("h2",null,r.name), el("p","mut", r.how + " Échauffé, sans rebond."));
  const cur = romLog(id).slice(-1)[0], pick = {}, keep = el("button","btn","Garder cette mesure"); keep.disabled = true;
  const row = side => { const w = el("div","chips romch"); r.lv.forEach((t, k) => { const b = el("button","chip", t); b.setAttribute("aria-pressed","false");
      b.onclick = () => { pick[side] = k; w.querySelectorAll(".chip").forEach((x, j) => { x.classList.toggle("on", j === k); x.setAttribute("aria-pressed", j === k); }); keep.disabled = r.sides ? pick.g == null || pick.d == null : false; }; w.append(b); }); return w; };
  if (r.sides) box.append(el("div","lab","Jambe gauche devant"), row("g"), el("div","lab","Jambe droite devant"), row("d")); else box.append(row("v"));
  if (cur) box.append(el("p","mut","Dernière mesure, le " + new Date(cur.t).toLocaleDateString("fr-FR",{day:"numeric",month:"long"}) + " : " + (r.sides && cur.g != null ? "gauche « " + r.lv[cur.g] + " », droite « " + r.lv[cur.d] + " »" : "« " + r.lv[cur.v] + " »") + "."));
  keep.onclick = () => { const e = {t:Date.now(), v:r.sides ? Math.min(pick.g, pick.d) : pick.v}; if (r.sides) { e.g = pick.g; e.d = pick.d; }
    const R = S.rom || (S.rom = {}); (R[id] || (R[id] = [])).push(e); if (R[id].length > 40) R[id].shift(); save(); $("qkDlg").close(); toast("Mesure gardée."); (after || renderSouple)(); };
  box.append(keep);
  $("qkT").textContent = "Mesure de souplesse"; const qd = $("qkDlg"); qd.classList.add("sqd"); if (!qd.open) qd.showModal(); qd.scrollTop = 0; qd.onscroll = null;
}
// Profil : les repères, leur palier et le nom en yoga
function renderSouple(){
  const box = $("souple"); if (!box) return; box.textContent = "";
  box.append(el("h2",null,"Ma souplesse"), el("p","mut","Touche un repère pour le mesurer."));
  ROM.forEach(r => { const k = romLv(r.id), b = el("button","romrow"), dots = el("span","romdots");
    r.lv.forEach((_, j) => dots.append(el("i", j <= k ? "on" : ""))); dots.setAttribute("aria-hidden","true");
    const tx = el("span","romn"); tx.append(el("b",null,r.name), el("span","mut", k < 0 ? "À mesurer" : r.lv[k]));
    b.append(romSp(r, 64), tx, dots); b.setAttribute("aria-label", r.name + (k < 0 ? ", pas encore mesuré" : ", palier " + (k + 1) + " sur " + r.lv.length + " : " + r.lv[k]) + ". Mesurer"); b.onclick = () => romOpen(r.id); box.append(b); });
}
// Bilan du cycle : ce qui a bougé depuis la mesure d’avant
function romBilan(start){
  const rows = ROM.map(r => { const a = romLv(r.id, start), L = romLog(r.id).filter(e => e.t >= start), b = L.length ? L[L.length - 1].v : null; return b == null ? null : [r, a, b]; }).filter(Boolean);
  if (!rows.length) return null; const sc = el("section"); sc.append(el("h3",null,"Ta souplesse"));
  rows.forEach(([r, a, b]) => { const x = el("div","cyrec"); x.append(el("span",null,r.name), el("b",null, r.lv[b] + (a < 0 ? "" : b > a ? ", un palier de plus" : b === a ? ", stable" : ", un peu moins"))); sc.append(x); });
  return sc;
}
// zones au repos qui ferment un repère : poignets (appui sur les mains), cuisses et aine (grands écarts), bas du dos (pont)
const romOk = (r, zones, active) => !(r.sh && (zones.includes("epaule") || zones.includes("coude") || (!active && typeof frag === "function" && frag("epaule")))) && !(r.hands && zones.includes("poignet")) && !(r.split && zones.includes("jambe")) && !(r.back && zones.includes("dos"));
// les 5 minutes actives de fin de séance : le repère le plus en retard parmi ceux que demandent les figures du jour
function romActive(ids, PS){
  const secs = new Set(ids.map(id => MS[id] && MS[id].sec)), manna = ids.some(id => /^pr_(manna|vsitH|extSup|mannaP)/.test(id)), zones = PS.phase === 1 ? (PS.zones || [PS.zone]) : [];
  const ok = ROM.filter(r => romOk(r, zones, true)), pool = ok.filter(r => r.for.some(s => secs.has(s) || (s === "manna" && manna)));
  const r = romWeak(pool.length ? pool : ok)[0]; if (!r || !DRILLS[r.act]) return null;
  const b = drillBlock(r.act, false); b.name += ", souplesse active"; b.keep = true; b.note = "Souplesse active : soulever et tenir l’amplitude que tu sais déjà atteindre. Jamais jusqu’à l’échec."; return b;
}
// Souplesse douce, environ 20 minutes : deux repères en retard, leurs étirements tenus (PNF quand c’est indiqué), puis le travail actif
function soupleDay(PS){
  const zones = PS && PS.phase === 1 ? (PS.zones || [PS.zone]) : [], y = new Date(); y.setDate(y.getDate() - 1);
  const noSplit = S.lastSplit === dayKey(y) || zones.includes("jambe");   // grands écarts : jamais deux jours de suite
  const pick = romWeak(ROM.filter(r => romOk(r, zones) && !(r.split && noSplit))).slice(0, 2);
  const ks = [...new Set(pick.flatMap(r => (typeof frag === "function" && frag("hyper") ? [] : r.pas).concat(r.act)))]   // hyperlaxe : la souplesse active seulement, pas d’étirement passif.filter(k => DRILLS[k] && !(zones.includes("poignet") && DRILLS[k].hands));
  return [Object.assign(drillBlock("miseEnRoute", false), {keep:true, name:"Mise en route, avant la souplesse douce"})].concat(ks.map(k => { const b = drillBlock(k, false); b.keep = true; return b; }), [drillBlock("hollow", false)]);
}
