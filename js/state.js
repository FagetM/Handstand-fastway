// État sauvegardé, outils, progression (expérience, niveaux, badges).
"use strict";
// ---------- État ----------
const KEY = "hs-fastway-v1";
const blank = () => ({countdown:5, ms:{}, log:[], vid:{}, pg:{best:{}, wk:{}, by:{}}});
let S = blank();
let loadErr = false;
try { const raw = localStorage.getItem(KEY); if (raw) { try { S = Object.assign(blank(), JSON.parse(raw)); } catch(e){ loadErr = true; try { localStorage.setItem(KEY + ".bak", raw); } catch(_){} } } } catch(e){}   // sauvegarde illisible : on en garde une copie avant de repartir
if (!S.ms || typeof S.ms !== "object") S.ms = {}; if (!Array.isArray(S.log)) S.log = []; if (!S.pg || typeof S.pg !== "object") S.pg = blank().pg; if (!S.vid) S.vid = {};
S.sessOpen = false;
// fusion des deux « jambes en ciseaux » : l’ancienne figure de 15 s rejoint celle de 5 s
if (S.ms.b2_free15) { const a = S.ms.b1_free5 || (S.ms.b1_free5 = {best:0, done:false}), b = S.ms.b2_free15; a.best = Math.max(a.best || 0, b.best || 0); a.done = !!b.done; delete S.ms.b2_free15; }
else if (S.ms.b1_free5 && S.ms.b1_free5.done && (S.ms.b1_free5.best || 0) < 15 && !S.migr15) { S.ms.b1_free5.done = false; }
S.migr15 = true;
// Fondations : qui savait déjà sortir en roue au mur maîtrise la roue, le gainage et la tenue au mur
// nouvelles étapes vers le un bras et la planche : qui avait déjà validé l’étape d’après garde sa place
// cohérence : une figure validée implique ses prérequis (les nouvelles étapes intermédiaires sont acquises si l’étape d’après l’est)
if (!S.migrDec) { const NEW = new Set(["oa_tuckflag","oa_shrug","oa_sidehold","oa_finger3","oa_finger2","oa_finger1","oa_oahsw","pl_lean2","pl_tuckP","pl_tuckPu","pl_tuckO","pl_strBand","pl_strBandL","pl_strNar","pl_half","pl_fullBand","pl_fullNeg","pr_pikeLift","pr_stradLift","pr_wallNeg","pr_elevLow","pr_negP","pr_vsit","pr_halfSt","pr_tuckUp","pr_stalPart","pr_lsitNeg"]);
  const mark = id => { (MS[id] && MS[id].req || []).forEach(r => { if (NEW.has(r) && MS[r].sec === MS[id].sec && !(S.ms[r] && S.ms[r].done)) { S.ms[r] = {best:MS[r].target || 0, done:true}; mark(r); } }); };
  Object.keys(S.ms).filter(id => MS[id] && !MS[id].alt && S.ms[id].done).forEach(mark); S.migrDec = true; }
if (!S.migrPr) { if (S.ms.pr_straddle && S.ms.pr_straddle.done) S.ms.pr_negS = {best:3, done:true}; S.migrPr = true; }
if (!S.migrPr2) { const dn = id => S.ms[id] && S.ms[id].done; if (dn("pr_straddle")) S.ms.pr_elev = {best:3, done:true}; if (dn("pr_stradL")) S.ms.pr_lsit = {best:15, done:true}; S.migrPr2 = true; }   // les descentes passent avant la montée
if (!S.migrOa) { const dn = id => S.ms[id] && S.ms[id].done, set = id => { S.ms[id] = {best:MS[id].target || 0, done:true}; };
  if (dn("oa_flaghoriz") || dn("oa_shift")) set("oa_strad30"); if (dn("oa_shift")) set("oa_wall"); if (dn("oa_oahs")) set("oa_lift");
  if (dn("pl_tuck")) set("pl_ppp"); if (dn("pl_straddle") || dn("pl_pike")) set("pl_1leg"); S.migrOa = true; }
// matériel déclaré au départ : élastiques, parallettes, gilet jusqu’à 10 kg (modifiable dans les réglages)
// apostrophes typographiques : les noms d’exercices enregistrés suivent le nouveau texte (sinon records et historique ne les reconnaîtraient plus)
function migrQuote(S){ if (S.migrQ) return; const q = x => String(x).replace(/(?<=[A-Za-zÀ-ÖØ-öø-ÿŒœ])'(?=[A-Za-zÀ-ÖØ-öø-ÿŒœ])/g, "’");
  (S.log || []).forEach(l => { if (typeof l.id === "string") l.id = q(l.id); });
  if (S.pg && S.pg.best) S.pg.best = Object.fromEntries(Object.entries(S.pg.best).map(([k, v]) => [q(k), v]));
  if (S.bday && S.bday.blocks) S.bday.blocks.forEach(b => { if (b.name) b.name = q(b.name); if (b.how) b.how = q(b.how); });
  S.migrQ = true; }
// figures renommées : les noms enregistrés (historique, records, séance du jour) suivent
const RENAMED = {"Tenues de formes, niveau 1":"Tenues de forme, niveau 1", "Changements de formes, niveau 1":"Changements de forme, niveau 1", "Straddle planche serrée":"Straddle planche, écart réduit", "Queda de rins":"Queda de rins (appui sur le coude)",
  "Tuck planche ouvert":"Tuck planche ouverte", "De l’équerre à la planche, et retour en équilibre":"De l’équerre à la full planche et retour en équilibre", "Équerre, équilibre, un bras de chaque côté":"Équerre, équilibre, puis un bras de chaque côté", "Drapeaux jusqu’au sol":"Drapeaux jusqu’au sol", "Équilibre sur un bras, 10 s des deux côtés":"Équilibre sur un bras, des deux côtés", "Drapeaux groupés, chaque côté":"Drapeaux groupés, de chaque côté"};
function migrNames(S){ if (S.migrN4) return; const q = x => { for (const [o, n] of Object.entries(RENAMED)) { if (x === o || x === "pg:" + o || x.startsWith(o + ",") || x.startsWith("pg:" + o + ",")) return x.replace(o, n); } return x; };
  (S.log || []).forEach(l => { if (typeof l.id === "string") l.id = q(l.id); });
  if (S.pg && S.pg.best) S.pg.best = Object.fromEntries(Object.entries(S.pg.best).map(([k, v]) => [q(k), v]));
  if (S.bday && S.bday.blocks) S.bday.blocks.forEach(b => { if (b.name) b.name = q(b.name); });
  S.migrN4 = true; }
// les noms composés perdent leur point médian (« Planche inclinée, préparation ») : les noms enregistrés suivent
function migrDot(S){ if (S.migrDot) return; const q = x => String(x).split(" · ").join(", ");
  (S.log || []).forEach(l => { if (typeof l.id === "string") l.id = q(l.id); });
  if (S.pg && S.pg.best) S.pg.best = Object.fromEntries(Object.entries(S.pg.best).map(([k, v]) => [q(k), v]));
  if (S.bday && S.bday.blocks) S.bday.blocks.forEach(b => { if (b.name) b.name = q(b.name); });
  S.migrDot = true; }
migrQuote(S); migrDot(S); migrNames(S);
if (!S.equip) S.equip = {band:true, para:true, kg:10};
if (!S.migrFd) { if (S.ms.st_bail30 && S.ms.st_bail30.done) ["fd_plank","fd_roue","fd_c2w"].forEach(id=>{ S.ms[id] = {best:Math.max(MS[id].target || 0, 0), done:true}; }); S.migrFd = true; }   // le détail de la séance est replié à chaque ouverture
// Effacer ce qu’on vient de faire : avant chaque enregistrement, une photo de l’état est gardée (les 4 dernières du jour).
// Effacer = revenir à la photo, comme un « Ctrl+Z » : la série, le record, le compteur et une éventuelle validation repartent ensemble.
const UKEY = KEY + ".undo"; let undoT = 0;
// le jour qui compte : celui où la séance a commencé (une séance qui passe minuit reste sur un seul jour)
const nowD = () => dayKey(typeof nowS === "function" ? nowS() : Date.now());
function undoList(){ try { return (JSON.parse(localStorage.getItem(UKEY)) || []).filter(u => u.d === nowD()); } catch(e){ return []; } }
// deux photos de plus : l’état du matin (avant le premier enregistrement du jour) et l’état avant l’exercice en cours
const ukGet = k => { try { const u = JSON.parse(localStorage.getItem(UKEY + "." + k)); return u && u.d === nowD() ? u : null; } catch(e){ return null; } };
const ukSet = (k, u) => { try { if (u) localStorage.setItem(UKEY + "." + k, JSON.stringify(u)); else localStorage.removeItem(UKEY + "." + k); } catch(e){} };
function pushUndo(label, at){ if (Date.now() - undoT < 400) return; undoT = Date.now();   // un même geste ne fait qu’une photo
  const snap = Object.assign({d:nowD(), t:Date.now(), label, s:JSON.stringify(S)}, at || {});
  if (!ukGet("day")) ukSet("day", snap);
  if (at && at.bi != null) { const b = ukGet("blk"); if (!b || b.bi !== at.bi || b.p !== at.p) ukSet("blk", snap); }
  const a = undoList(); a.push(snap); while (a.length > 3) a.shift();
  try { localStorage.setItem(UKEY, JSON.stringify(a)); } catch(e){ try { localStorage.setItem(UKEY, JSON.stringify(a.slice(-1))); } catch(_){ localStorage.removeItem(UKEY); } } }
// revenir à une photo : tout ce qui a été enregistré après disparaît, les photos plus récentes avec
function undoTo(u){ if (!u) return null; try { S = Object.assign(blank(), JSON.parse(u.s)); S.sessOpen = false; migrQuote(S); migrDot(S); migrNames(S); } catch(e){ return null; }
  try { localStorage.setItem(UKEY, JSON.stringify(undoList().filter(x => x.t < u.t))); } catch(e){}
  ["day","blk"].forEach(k => { const x = ukGet(k); if (x && x.t >= u.t) ukSet(k, null); });
  lastZ = null; save(); return u; }
const undoLast = () => undoTo(undoList().pop());
// annuler l’exercice en cours (toutes ses séries du jour) ou tout l’entraînement du jour
const undoBlock = () => undoTo(ukGet("blk"));
const undoDay = () => undoTo(ukGet("day"));
let saveWarned = false;
const save = () => { window._bb = null; try { const j = JSON.stringify(S); try { localStorage.setItem(KEY, j); } catch(e0){ [UKEY, UKEY + ".day", UKEY + ".blk"].forEach(k => localStorage.removeItem(k)); localStorage.setItem(KEY, j); }   /* mémoire pleine : les copies d’annulation partent d’abord */ saveWarned = false; warnBar(""); } catch(e){ saveWarned = true; warnBar("Enregistrement impossible : la mémoire de l’appareil est pleine. Exporte ta sauvegarde (Profil) avant de fermer."); } };
// bandeau qui reste affiché tant que le problème dure (un toast disparaît trop vite)
function warnBar(msg){ let b = document.getElementById("warnBar"); if (!msg) { if (b) b.remove(); return; } if (!b) { b = document.createElement("div"); b.id = "warnBar"; b.setAttribute("role","alert"); } b.textContent = msg; ([...document.querySelectorAll("dialog[open]")].pop() || document.body).append(b); }
if (loadErr) addEventListener("load", () => warnBar("Ta sauvegarde était illisible : l’app repart de zéro. Une copie est gardée sur l’appareil."));
// si l’app est ouverte dans deux onglets, l’autre onglet se recharge (hors séance) pour ne pas écraser les données
window.addEventListener("storage", e => { if (e.key !== KEY) return; if (!document.querySelector("dialog[open]")) location.reload(); else warnBar("L’app est ouverte dans un autre onglet : ferme-le, sinon l’un des deux écrasera l’autre."); });
// l’écran reste allumé pendant le chrono ; on n’attend pas la réponse, pour qu’un double appui ne lance pas deux chronos
function keepAwake(set){ try { if (navigator.wakeLock) navigator.wakeLock.request("screen").then(set).catch(()=>{}); } catch(e){} }
// Validation exigeante : une figure se valide quand la cible est tenue sur DEUX séances, deux jours différents
// (la planche demande en plus 3 séries à la cible dans chaque séance). Un bon jour ne suffit pas : on veut de la régularité.
const NEED_DAYS = 2;
// premier essai d’une figure : sa date sert à mesurer ton rythme réel (dates estimées)
function stamp(id){ if (MS[id]) { const x = st(id); if (!x.t0 && !x.done) x.t0 = Date.now(); } }
// record d’avant le premier enregistrement (bilan de départ) : il sert de plancher quand on efface l’historique
function base0(id){ if (MS[id]) { const x = st(id); if (x.b0 == null) x.b0 = x.best || 0; } }
// règle de validation par figure : nombre de séances, écart minimal entre deux (jours), étendue minimale (jours)
const valRule = id => /^pl_(straddle|strNar|half|full)$/.test(id) ? {n:3, gap:2, span:21} /* grands leviers sans aide : trois semaines, le temps que les tendons suivent */ : /^ul_/.test(id) || id === "pl_press" || (/^pl_/.test(id) && MS[id] && MS[id].type === "hold" && !/^pl_(lean|ppp)/.test(id)) ? {n:3, gap:2, span:10} : id === "oa_oahs" || id === "oa_oahsw" || id === "oa_oahs10" ? {n:4, gap:2, span:21} : MS[id] && MS[id].sec === "onearm" ? {n:3, gap:2, span:14} : {n:NEED_DAYS, gap:1, span:0};
// figures « de chaque côté » : la séance compte quand la cible est tenue des deux côtés (séries alternées gauche / droite)
const SIDED = new Set(["oa_oahsw","oa_tuckflag","oa_wall","oa_flaghoriz","oa_flagfloor","oa_shrug","oa_shift","oa_sidehold","oa_finger","oa_finger3","oa_finger2","oa_finger1","oa_strarm","oa_lift","oa_oahs10","oa_shTuck","oa_shStrad","oa_shFlag","oa_switch","pl_1leg"]);
const perSide = id => /^pl_/.test(id) ? 3 : 1;   // planche une jambe : 3 séries à la cible de chaque jambe
const hitNeed = id => SIDED.has(id) ? 2 : /^pl_/.test(id) && MS[id].type === "hold" ? 2 : 1;   // planche : 2 tentatives sur 3 à la cible
function hitInfo(id){ const h = (S.hit || {})[id] || {}; return {days:(h.days || []).length, today:h.d === dayKey(Date.now()) ? h.n : 0}; }
// à appeler quand la cible est atteinte sur une série ; renvoie un message (ou "" si la figure vient d’être validée)
// figure « réussi / pas réussi » : 3 réussites le même jour = une séance validée (en séance ou depuis la fiche)
function chkHit(id){ if (!MS[id] || MS[id].type !== "check" || st(id).done) return;
  const c = S.chk || (S.chk = {}), d = nowD(), r = c[id] && c[id].d === d ? c[id] : (c[id] = {d, n:0}), need = /^ul_/.test(id) ? 1 : 3; r.n++;   // un combo : une réussite par séance suffit
  if (r.n === need) { const msg = hitTarget(id); toast(msg || "« " + MS[id].name + " » validée."); } else if (r.n < need) toast("Réussi (" + r.n + "/" + need + " aujourd’hui)."); }
function hitTarget(id, side){
  const all = S.hit || (S.hit = {}), d = nowD(), need = hitNeed(id);
  const h = all[id] || (all[id] = {d, n:0, days:[]}); h.days = h.days || []; if (h.d !== d) { h.d = d; h.n = 0; h.sd = []; h.sc = {}; }
  if (SIDED.has(id) && side != null) { h.sc = h.d === d && h.sc ? h.sc : {}; h.sc[side] = (h.sc[side] || 0) + 1; h.n = [0, 1].filter(k => (h.sc[k] || 0) >= perSide(id)).length; } else h.n++;
  // un bras : les séances validées doivent être espacées d’au moins 2 jours (le système nerveux consolide entre deux)
  const V = valRule(id), last = h.days.length ? h.days[h.days.length - 1] : null, gapOk = !last || dayDiff(d, last) >= V.gap;
  const fresh = h.n >= need && !h.days.includes(d) && gapOk; if (fresh) h.days.push(d);
  const span = h.days.length ? dayDiff(h.days[h.days.length - 1], h.days[0]) : 0;
  if (h.days.length >= V.n && span >= V.span) { st(id).done = true; st(id).dt = Date.now(); return ""; }
  if (h.days.includes(d) && !fresh) return "Séance déjà validée aujourd’hui (" + h.days.length + "/" + V.n + ").";
  if (h.n >= need && !gapOk) return "Cible tenue. Elle comptera pour la validation dans " + (V.gap - dayDiff(d, last)) + " jour" + (V.gap - dayDiff(d, last) > 1 ? "s" : "") + " : on espace les séances validées.";
  if (h.n < need) return SIDED.has(id) ? "Cible tenue d’un côté : à l’autre maintenant." : "Cible tenue (" + h.n + "/" + need + " séries aujourd’hui).";
  if (fresh) return "Séance validée (" + h.days.length + "/" + V.n + ") : refais la cible un autre jour pour valider la figure.";
}
const st = id => S.ms[id] || (S.ms[id] = {best:0, done:false});
const $ = id => document.getElementById(id);
// espaces insécables avant les unités et après « × » : « 15 s », « 12 rép. », « ≈ 5 semaines » ne se coupent jamais en fin de ligne
const nbsp = t => String(t).replace(/(\d) (?=(?:s|m|min|rép|cm|kg|j|mois|ans?|semaines?|séries?|essais?|tentatives?|%)(?![A-Za-zÀ-ÿ]))/g, "$1\u00a0").replace(/([×≈]) /g, "$1\u00a0").replace(/ : (?=\d)/g, "\u00a0:\u00a0").replace(/([ ’]à) (?=\d)/g, "$1\u00a0").replace(/(\d) ([×≈])/g, "$1\u00a0$2").replace(/« /g, "«\u00a0").replace(/ »/g, "\u00a0»");
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = typeof txt === "string" ? nbsp(txt) : txt; return e; };
const ICON = {
  flag:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M12 42V6"/><path d="M12 8c8-4 14 4 24 0v18c-10 4-16-4-24 0" fill="currentColor" fill-opacity=".18"/></svg>',
  check:'<svg width="11" height="9" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4.5l3 3 6-6.5"/></svg>',
  lock:'<svg width="9" height="11" fill="none" stroke="currentColor" stroke-width="1.3"><rect x=".7" y="4.7" width="7.6" height="5.6" rx="1"/><path d="M2.5 4.5V3a2 2 0 014 0v1.5"/></svg>',
  chev:'<svg width="8" height="12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1.5 1l5 5-5 5"/></svg>',
};
const icon = (name, cls) => { const s = el("span", cls); s.innerHTML = ICON[name]; return s; };
const num = v => (Math.round(v*10)/10).toLocaleString("fr-FR");
const fmt = (m, v) => m.type === "hold" ? num(v) + "\u00a0s" : v + "\u00a0rép.";
const goalTxt = m => m.type === "hold" ? m.target + "\u00a0s" : m.type === "reps" ? "×\u00a0" + m.target : "";

// étapes à l’élastique : sans élastique déclaré, elles ne bloquent pas le parcours
const BAND_STEPS = new Set(["pl_strBand","pl_strBandL","pl_fullBand"]);
const reqDone = r => st(r).done || (BAND_STEPS.has(r) && !(S.equip || {}).band);
const msLocked = m => (m.req||[]).some(r=>!reqDone(r));
const secDone = s => s.ms.length > 0 && s.ms.every(m=>st(m.id).done);
const dayKey = t => { const d = new Date(t); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); };
// clé de jour → date locale à minuit (new Date("2026-10-31") serait lue en UTC, et « 2026-11-1 » en heure locale)
const dk = k => { const [y, m, d] = String(k).split("-").map(Number); return new Date(y, m - 1, d); };
const dayDiff = (a, b) => Math.round((dk(a) - dk(b)) / 864e5);
const missing = m => m.req.filter(r=>!reqDone(r)).map(r=>MS[r].name + (MS[r].target ? " " + goalTxt(MS[r]) : "")).join(" + ");

// ---------- Progression : compteurs, expérience, niveau, badges ----------
const cnt = () => {
  if (!S.cnt){ const wk = (S.pg && S.pg.wk) || {};
    S.cnt = { sets:Object.values(wk).reduce((n,o)=>n + Object.keys(o).length, 0),
      hold:Math.round(S.log.reduce((n,l)=>n + ((l.k === "hold" || (MS[l.id] && MS[l.id].type === "hold")) && typeof l.v === "number" ? l.v : 0), 0)),
      sess:S.log.filter(l=>l.k === "check").length, stretch:S.log.filter(l=>l.k === "check" && /tirements/.test(l.id)).length, streak:0 }; }
  return S.cnt;
};
const RANKS = ["Graine","Pousse","Racine","Tige","Feuille","Fleur","Arbre","Forêt","Montagne","Ciel","Étoile","Galaxie"];   // on grandit comme une plante, à son rythme
const xpFor = l => 50 * l * (l + 1);            // expérience totale pour atteindre le niveau l + 1
const doneIn = ids => ids.filter(id=>reqDone(id)).length;   // les étapes à l’élastique comptent comme faites sans élastique
const mins = s => Math.floor(s/60);
const BADGES = [
  {id:"first", g:"1", name:"Premier pas", desc:"Enregistrer une première série ou un premier essai.", max:1, cur:c=>c.sets + c.tries},
  {id:"st3", g:"3 j", name:"Trois jours fidèles", desc:"Bouger trois jours, séance ou postures. Deux jours de repos de suite ne cassent rien.", max:3, cur:c=>c.streak},
  {id:"st7", g:"7 j", name:"Sept jours fidèles", desc:"Bouger sept jours, séance ou postures, repos permis entre deux.", max:7, cur:c=>c.streak},
  {id:"st30", g:"30 j", name:"Trente jours fidèles", desc:"Un mois à bouger, repos compris.", max:30, cur:c=>c.streak},
  {id:"st60", g:"60 j", name:"Deux mois fidèles", desc:"Deux mois à bouger, repos compris.", max:60, cur:c=>c.streak},
  {id:"st100", g:"100 j", name:"Cent jours fidèles", desc:"Cent jours à bouger, repos compris.", max:100, cur:c=>c.streak},
  {id:"st365", g:"1 an", name:"Une année fidèle", desc:"Un an à bouger, deux jours de repos de suite au plus.", max:365, cur:c=>c.streak},
  {id:"se10", g:"10", name:"Dix séances", desc:"Terminer dix séances complètes d’un programme.", max:10, cur:c=>c.sess},
  {id:"se50", g:"50", name:"Cinquante séances", desc:"Terminer cinquante séances complètes.", max:50, cur:c=>c.sess},
  {id:"se100", g:"100", name:"Cent séances", desc:"Terminer cent séances complètes.", max:100, cur:c=>c.sess},
  {id:"se200", g:"200", name:"Deux cents séances", desc:"Terminer deux cents séances complètes.", max:200, cur:c=>c.sess},
  {id:"se400", g:"400", name:"Quatre cents séances", desc:"Terminer quatre cents séances complètes.", max:400, cur:c=>c.sess},
  {id:"s100", g:"100", name:"Cent séries", desc:"Faire cent séries en séance.", max:100, cur:c=>c.sets},
  {id:"s1000", g:"1000", name:"Mille séries", desc:"Faire mille séries en séance.", max:1000, cur:c=>c.sets},
  {id:"h10", g:"10 min", name:"Dix minutes en appui", desc:"Cumuler dix minutes de maintien chronométré.", max:600, cur:c=>c.hold, t:1},
  {id:"h60", g:"1 h", name:"Une heure en appui", desc:"Cumuler une heure de maintien chronométré.", max:3600, cur:c=>c.hold, t:1},
  {id:"h180", g:"3 h", name:"Trois heures en appui", desc:"Cumuler trois heures de maintien chronométré.", max:10800, cur:c=>c.hold, t:1},
  {id:"h600", g:"10 h", name:"Dix heures en appui", desc:"Cumuler dix heures de maintien chronométré.", max:36000, cur:c=>c.hold, t:1},
  {id:"e10", g:"Souple", name:"Dix séances d’étirements", desc:"Terminer dix séances d’étirements.", max:10, cur:c=>c.stretch},
  ...TREE.filter(s=>s.ms.length).map((s,i)=>({id:"sec_" + s.id, g:String(i+1).padStart(2,"0"), name:s.name, desc:"Valider toutes les figures de la branche « " + s.name + " ».", max:s.ms.filter(m=>!m.alt).length, cur:()=>doneIn(s.ms.filter(m=>!m.alt).map(m=>m.id))})),
  {id:"sq8", g:"Traverse", name:"Chemins de traverse", desc:"Réussir 8 quêtes annexes du parcours.", max:8, cur:()=>Object.keys(S.sq || {}).length},
  ...GOALS.filter(g=>g.id !== "all").map(g=>({id:"goal_" + g.id, g:"Quête", name:g.name, desc:"Terminer la quête « " + g.name + " ».", max:g.ms.length, cur:()=>doneIn(g.ms)})),
];
function stats(){
  const c = cnt(), days = new Set(S.log.map(l=>dayKey(l.t)));
  let streak = 0; const d = new Date();
  // régularité douce : un jour de repos entre deux séances ne casse pas la série (deux jours de suite sans rien, si)
  if (!days.has(dayKey(d))) d.setDate(d.getDate()-1);
  let gap = 0; while (gap < 3) {   /* deux jours de repos de suite (le week-end) ne cassent rien */ if (days.has(dayKey(d))) { streak++; gap = 0; } else gap++; d.setDate(d.getDate()-1); }
  if (streak > (c.streak || 0)) c.streak = streak;
  const done = Object.keys(MS).filter(id=>st(id).done && !MS[id].alt).length, tries = S.log.filter(l=>MS[l.id]).length;
  const ctx = Object.assign({tries}, c);
  const got = S.bgot || (S.bgot = (S.seen && S.seen.b || []).slice());   // un badge gagné le reste, même si de nouvelles figures s’ajoutent à sa branche
  const badges = BADGES.map(b=>{ const cur = Math.min(b.max, b.cur(ctx)), ok = cur >= b.max || got.includes(b.id); if (ok && !got.includes(b.id)) got.push(b.id); return Object.assign({}, b, {cur:ok ? b.max : cur, ok}); });
  const nodeXp = Object.values(MS).reduce((n,m)=>n + Math.round(100 * lvlOf(m) / lvls(m).length), 0);
  const xp = nodeXp + 2*c.sets + 2*tries + 40*badges.filter(b=>b.ok).length + 10*Object.keys(S.sq || {}).length;   /* quête annexe : 10 points */
  let lvl = 1; while (xp >= xpFor(lvl)) lvl++;
  return {streak, done, xp, lvl, badges, lo:lvl > 1 ? xpFor(lvl-1) : 0, hi:xpFor(lvl), rank:RANKS[lvl <= 16 ? Math.floor((lvl-1)/2) : Math.min(RANKS.length-1, 8 + Math.floor((lvl-17)/6))]};   /* après la forêt, un rang tous les 6 niveaux */
}
let toastT = null;
function toast(msg){ const t = $("toast"), dl = [...document.querySelectorAll("dialog[open]")].pop(); (dl || document.body).append(t);   // au-dessus de la fenêtre ouverte (séance, fiche)
  t.textContent = nbsp(msg); t.classList.add("on"); if (dl && !dl._tb) { dl._tb = 1; dl.addEventListener("close", () => { if (dl.contains(t)) document.body.append(t); }); }   /* la fenêtre se ferme : le message reste visible */
  clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove("on"), 3600); beep(990, 180); }

// ---------- Niveaux d’un jalon : trois paliers vers la cible (un seul pour un jalon « réussi / pas réussi ») ----------
// paliers sur mesure quand les tiers de la cible n’ont pas de sens
const LVLS = {pr_negS:[3], pr_negP:[3], pr_halfSt:[3], pr_lsitNeg:[3], pr_wallNeg:[5], oa_oahs:[2,3,5], oa_oahsw:[2,3,5], oa_lift:[1,3,5], oa_oahs10:[6,8,10], oa_shTuck:[2,3,5], oa_shStrad:[2,3,5], oa_shFlag:[2,3,5], pr_manna:[1,2,3], pl_strHs:[1,2], pl_hsDown:[1,2,3], pl_strBand:[10,12,15], pl_strBandL:[6,8,10]};
const lvls = m => LVLS[m.id] ? LVLS[m.id] : m.type === "check" || !m.target ? [1] : [...new Set([Math.ceil(m.target/3), Math.ceil(m.target*2/3), m.target])];
const lvlOf = m => { const x = st(m.id), L = lvls(m); return x.done ? L.length : m.type === "check" ? 0 : Math.min(L.length - 1, L.filter(v=>x.best >= v).length); };   // le dernier palier se valide sur 2 séances
const nextStep = m => { const L = lvls(m), k = lvlOf(m); return k < L.length ? L[k] : null; };
const unitTxt = (m, v) => m.type === "hold" ? v + "\u00a0s" : "×\u00a0" + v;   /* espace insécable : « 30 s » ne se coupe jamais */
const noMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
const poseId = id => POSE3D[id] || (id.startsWith("pl_") ? id : "stand");
