// État sauvegardé, outils, progression (expérience, niveaux, badges).
"use strict";
// ---------- État ----------
const KEY = "hs-fastway-v1";
const blank = () => ({countdown:5, ms:{}, log:[], vid:{}, pg:{best:{}, wk:{}, by:{}}});
let S = blank();
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(blank(), JSON.parse(raw)); } catch(e){}
S.sessOpen = false;
// fusion des deux « jambes en ciseaux » : l'ancienne figure de 15 s rejoint celle de 5 s
if (S.ms.b2_free15) { const a = S.ms.b1_free5 || (S.ms.b1_free5 = {best:0, done:false}), b = S.ms.b2_free15; a.best = Math.max(a.best || 0, b.best || 0); a.done = !!b.done; delete S.ms.b2_free15; }
else if (S.ms.b1_free5 && S.ms.b1_free5.done && (S.ms.b1_free5.best || 0) < 15 && !S.migr15) { S.ms.b1_free5.done = false; }
S.migr15 = true;
// Fondations : qui savait déjà sortir en roue au mur maîtrise la roue, le gainage et la tenue au mur
// nouvelles étapes vers le un bras et la planche : qui avait déjà validé l'étape d'après garde sa place
if (!S.migrPr) { if (S.ms.pr_straddle && S.ms.pr_straddle.done) S.ms.pr_negS = {best:3, done:true}; S.migrPr = true; }
if (!S.migrPr2) { const dn = id => S.ms[id] && S.ms[id].done; if (dn("pr_straddle")) S.ms.pr_elev = {best:3, done:true}; if (dn("pr_stradL")) S.ms.pr_lsit = {best:15, done:true}; S.migrPr2 = true; }   // les descentes passent avant la montée
if (!S.migrOa) { const dn = id => S.ms[id] && S.ms[id].done, set = id => { S.ms[id] = {best:MS[id].target || 0, done:true}; };
  if (dn("oa_flaghoriz") || dn("oa_shift")) set("oa_strad30"); if (dn("oa_shift")) set("oa_wall"); if (dn("oa_oahs")) set("oa_lift");
  if (dn("pl_tuck")) set("pl_ppp"); if (dn("pl_straddle") || dn("pl_pike")) set("pl_1leg"); S.migrOa = true; }
// matériel déclaré au départ : élastiques, parallettes, gilet jusqu'à 10 kg (modifiable dans les réglages)
if (!S.equip) S.equip = {band:true, para:true, kg:10};
if (!S.migrFd) { if (S.ms.st_bail30 && S.ms.st_bail30.done) ["fd_plank","fd_roue","fd_c2w"].forEach(id=>{ S.ms[id] = {best:Math.max(MS[id].target || 0, 0), done:true}; }); S.migrFd = true; }   // le détail de la séance est replié à chaque ouverture
let saveWarned = false;
const save = () => { window._bb = null; try { localStorage.setItem(KEY, JSON.stringify(S)); saveWarned = false; } catch(e){ if (!saveWarned && window.toast) { saveWarned = true; toast("Enregistrement impossible : la mémoire de l'appareil est pleine."); } } };
// si l'app est ouverte dans deux onglets, l'autre onglet se recharge (hors séance) pour ne pas écraser les données
window.addEventListener("storage", e => { if (e.key === KEY && !document.querySelector("dialog[open]")) location.reload(); });
// l'écran reste allumé pendant le chrono ; on n'attend pas la réponse, pour qu'un double appui ne lance pas deux chronos
function keepAwake(set){ try { if (navigator.wakeLock) navigator.wakeLock.request("screen").then(set).catch(()=>{}); } catch(e){} }
// Validation exigeante : une figure se valide quand la cible est tenue sur DEUX séances, deux jours différents
// (la planche demande en plus 3 séries à la cible dans chaque séance). Un bon jour ne suffit pas : on veut de la régularité.
const NEED_DAYS = 2;
// règle de validation par figure : nombre de séances, écart minimal entre deux (jours), étendue minimale (jours)
const valRule = id => id === "oa_oahs" || id === "oa_oahs10" ? {n:4, gap:2, span:21} : MS[id] && MS[id].sec === "onearm" ? {n:3, gap:2, span:14} : {n:NEED_DAYS, gap:1, span:0};
// figures « de chaque côté » : la séance compte quand la cible est tenue des deux côtés (séries alternées gauche / droite)
const SIDED = new Set(["oa_wall","oa_flaghoriz","oa_shift","oa_finger","oa_strarm","oa_lift","oa_oahs10","pl_1leg"]);
const perSide = id => /^pl_/.test(id) ? 3 : 1;   // planche une jambe : 3 séries à la cible de chaque jambe
const hitNeed = id => SIDED.has(id) ? 2 : /^pl_/.test(id) && MS[id].type === "hold" ? 3 : 1;
function hitInfo(id){ const h = (S.hit || {})[id] || {}; return {days:(h.days || []).length, today:h.d === dayKey(Date.now()) ? h.n : 0}; }
// à appeler quand la cible est atteinte sur une série ; renvoie un message (ou "" si la figure vient d'être validée)
// figure « réussi / pas réussi » : 3 réussites le même jour = une séance validée (en séance ou depuis la fiche)
function chkHit(id){ if (!MS[id] || MS[id].type !== "check" || st(id).done) return;
  const c = S.chk || (S.chk = {}), d = dayKey(Date.now()), r = c[id] && c[id].d === d ? c[id] : (c[id] = {d, n:0}); r.n++;
  if (r.n === 3) { const msg = hitTarget(id); toast(msg || "« " + MS[id].name + " » validée : réussie sur deux séances !"); } else if (r.n < 3) toast("Réussi (" + r.n + "/3 aujourd'hui)"); }
function hitTarget(id, side){
  const all = S.hit || (S.hit = {}), d = dayKey(Date.now()), need = hitNeed(id);
  const h = all[id] || (all[id] = {d, n:0, days:[]}); h.days = h.days || []; if (h.d !== d) { h.d = d; h.n = 0; h.sd = []; h.sc = {}; }
  if (SIDED.has(id) && side != null) { h.sc = h.d === d && h.sc ? h.sc : {}; h.sc[side] = (h.sc[side] || 0) + 1; h.n = [0, 1].filter(k => (h.sc[k] || 0) >= perSide(id)).length; } else h.n++;
  // un bras : les séances validées doivent être espacées d'au moins 2 jours (le système nerveux consolide entre deux)
  const V = valRule(id), last = h.days.length ? h.days[h.days.length - 1] : null, gapOk = !last || dayDiff(d, last) >= V.gap;
  if (h.n >= need && !h.days.includes(d) && gapOk) h.days.push(d);
  const span = h.days.length ? dayDiff(h.days[h.days.length - 1], h.days[0]) : 0;
  if (h.days.length >= V.n && span >= V.span) { st(id).done = true; return ""; }
  if (h.days.includes(d)) return "Séance déjà validée aujourd'hui (" + h.days.length + "/" + V.n + ").";
  if (h.n >= need && !gapOk) return "Belle tenue. Elle comptera pour la validation dans " + (V.gap - dayDiff(d, last)) + " jour" + (V.gap - dayDiff(d, last) > 1 ? "s" : "") + " : on espace les séances validées.";
  if (h.n < need) return SIDED.has(id) ? "Cible tenue d'un côté : à l'autre maintenant." : "Cible tenue (" + h.n + "/" + need + " séries aujourd'hui).";
  return "Séance validée (" + h.days.length + "/" + V.n + ") : refais-le un autre jour pour valider la figure.";
}
const st = id => S.ms[id] || (S.ms[id] = {best:0, done:false});
const $ = id => document.getElementById(id);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const ICON = {
  check:'<svg width="11" height="9" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4.5l3 3 6-6.5"/></svg>',
  lock:'<svg width="9" height="11" fill="none" stroke="currentColor" stroke-width="1.3"><rect x=".7" y="4.7" width="7.6" height="5.6" rx="1"/><path d="M2.5 4.5V3a2 2 0 014 0v1.5"/></svg>',
  chev:'<svg width="8" height="12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1.5 1l5 5-5 5"/></svg>',
};
const icon = (name, cls) => { const s = el("span", cls); s.innerHTML = ICON[name]; return s; };
const num = v => (Math.round(v*10)/10).toLocaleString("fr-FR");
const fmt = (m, v) => m.type === "hold" ? num(v) + " s" : v + " rép.";
const goalTxt = m => m.type === "hold" ? m.target + " s" : m.type === "reps" ? "× " + m.target : "";

const msLocked = m => (m.req||[]).some(r=>!st(r).done);
const secDone = s => s.ms.length > 0 && s.ms.every(m=>st(m.id).done);
const dayKey = t => { const d = new Date(t); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); };
// clé de jour → date locale à minuit (new Date("2026-10-31") serait lue en UTC, et « 2026-11-1 » en heure locale)
const dk = k => { const [y, m, d] = String(k).split("-").map(Number); return new Date(y, m - 1, d); };
const dayDiff = (a, b) => Math.round((dk(a) - dk(b)) / 864e5);
const missing = m => m.req.filter(r=>!st(r).done).map(r=>MS[r].name + (MS[r].target ? " " + goalTxt(MS[r]) : "")).join(" + ");

// ---------- Progression : compteurs, expérience, niveau, badges ----------
const cnt = () => {
  if (!S.cnt){ const wk = (S.pg && S.pg.wk) || {};
    S.cnt = { sets:Object.values(wk).reduce((n,o)=>n + Object.keys(o).length, 0),
      hold:Math.round(S.log.reduce((n,l)=>n + ((l.k === "hold" || (MS[l.id] && MS[l.id].type === "hold")) && typeof l.v === "number" ? l.v : 0), 0)),
      sess:S.log.filter(l=>l.k === "check").length, stretch:S.log.filter(l=>l.k === "check" && /tirements/.test(l.id)).length, streak:0 }; }
  return S.cnt;
};
const RANKS = ["Graine","Pousse","Racine","Tige","Feuille","Fleur","Arbre","Forêt"];   // on grandit comme une plante, à son rythme
const xpFor = l => 50 * l * (l + 1);            // expérience totale pour atteindre le niveau l + 1
const doneIn = ids => ids.filter(id=>st(id).done).length;
const mins = s => Math.floor(s/60);
const BADGES = [
  {id:"first", g:"1", name:"Premier pas", desc:"Enregistrer une première série ou un premier essai.", max:1, cur:c=>c.sets + c.tries},
  {id:"st3", g:"3 j", name:"Trois jours fidèles", desc:"Bouger trois jours, séance ou détente. Un jour de repos entre deux ne casse rien.", max:3, cur:c=>c.streak},
  {id:"st7", g:"7 j", name:"Sept jours fidèles", desc:"Bouger sept jours, séance ou détente, avec des jours de repos au milieu si tu veux.", max:7, cur:c=>c.streak},
  {id:"st30", g:"30 j", name:"Trente jours fidèles", desc:"Un mois à prendre soin de toi, repos compris.", max:30, cur:c=>c.streak},
  {id:"se10", g:"10", name:"Dix séances", desc:"Terminer dix séances complètes d'un programme.", max:10, cur:c=>c.sess},
  {id:"se50", g:"50", name:"Cinquante séances", desc:"Terminer cinquante séances complètes.", max:50, cur:c=>c.sess},
  {id:"s100", g:"100", name:"Cent séries", desc:"Faire cent séries en séance.", max:100, cur:c=>c.sets},
  {id:"s1000", g:"1000", name:"Mille séries", desc:"Faire mille séries en séance.", max:1000, cur:c=>c.sets},
  {id:"h10", g:"10 min", name:"Dix minutes en appui", desc:"Cumuler dix minutes de maintien chronométré.", max:600, cur:c=>c.hold, t:1},
  {id:"h60", g:"1 h", name:"Une heure en appui", desc:"Cumuler une heure de maintien chronométré.", max:3600, cur:c=>c.hold, t:1},
  {id:"e10", g:"Souple", name:"Dix séances d'étirements", desc:"Terminer dix séances d'étirements.", max:10, cur:c=>c.stretch},
  ...TREE.filter(s=>s.ms.length).map((s,i)=>({id:"sec_" + s.id, g:String(i+1).padStart(2,"0"), name:s.name, desc:"Valider tous les jalons de la branche « " + s.name + " ».", max:s.ms.length, cur:()=>doneIn(s.ms.map(m=>m.id))})),
  ...GOALS.filter(g=>g.id !== "all").map(g=>({id:"goal_" + g.id, g:"Quête", name:g.name, desc:"Terminer la quête « " + g.name + " ».", max:g.ms.length, cur:()=>doneIn(g.ms)})),
];
function stats(){
  const c = cnt(), days = new Set(S.log.map(l=>dayKey(l.t)));
  let streak = 0; const d = new Date();
  // régularité douce : un jour de repos entre deux séances ne casse pas la série (deux jours de suite sans rien, si)
  if (!days.has(dayKey(d))) d.setDate(d.getDate()-1);
  let gap = 0; while (gap < 2) { if (days.has(dayKey(d))) { streak++; gap = 0; } else gap++; d.setDate(d.getDate()-1); }
  if (streak > (c.streak || 0)) c.streak = streak;
  const done = Object.keys(MS).filter(id=>st(id).done).length, tries = S.log.filter(l=>MS[l.id]).length;
  const ctx = Object.assign({tries}, c);
  const badges = BADGES.map(b=>{ const cur = Math.min(b.max, b.cur(ctx)); return Object.assign({}, b, {cur, ok:cur >= b.max}); });
  const nodeXp = Object.values(MS).reduce((n,m)=>n + Math.round(100 * lvlOf(m) / lvls(m).length), 0);
  const xp = nodeXp + 2*c.sets + 2*tries + 40*badges.filter(b=>b.ok).length;
  let lvl = 1; while (xp >= xpFor(lvl)) lvl++;
  return {streak, done, xp, lvl, badges, lo:lvl > 1 ? xpFor(lvl-1) : 0, hi:xpFor(lvl), rank:RANKS[Math.min(RANKS.length-1, Math.floor((lvl-1)/2))]};
}
let toastT = null;
function toast(msg){ const t = $("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove("on"), 3600); beep(990, 180); }

// ---------- Niveaux d'un jalon : trois paliers vers la cible (un seul pour un jalon « réussi / pas réussi ») ----------
const lvls = m => m.id === "oa_oahs10" ? [6, 8, 10] : m.type === "check" || !m.target ? [1] : [...new Set([Math.ceil(m.target/3), Math.ceil(m.target*2/3), m.target])];
const lvlOf = m => { const x = st(m.id), L = lvls(m); return x.done ? L.length : m.type === "check" ? 0 : Math.min(L.length - 1, L.filter(v=>x.best >= v).length); };   // le dernier palier se valide sur 2 séances
const nextStep = m => { const L = lvls(m), k = lvlOf(m); return k < L.length ? L[k] : null; };
const unitTxt = (m, v) => m.type === "hold" ? v + " s" : "× " + v;
const noMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
const poseId = id => POSE3D[id] || (id.startsWith("pl_") ? id : "stand");
