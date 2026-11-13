// Séance : programmes, séance du jour, exercices d'accompagnement, bilan, séance guidée.
"use strict";
// ---------- Séance : programmes conservés sur l'appareil uniquement ----------
// Le contenu des programmes n'est pas lisible dans ce dépôt : il arrive chiffré (programs/*.enc, déverrouillé par une
// phrase que seul l'utilisateur connaît) ou par import d'un fichier au format "hs-program/1".
const DAYK = ["mon","tue","wed","thu","fri","sat","sun"], DAYL = ["L","M","M","J","V","S","D"];
const PKEY = "hs-fastway-progs", PPASS = "hs-fastway-pass"; let PS = {}, P = null;
try { PS = JSON.parse(localStorage.getItem(PKEY)) || {}; } catch(e){}
const savePS = () => { try { localStorage.setItem(PKEY, JSON.stringify(PS)); } catch(e){} };
const DAYN = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
// pendant une séance guidée, le « jour » reste celui du départ : passer minuit ne change ni la séance ni la semaine
let sessT = 0; const nowS = () => sessT && $("sd") && $("sd").open ? sessT : Date.now();
const todayIdx = () => (new Date(nowS()).getDay() + 6) % 7;
// une faute de frappe (9999) ne doit pas devenir un record : au-delà de 3 fois la cible, on demande confirmation
const saneReps = (v, tg) => v <= Math.max(30, 3 * (tg || 0)) || confirm(v + " répétitions : c'est bien ça ?");
let selDay = todayIdx();
const pg = () => { const g = S.pg || (S.pg = {}); g.best = g.best || {}; g.wk = g.wk || {}; g.by = g.by || {}; return g; };
// Séance d'équilibre : construite à partir de l'arbre (les prochains jalons accessibles de la quête 1), pas d'un programme importé.
function builtin(){
  // une fois la séance commencée, elle reste la même jusqu'au soir (les records du jour ne la modifient pas en route)
  if (S.bday && S.bday.d === dayKey(nowS())) return builtinOf(S.bday.blocks);
  // calculée une fois par état : render() la demande plusieurs fois (programmes, séance, carte du jour)
  return window._bb || (window._bb = builtinOf(builtinBlocks()));
}
const builtinOf = blocks => { const day = {type:"train", blocks};
  return {id:"equilibre", name:"Ma séance", builtin:true, steps:[{name:"Prochains jalons de la quête", info:"Séance construite à partir du parcours et du temps que tu as indiqué : tes prochains jalons accessibles, avec des séries ajustées à tes dernières séances.", days:Object.fromEntries(DAYK.map(k=>[k, day]))}]}; };
// ---------- Exercices d'accompagnement : ce qui prépare chaque figure, en plus de la figure elle-même ----------
// sets : [séries, durée en s] (tenue) ou [séries, répétitions] (reps). Repères généraux d'entraînement.
const DRILLS = {
  poignets:{name:"Préparation des poignets", kind:"hold", sets:[1,300], how:"5 minutes : cercles dans les deux sens, appuis sur les paumes en avançant les épaules, sur le dos des mains, sur le bout des doigts, puis 2 × 10 pompes poignets (on se soulève sur les doigts). Les poignets portent tout ton poids : ne les saute jamais."},
  hollow:{name:"Gainage en cuillère", kind:"hold", sets:[3,25], how:"Sur le dos, bas du dos plaqué au sol, bras tendus derrière la tête, jambes tendues décollées. C'est la ligne du corps en équilibre."},
  epaules:{name:"Ouverture des épaules", kind:"hold", sets:[2,40], how:"À genoux, mains sur une chaise ou un banc, laisse descendre la poitrine vers le sol, bras tendus. Les bras doivent pouvoir s'aligner avec le corps."},
  omoplates:{name:"Pompes d'omoplates en équilibre au mur", kind:"reps", sets:[3,8], how:"Poitrine face au mur, bras tendus : laisse le corps descendre de quelques centimètres en relâchant les épaules, puis repousse le sol vers les oreilles."},
  c2w:{name:"Tenue poitrine face au mur", kind:"hold", sets:[3,30], how:"Monte en marchant les pieds le long du mur, mains à une main du mur. Corps aligné, ventre rentré, poussée dans les épaules."},
  toepull:{name:"Décollages du mur", kind:"reps", sets:[4,5], how:"En équilibre poitrine face au mur, appuie dans les doigts pour décoller les pieds du mur et tiens une ou deux secondes, puis reviens."},
  kickup:{name:"Montées contrôlées", kind:"reps", sets:[2,8], how:"Sans mur, monte en fente et cherche à t'arrêter pile à la verticale, sans dépasser. Sors en roue si tu pars trop loin."},
  doigts:{name:"Corrections avec les doigts", kind:"reps", sets:[3,5], how:"Au mur ou libre : volontairement, laisse partir le poids vers le dos puis rattrape-le en appuyant fort dans le bout des doigts."},
  pike:{name:"Compressions jambes tendues", kind:"reps", sets:[3,10], how:"Assis jambes tendues, mains au sol près des genoux : décolle les talons en ramenant les jambes vers toi. Indispensable pour les 7 et les montées."},
  pancake:{name:"Écart facial penché", kind:"hold", sets:[2,45], how:"Assis jambes écartées, dos plat, penche-toi vers l'avant le plus loin possible sans arrondir le dos."},
  shift:{name:"Transferts de poids au mur", kind:"reps", sets:[3,6], how:"Dos au mur, jambes écartées : glisse le poids sur une main jusqu'à alléger l'autre, puis reviens au centre. Côté gauche, puis côté droit."},
  lean:{name:"Planche inclinée", kind:"hold", sets:[3,20], how:"Position de pompe, bras tendus, épaules loin devant les mains, omoplates écartées. Avance un peu plus à chaque série."},
  pseudo:{name:"Pompes mains aux hanches", kind:"reps", sets:[3,8], how:"Pompes avec les mains à hauteur des hanches, doigts vers l'extérieur : les épaules passent loin devant les mains."},
  frog:{name:"Grenouille", kind:"hold", sets:[3,15], how:"Accroupi, mains au sol, genoux posés sur les coudes : bascule vers l'avant jusqu'à décoller les pieds."},
  oawall:{name:"Tenue un bras dos au mur", kind:"hold", sets:[3,20], sides:1, how:"Dos au mur, jambes écartées : transfère le poids sur une main, retire l'autre et tiens. Épaule poussée vers l'oreille, bassin au-dessus de la main. Côté faible d'abord."},
  oashrug:{name:"Haussements d'épaule à un bras", kind:"reps", sets:[3,8], sides:1, how:"En appui à un bras au mur, bras verrouillé : laisse l'épaule descendre puis repousse-la vers l'oreille. C'est la force qui porte l'équilibre sur un bras."},
  tuckflag:{name:"Drapeaux groupés pulsés", kind:"reps", sets:[3,6], how:"En équilibre, genoux groupés : incline-les sur le côté en petits rebonds contrôlés, puis tiens 3 s la position la plus basse. Change de côté."},
  biceps:{name:"Renforcement du biceps bras tendu", kind:"reps", sets:[3,12], rest:45, how:"Curl bras presque tendu à l'élastique, lent : prépare le tendon du biceps et le coude au travail bras tendus."},
  tuck2strad:{name:"Extensions tuck vers straddle", kind:"reps", sets:[4,3], how:"Depuis l'advanced tuck, ouvre les jambes en straddle 2 s puis reviens, sans laisser tomber les hanches."},
  // avec du matériel (réglages › Mon matériel)
  bandpl:{name:"Planche à l'élastique", kind:"hold", sets:[4,10], rest:150, how:"Élastique en boucle sous les hanches, fixé en hauteur par un ancrage de porte (porte fermée à clé) : tiens la position de l'étape suivante, bras verrouillés, omoplates écartées.", eq:"band"},
  lsitpara:{name:"L-sit sur parallettes", kind:"hold", sets:[3,15], how:"Bras verrouillés, épaules abaissées loin des oreilles, jambes tendues à l'horizontale (groupé si besoin).", eq:"para"},
  dipsW:{name:"Dips lestés", kind:"reps", sets:[3,6], rest:90, alt:{name:"Dips lents (sans gilet)", reps:10, how:"Sans gilet aujourd'hui : descente en 3 secondes, une seconde en bas, remontée bras verrouillés."}, how:"Sur barres ou supports fixes, jamais sur des chaises avec le gilet : descends coudes à 90°, épaules basses, remonte bras verrouillés. Force de base pour la planche.", eq:"kg"},
  pushW:{name:"Pompes lestées", kind:"reps", sets:[3,8], rest:90, alt:{name:"Pompes lentes (sans gilet)", reps:12, how:"Sans gilet aujourd'hui : descente en 3 secondes, poitrine au sol, épaules devant les mains."}, how:"Gilet lesté, corps gainé, poitrine jusqu'au sol. Pour construire la force qui porte la planche.", eq:"kg"},
  protrac:{name:"Pompes d'omoplates en planche inclinée", kind:"reps", sets:[3,10], how:"Position de pompe, bras tendus, épaules devant les mains : sans plier les coudes, rapproche puis écarte les omoplates. Le dos s'arrondit à chaque poussée."},
  pikepulse:{name:"Pulsations en pike", kind:"reps", sets:[3,15], how:"Assis jambes serrées tendues, mains près des chevilles, dos rond : décolle les talons et fais de petites pulsations sans reposer."},
  appuiArr:{name:"Appui arrière sur parallettes", kind:"hold", sets:[3,20], rest:45, how:"Mains derrière le bassin, doigts vers l'arrière, bras tendus, bassin levé, épaules basses et ouvertes."},
  mannaLift:{name:"Bassin qui recule depuis l'équerre", kind:"reps", sets:[3,5], rest:60, how:"En équerre groupée sur parallettes, pousse le bassin devant les mains et reviens, 2 s à chaque fois. Bras tendus."},
  extEp:{name:"Épaules en extension", kind:"hold", sets:[3,30], rest:30, how:"Assis, mains au sol derrière toi doigts vers l'arrière (ou sur un banc) : avance le bassin, ouvre la poitrine, bras tendus. Sans douleur à l'avant de l'épaule."},
  tirage:{name:"Tirage à l'élastique", kind:"reps", sets:[3,12], rest:40, eq:"band", how:"Élastique à l'ancrage de porte : tire les coudes en arrière, serre les omoplates 1 s, reviens en 3 s."},
  rotext:{name:"Rotation externe d'épaule", kind:"reps", sets:[2,15], rest:30, eq:"band", sides:true, how:"Coude au corps à 90°, écarte la main vers l'extérieur contre l'élastique, lentement."},
  extpoig:{name:"Extenseurs du poignet", kind:"reps", sets:[2,15], rest:30, eq:"band", sides:true, how:"Avant-bras sur la cuisse, paume vers le sol : relève le poing contre l'élastique, redescends en 3 s."},
  stradlift:{name:"Élévations jambes écartées", kind:"reps", sets:[3,8], rest:45, how:"En écart facial, mains au sol devant le bassin : lève les deux jambes tendues, tiens 2 s, repose sans bruit."},
  elevpress:{name:"Montée pieds surélevés", kind:"reps", sets:[4,2], rest:90, how:"Mains sur parallettes, pieds sur une chaise, jambes écartées : épaules devant, le bassin monte jusqu'à l'équilibre, dos au mur si besoin."},
  stalneg:{name:"Descentes du stalder", kind:"reps", sets:[3,2], rest:120, how:"Sur parallettes : de l'équilibre à l'équerre écartée en 5 secondes, sans poser les pieds.", eq:"para"},
  pikepu:{name:"Pompes en V inversé", kind:"reps", sets:[3,8], how:"Bassin en l'air, la tête descend entre les mains, puis tu repousses. Pieds surélevés pour plus de difficulté."},
};
function drillsFor(m){
  const s = m.sec, id = m.id, out = [];
  if (s === "base") out.push("hollow","frog");
  else if (s === "starter") out.push("hollow","epaules","frog");
  else if (s === "b1") out.push("c2w","toepull","hollow");
  else if (s === "b2") out.push("c2w","kickup","doigts","hollow");
  else if (s === "inter") out.push(/7|toes/.test(id) ? "pike" : "doigts", /7/.test(id) ? "pancake" : "kickup", "omoplates");
  else if (s === "onearm") out.push("oawall","oashrug","doigts");
  else if (s === "planche") out.push(id === "pl_lean" || id === "pl_ppp" ? "lean" : (S.equip || {}).kg && st("fd_dips").done ? "dipsW" : "lean","protrac","pseudo","biceps");
  if (["pl_frog","pl_1leg","pl_straddle"].includes(id)) out.unshift("tuck2strad");
  if (id === "oa_flaghoriz" || id === "oa_wall") out.unshift("tuckflag");
  else if (s === "press") out.push("pikepulse","stradlift","pancake","lean");
  if (id === "pr_straddle") out.unshift("elevpress");
  if (/^pr_(manna|vsitH|extSup)/.test(id)) { out.splice(0, out.length, "extEp", "appuiArr", "mannaLift", "pancake"); }   // la manna, c'est d'abord des épaules en extension
  if (s === "ultime") out.push("doigts","extEp","lean");
  if (id === "pr_stalder" || id === "pr_lsitHs") { out.unshift("stalneg"); if ((S.equip || {}).para) out.unshift("lsitpara"); }
  else if (s === "low") out.push("frog","lean");
  if (id === "in_hspu") out.unshift("pikepu");
  const E = S.equip || {};
  if (E.band && ["pl_tuck","pl_adv","pl_frog","pl_1leg","pl_straddle","pl_full"].includes(id)) out.unshift("bandpl");
  if (E.para && (s === "planche" || s === "press")) out.push("lsitpara");
  if (E.kg && ["pl_lean","pl_ppp","pl_tuck"].includes(id) && st("fd_push").done) out.push("pushW");
  const iw = out.indexOf("dipsW"); if (iw > 0) { out.splice(iw, 1); out.unshift("dipsW"); }   // la force de base de la planche passe en premier
  const dup = {oa_tuckflag:"tuckflag", oa_shrug:"oashrug", pr_pikeLift:"pikepulse", pr_stradLift:"stradlift", pl_strBand:"bandpl", pl_strBandL:"bandpl", pl_fullBand:"bandpl"}[id];
  return [...new Set(out)].filter(k => k !== dup);
}
// gilet lesté : « pas de gilet aujourd'hui » remplace les exercices lestés par leur version lente, sans charge
const noVest = () => S.noVest === dayKey(Date.now());
function setNoVest(on){ S.noVest = on ? dayKey(Date.now()) : null;
  const bd = S.bday && S.bday.d === dayKey(Date.now()) ? S.bday : null;   // séance du jour déjà composée : on échange les blocs lestés restants
  if (bd) bd.blocks = bd.blocks.map((b, bi) => b.dk && DRILLS[b.dk].eq === "kg" && !Object.keys(wkGet(todayIdx())).some(x => x.startsWith(bi + "-")) ? Object.assign(drillBlock(b.dk, painRecent()), {sets:drillBlock(b.dk, painRecent()).sets.slice(0, b.sets.length)}) : b);
  save(); render(); }
const drillBlock = (k, pain) => { const d = DRILLS[k];
  // parallettes : les exercices d'appui se font dessus ; lest : on indique la charge
  const E = S.equip || {}, nv = d.eq === "kg" && (noVest() || deloadWeek()) && d.alt, d2 = nv ? Object.assign({}, d, {name:d.alt.name, how:d.alt.how, sets:[d.sets[0], d.alt.reps]}) : d;
  const how = d2.how + (E.para && ["lean","pseudo","protrac","bandpl"].includes(k) ? " Sur parallettes si tu veux : poignets ménagés." : "")
    + (d.eq === "kg" && !nv ? " Charge : commence à 5 kg, monte jusqu'à " + E.kg + " kg quand les 3 séries sont propres." : "");
  const n = Math.max(1, pain ? d2.sets[0] - 1 : d2.sets[0]);
  return {name:d2.name, kind:d.kind, how, dk:k, sets:Array.from({length:n}, ()=>d.kind === "hold" ? {dur:d2.sets[1], rest:d.rest || 30, sides:d.sides ? true : undefined} : {reps:d2.sets[1], rest:d.rest || 30, sides:d.sides ? true : undefined})}; };
// jours où une figure de force a été travaillée (planche, montées, pompes, dips)
// dernier jour où une figure a été travaillée (0 si jamais)
function lastWorked(id){ const m = MS[id]; for (let i = S.log.length - 1; i >= 0; i--) { const l = S.log[i]; if (l.id === id || l.id === "pg:" + m.name || l.id === "pg:" + m.name + " · vérification") return l.t; } return 0; }
// jours où l'on a travaillé sur un bras : 4 par semaine au plus, jamais 3 de suite (épaule et poignet d'appui)
function onearmOk(){ const names = new Set(SEC.onearm.ms.map(m => "pg:" + m.name)), d = new Set(S.log.filter(l => names.has(l.id) || (MS[l.id] && MS[l.id].sec === "onearm")).map(l => dayKey(l.t)));
  const ago = k => { const x = new Date(); x.setDate(x.getDate() - k); return dayKey(x); };
  if (d.has(ago(1)) && d.has(ago(2))) return false; let n = 0; for (let k = 1; k <= 6; k++) if (d.has(ago(k))) n++; return n < 4 || d.has(ago(0)); }
// trois jours d'entraînement de suite : le lendemain, on récupère (mobilité, poignets)
function plancheDays(){ const names = new Set(SEC.planche.ms.map(m => "pg:" + m.name)), since = (() => { const x = new Date(); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - 6); return x.getTime(); })(), today = dayKey(Date.now());
  return new Set(S.log.filter(l => l.t >= since && dayKey(l.t) !== today && (names.has(l.id) || /^pl_/.test(l.id) || /^pg:Planche/i.test(l.id))).map(l => dayKey(l.t))).size; }
function needRest(){ const names = new Set(Object.values(MS).map(m => "pg:" + m.name)), days = new Set(S.log.filter(l => MS[l.id] || names.has(l.id)).map(l => dayKey(l.t)).concat(S.zw || [])), ago = k => { const x = new Date(); x.setDate(x.getDate() - k); return dayKey(x); };
  return !days.has(ago(0)) && days.has(ago(1)) && days.has(ago(2)) && days.has(ago(3)); }
function forceDays(){ const byName = {}; Object.values(MS).forEach(m=>{ byName["pg:" + m.name] = m.id; byName["pg:" + m.name + " · vérification"] = m.id; });
  const out = new Set(S.log.filter(l=>FORCE(MS[l.id] ? l.id : byName[l.id] || "") || /^pg:Planche/i.test(l.id)).map(l=>dayKey(l.t))); (S.zf || []).forEach(d => out.add(d)); return out; }
function forceOk(){ const fd = forceDays(), d = new Date(); d.setDate(d.getDate() - 1); if (fd.has(dayKey(d))) return false;
  let n = 0; const w = new Date(); w.setDate(w.getDate() - todayIdx()); for (let i = 0; i < 7; i++) { const x = new Date(w); x.setDate(w.getDate() + i); if (fd.has(dayKey(x))) n++; }
  return n < 3 || fd.has(dayKey(Date.now())); }
// une semaine légère toutes les cinq : moins de séries, pas de tentative à fond (tendons et poignets récupèrent)
// la semaine qui suit une décharge : pas de détection de plateau (les tentatives à fond viennent de reprendre)
// Semaine légère : après 16 séances et 4 semaines au moins depuis la précédente (plus selon le calendrier). Un arrêt de 7 jours remet le compteur à zéro.
let dlMemo = null;
function dlState(){ const now = Date.now(), key = dayKey(now) + "|" + S.log.length; if (dlMemo && dlMemo[0] === key) return dlMemo[1];
  if (!S.t0) S.t0 = S.log.length ? S.log[0].t : now;
  const D = S.dlw || (S.dlw = {end:S.t0}); let r = "";
  if (D.start && now - D.start < 7 * 864e5) r = "on";
  else { if (D.start) { D.end = D.start + 7 * 864e5; delete D.start; }
    const days = []; let lastK = ""; S.log.forEach(l => { if (l.t > D.end) { const k = dayKey(l.t); if (k !== lastK) { lastK = k; days.push(l.t); } } });
    let n = 0; days.forEach((t, q) => { n = q && t - days[q - 1] >= 7 * 864e5 ? 1 : n + 1; }); if (days.length && now - days[days.length - 1] >= 7 * 864e5) n = 0;
    if (n >= 16 && now - D.end >= 28 * 864e5) { D.start = now; r = "on"; } else if (D.end > S.t0 && now - D.end < 7 * 864e5) r = "after"; }
  dlMemo = [key, r]; return r; }
const afterDeload = () => dlState() === "after", deloadWeek = () => dlState() === "on";
// retour après 7 jours sans séance : une séance de reprise à 70 %
function comeback(){ const today = dayKey(Date.now()); for (let q = S.log.length - 1; q >= 0; q--) if (dayKey(S.log[q].t) !== today) return Date.now() - S.log[q].t >= 7 * 864e5; return false; }
// durée estimée d'une séance (s) : travail + repos de chaque série
const estSecs = blocks => blocks.reduce((t, b) => t + b.sets.reduce((u, s) => u + (s.rest || 20) + (s.goal && b.kind === "hold" ? s.goal : s.dur ? s.dur * (s.sides ? 2 : 1) : 25), 0), 0);
// le temps choisi est respecté : on retire des séries (d'abord aux exercices d'accompagnement, puis aux figures) jusqu'à tenir dedans
function fitTime(blocks, mins){
  const cap = mins * 60 * 1.1; let guard = 300;
  while (estSecs(blocks) > cap && guard--) {
    const cut = (pool, min) => { const b = pool.filter(b => b.sets.filter(s => !s.max).length > min).sort((a, c) => c.sets.length - a.sets.length)[0];
      if (!b) return false; const i = b.sets.map(s => !s.max).lastIndexOf(true); b.sets.splice(i, 1); return true; };
    { const pool = blocks.filter(b => !b.ms && !b.keep && b.name !== DRILLS.poignets.name && b.sets.length > (["biceps","bandpl"].includes(b.dk) ? 2 : 1)); if (cut(pool, 0)) continue; }
    { const att = blocks.filter(b => b.ms && FREE(MS[b.ms]) && b.sets.length > 8)[0]; if (att) { att.sets.splice(-1, 1); continue; } }   // équilibre : 8 essais suffisent
    { const dI = blocks.map((b, i) => !b.ms && !b.keep && b.name !== DRILLS.poignets.name && b.dk !== "biceps" ? i : -1).filter(i => i >= 0).pop(); if (dI != null) { blocks.splice(dI, 1); continue; } }
    { const fb = blocks.filter(b => b.ms && b.sets.filter(s => !s.max).length > (b.sets[0] && b.sets[0].lab === "essai" ? 5 : /^pl_/.test(b.ms) || SIDED.has(b.ms) ? 4 : 3)).slice(-1)[0];   // on coupe d'abord la dernière figure (la force), pas l'équilibre
      if (fb) { for (let q = 0; q < (SIDED.has(fb.ms) ? 2 : 1); q++) fb.sets.splice(fb.sets.map(s => !s.max).lastIndexOf(true), 1); continue; } }
    const mx = blocks.filter(b => b.ms && !b.confirm && !FREE(MS[b.ms]) && b.sets.filter(s => s.max).length > (b.ms === "pl_1leg" ? 6 : /^pl_/.test(b.ms) ? 3 : MS[b.ms].sec === "onearm" ? 4 : SIDED.has(b.ms) ? 2 : 1)).slice(-1)[0]; if (mx) { const k = SIDED.has(mx.ms) ? 2 : 1; for (let q = 0; q < k; q++) mx.sets.splice(mx.sets.findIndex(s => s.max), 1); continue; }
    // dernier recours : l'équilibre descend à 6 essais
    { const att = blocks.filter(b => b.ms && FREE(MS[b.ms]) && b.sets.length > 6)[0]; if (att) { att.sets.splice(-1, 1); continue; } }
    break; }
  return blocks;
}
// repos entre séries de planche : il augmente avec la difficulté
const PL_REST = {pl_strHs:240, pl_hsDown:210, pl_halfPress:240, pl_press:240, pl_fullNeg:240, pl_lean2:90, pl_tuckP:120, pl_tuckPu:120, pl_tuckO:120, pl_strBand:150, pl_strBandL:150, pl_strNar:180, pl_half:180, pl_fullBand:180, pl_lean:90, pl_ppp:90, pl_tuck:120, pl_adv:150, pl_frog:150, pl_1leg:150, pl_straddle:180, pl_full:180, pl_pike:150};
function builtinBlocks(){
  // météo du corps : fatigué·e, séance courte et sans tentative à fond ; raide, de la mobilité en plus
  const mood = moodToday(), tired = mood === "fatigue";
  const deload = deloadWeek();
  const mins = S.mins || 30, PS = painState(), pain = PS.phase === 1, armPain = pain && ["epaule","coude"].includes(PS.zone), nMs = tired || mins <= 15 ? 1 : mins <= 30 ? 2 : 3;
  const red = Math.min(tired ? 0.6 : 1, deload ? 0.6 : 1, PS.ease, comeback() ? 0.7 : 1), scale = Math.max(0.6, Math.min(1.5, mins / 30)) * red;   // fatigue, décharge, douleur : on garde la réduction la plus forte, sans les cumuler
  // jour de récupération après 3 jours d'entraînement de suite

  // douleur au poignet : 48 h sans appui sur les mains, on travaille le reste
  if (pain && PS.zone === "poignet") return ["hollow","epaules","pike","pancake"].map(k=>drillBlock(k, false));
  if (needRest() && !(S.bday && S.bday.d === dayKey(Date.now()))) return ["poignets","epaules","hollow","pancake"].map(k=>drillBlock(k, false));
  const open = GOALS[0].ms.filter(id=>!st(id).done && !msLocked(MS[id]) && !(BAND_STEPS.has(id) && !(S.equip || {}).band) && !(armPain && (/^(oa_|pl_|pr_|ul_)/.test(id) || id === "in_hspu"))), fok = forceOk() && !armPain;   /* épaule ou coude : ni un bras, ni planche, ni montées pendant l'éviction */
  // choix du jour : l'équilibre (une habileté) et, les jours de force, une place réservée à la force
  const dn = Math.floor(Date.now() / 864e5), oaOk = onearmOk(), fConf = fok && (S.confirm || []).some(id => MS[id] && FORCE(id)) ? 1 : 0;   // une vérification de force compte dans le plafond de 2
  // rotation : la première figure ouverte de chaque discipline (équilibre, un bras, compression, planche, montées),
  // celle travaillée il y a le plus longtemps passe en premier — aucune discipline n'étouffe les autres
  const disc = id => /^oa_/.test(id) ? "oa" : /^pl_/.test(id) ? "pl" : /^pr_(lsit|stradL|pikeLift|stradLift|vsit|vsitC|extSup)$/.test(id) ? "comp" : /^pr_/.test(id) ? "pr" : /^ul_/.test(id) ? "ul" : "eq";
  const cand = open.filter(id => !FORCE(id) && (oaOk || !/^oa_/.test(id))), heads = [], seen = new Set();
  cand.forEach(id => { const d = disc(id); if (!seen.has(d)) { seen.add(d); heads.push(id); } });
  // retard d'une figure = jours depuis son dernier travail, rapportés à son rythme cible (équilibre et un bras 3 j, compression et force 4 j)
  const late = id => (Date.now() - (lastWorked(id) || Date.now() - 30 * 864e5)) / 864e5 / (/^(eq|oa)$/.test(disc(id)) ? 3 : 4);
  // les plus en retard d'abord, une figure par discipline ; une figure laissée plus de 10 jours passe d'office, même si sa discipline est déjà servie
  const byLate = cand.slice().sort((a, b) => late(b) - late(a)); let nonF = []; { const got = new Set();
    byLate.forEach(id => { const d = disc(id), over = (Date.now() - lastWorked(id)) / 864e5 > 10 && lastWorked(id) > 0; if (!got.has(d) || over) { got.add(d); nonF.push(id); } });
    nonF = nonF.concat(byLate.filter(id => !nonF.includes(id))); }
  // force : la planche passe en priorité 2 jours sur 3 ; sinon la figure de force travaillée le moins récemment
  const F = open.filter(FORCE).sort((a, b) => lastWorked(a) - lastWorked(b)), plF = F.filter(id => /^pl_/.test(id)), npF = F.filter(id => !/^pl_/.test(id)), plOk = plancheDays() < 2 && plF[0], pickF = (plOk && (!npF.length || late(plF[0]) >= late(npF[0]) * 0.6) && plF[0]) || npF[0] || (plOk ? plF[0] : null) || F[0];   /* la planche garde la priorité, sauf quand une autre figure de force a pris trop de retard */   /* planche 2 jours sur les 7, les montées le 3e */   // la planche 3 jours sur 7, le reste de la force ensuite
  let next;
  if (fok && pickF && !fConf && !tired) next = nMs === 1 ? (dn % 2 || !nonF.length ? [pickF] : [nonF[0]]) : nonF.slice(0, nMs - 1).concat([pickF]);
  else next = nonF.slice(0, nMs);
  // séance longue : une deuxième figure de force d'une autre famille, si elle attend depuis plus de 4 jours (2 par jour au plus)
  if (fok && pickF && !fConf && !tired && nMs >= 3 && next.includes(pickF)) { const f2 = F.find(id => id !== pickF && !/^pl_/.test(id) && disc(id) !== disc(pickF) && late(id) > 1); if (f2) next = [next[0], f2, pickF]; }
  if (next.length < nMs) next = next.concat((fok && !tired ? F : []).filter(id => !next.includes(id) && !(/^pl_/.test(id) && (plancheDays() >= 2 || next.some(x => /^pl_/.test(x))))).slice(0, Math.max(0, 2 - fConf - next.filter(FORCE).length))).slice(0, nMs);   // 2 figures de force par jour au plus
  // rien d'ouvert aujourd'hui (un bras au repos, pas de force) : séance de mobilité plutôt qu'une page vide
  if (!next.length && !(S.confirm || []).some(id => MS[id] && (fok || !FORCE(id)))) return ["poignets","epaules","pike","pancake","hollow"].map(k=>drillBlock(k, false));
  // combo : un seul par jour, en tout début de séance (frais) ; ces jours-là, le travail sur un bras est écourté
  { const u = next.filter(id => /^ul_/.test(id)); if (u.length) next = [u[0]].concat(next.filter(id => !/^ul_/.test(id))); }
  const ulDay = next.some(id => /^ul_/.test(id));
  next.forEach(checkPlateau);
  const nDr = mins <= 15 ? 1 : mins <= 30 ? 2 : mins <= 45 ? 3 : 4;
  const blocks = next.map(id=>{ const m = MS[id], pl = planFor(m).n, base = {name:m.name, how:DETAILS[id] && DETAILS[id].how ? DETAILS[id].how.slice(0, 2).join(" ") : m.desc, ms:id, yt:m.yt && m.yt[0] ? m.yt[0][0] : undefined};
    const plR = /^pl_/.test(id) && m.type === "reps", sets = plR ? Math.min(5, Math.max(3, Math.round(pl.sets * scale))) : Math.max(3, Math.round(pl.sets * scale)), tries = pain || PS.phase === 2 || tired || deload ? 0 : plR ? Math.min(1, pl.tries || 0) : pl.tries || 0;
    if (pl.attempts) return Object.assign(base, {kind:"hold", note:pl.sides ? "Alterne gauche et droite à chaque essai, en commençant par ton côté faible." : undefined,
      sets:Array.from({length:pl.sides ? Math.min(ulDay || next.some(FORCE) ? 12 : 16, sets * 2) : sets}, ()=>({goal:pl.T, rest:pl.rest || 30, max:true}))});
    if (m.type === "check") return Object.assign(base, {kind:"reps", note:/^ul_/.test(id) ? "Une réussite par séance suffit : il en faut sur 3 séances, à 2 jours d'écart au moins." : "Réussis-la 3 fois dans la séance, deux jours différents, pour la valider.", sets:Array.from({length:/^ul_/.test(id) ? 4 : /^pr_/.test(id) ? 6 : Math.max(5, Math.min(sets, 8))}, ()=>({reps:1, lab:"essai", rest:/^ul_/.test(id) ? 180 : /^pr_/.test(id) ? 120 : 45}))});   /* montées : 6 essais, repos complet */
    const pr = /^pl_/.test(id), short = pr && (m.target || 0) <= 20; // planche : bras tendus, on récupère complètement (moins long sur les tenues courtes)
    if (id === "pl_fullNeg") base.note = "Descente de 3 s au moins, sinon elle ne compte pas.";
    if (pl.sides) base.note = "Alterne le côté à chaque série (séries paires d'un côté, impaires de l'autre) : les deux doivent tenir la cible.";
    return Object.assign(base, {kind:m.type, sets:Array.from({length:pl.sides ? (/^pl_/.test(id) ? sets * 2 : 2 * Math.ceil(sets / 2)) : sets}, ()=>({goal:pl.work, rest:pr ? (PL_REST[m.id] || 150) : /^pr_/.test(m.id) && m.type === "reps" && !/Lift$/.test(m.id) ? (/Neg|negS|halfSt/.test(m.id) ? 120 : 150) : /Lift$/.test(m.id) ? 45 : m.sec === "base" ? 45 : m.id === "oa_wall" ? 90 : m.sec === "onearm" && m.type === "reps" ? 60 : 75, auto:true})).concat(Array.from({length:pl.sides ? tries * 2 : tries}, ()=>({goal:pl.T, rest:pl.sides ? 90 : pr ? 180 : 120, max:true})))}); });
  // figures validées au bilan sur simple déclaration : on vérifie la sortie de secours en pratique
  // figures déclarées au bilan : on vérifie en vrai (2 par séance au plus) ; tenues et répétitions sont mesurées
  const conf = (tired || deload || PS.phase ? [] : S.confirm || []).filter(id=>MS[id] && (fok || !FORCE(id))).slice(0, 2).map(id=>{ const m = MS[id], base = {name:m.name + " · vérification", how:"Déclarée à ton bilan : montre-la pour la confirmer. Si l'essai ne passe pas, elle repasse à travailler.", ms:id, confirm:true};
    return m.type === "check" ? Object.assign(base, {kind:"reps", sets:Array.from({length:3}, ()=>({reps:1, lab:"essai", rest:45}))})
      : Object.assign(base, {kind:m.type, sets:Array.from({length:2}, ()=>({goal:m.target, rest:m.type === "hold" ? 120 : 90, max:true}))}); });
  if (!next.length && !conf.length) return blocks;
  const lists = next.slice().sort((a, b) => (FORCE(b) ? 1 : 0) - (FORCE(a) ? 1 : 0)).map(id => drillsFor(MS[id]).filter(k => !(k === "oawall" && next.includes("oa_wall")))), dr = [];
  if (next.some(id => /^pl_/.test(id)) && (fok || !next.some(FORCE))) dr.push("biceps");   // le tendon du biceps se prépare dès qu'on travaille la planche
  for (let r = 0; r < 6; r++) lists.forEach(l => { const k = l[r]; if (k && !dr.includes(k)) dr.push(k); });
  const mob = mood === "raide" ? ["epaules","pike"].filter(k=>!dr.includes(k)).map(k=>drillBlock(k, pain)) : [];
  // Postures « Poignets » ou « Contrôle » aujourd'hui ou hier : les poignets ont déjà travaillé, préparation raccourcie
  const zw = S.zw || [], wristDone = [0, 1].some(k => { const x = new Date(); x.setDate(x.getDate() - k); return zw.includes(dayKey(x)); });
  // semaine légère : vraiment plus courte, un exercice d'accompagnement de moins, rien de lesté
  const drs = dr.filter(k => !((deload || PS.phase) && DRILLS[k].eq === "kg")).slice(0, tired ? 1 : deload ? Math.max(1, nDr - 1) : nDr);
  // préparation ciblée, juste après les poignets et jamais coupée : épaules en extension avant la manna, biceps et appui penché avant la planche
  const prepB = (k, n, v) => { const b = drillBlock(k, false); b.sets = b.sets.slice(0, n); if (v) b.sets.forEach(s => { if (s.dur) s.dur = v; }); b.keep = true; b.name += " · préparation"; return b; };
  const prep = []; if (next.some(id => /^pr_(manna|vsitH|extSup)|^ul_c3|^ul_full/.test(id))) prep.push(prepB("extEp", 2));
  if (next.some(id => /^pl_/.test(id))) prep.push(prepB("lean", 2, 15), prepB("biceps", 1));
  // antagonistes, les jours de force : tirage et, en alternance, rotateurs externes ou extenseurs du poignet (à l'élastique)
  const anta = (S.equip || {}).band && next.some(FORCE) && !pain ? ["tirage", dn % 2 ? "rotext" : "extpoig"].map(k => { const b = drillBlock(k, mins <= 30); b.keep = true; return b; }) : [];
  // entretien : une figure validée laissée plus de 10 jours revient pour 2 essais à 70 % (l'équilibre droit, puis la plus récente de chaque discipline)
  const keepUp = []; if (!pain && !tired && !deload && PS.phase !== 2) { const pool = ["in_str60"].concat(["onearm","planche","press"].map(sid => SEC[sid].ms.filter(m => st(m.id).done && m.type === "hold" && !SIDED.has(m.id) && !m.alt).map(m => m.id).pop())).filter(id => id && st(id).done && !next.includes(id));
    const lastK = id => { const n = "pg:" + MS[id].name; for (let q = S.log.length - 1; q >= 0; q--) { const l = S.log[q]; if (l.id === id || l.id === n || l.id === n + " · entretien") return l.t; } return 0; };
    const id = pool.filter(id => Date.now() - lastK(id) > 10 * 864e5).sort((a, b) => lastK(a) - lastK(b))[0];
    if (id) { const m = MS[id]; keepUp.push({name:m.name + " · entretien", kind:"hold", how:"Figure acquise : deux essais tranquilles pour la garder. " + m.desc, keep:true, sets:Array.from({length:2}, () => ({dur:Math.max(3, Math.round(m.target * 0.7)), rest:60}))}); } }
  const BAD = armPain ? new Set(["lean","pseudo","dipsW","pushW","bandpl","oawall","oashrug","appuiArr","extEp","protrac","biceps"]) : new Set();
  return fitTime([drillBlock("poignets", pain || wristDone)].concat(prep, keepUp, mob, conf, blocks, drs.filter(k => !BAD.has(k) && !(k === "extEp" && prep.length && prep[0].dk === "extEp")).map(k=>drillBlock(k, pain || deload)), anta), deload ? Math.max(10, Math.round(mins * 0.6)) : mins);
}
const PGROUPS = [
  ["Parcours", id => id === "equilibre"],
  ["Full planche", id => id === "planche-domination"],
  ["Autres programmes de planche", id => /^planche-/.test(id)],
  ["Souplesse", id => /^etirements/.test(id)],
  ["Secondaire · Montées en force", id => id === "quest-for-the-press"],
  ["Autres", id => true],
];
const allP = () => Object.assign({equilibre:builtin(), detente:zenP()}, PS);
// Un programme s'ouvre quand le parcours y mène : on ne propose pas la planche à quelqu'un qui apprend à monter au mur.
// Renvoie null si le programme est accessible, sinon ce qu'il faut valider d'abord.
const needMs = ids => { const miss = ids.filter(id=>!st(id).done); return miss.length ? miss.map(id=>MS[id].name + (MS[id].target ? " " + goalTxt(MS[id]) : "")).join(" + ") : null; };
function progLock(id){
  if (id === "equilibre" || id === "detente" || id === "etirements-debutant") return null;
  if (id === "etirements-avance") return cnt().stretch >= 10 ? null : "10 séances d'étirements (" + cnt().stretch + " faites)";
  if (id === "planche-domination" || id === "planche-master-n1") return needMs(MS.pl_lean.req);
  if (id === "quest-for-the-press") return needMs(MS.pr_straddle.req);
  if (id === "planche-master-n2") return needMs(["pl_tuck"]);
  if (id === "planche-master-n3" || id === "planche-routine") return needMs(["pl_adv"]);
  return null;
}
// Dans Planche Domination, chaque étape s'ouvre quand la figure de l'étape précédente est validée.
const PD_STEPS = ["pl_lean","pl_tuck","pl_adv","pl_adv","pl_1leg","pl_straddle"];   // figure à valider pour ouvrir l'étape suivante du programme
const stepLock = (pid, i) => pid === "planche-domination" && i > 0 ? needMs([PD_STEPS[i - 1]]) : null;
const pickP = () => { const all = allP(); P = all[pg().cur]; if (!P) P = all.equilibre; else if (progLock(P.id)) { P = all.equilibre; pg().cur = "equilibre"; }
  const s = pp(); while (s.step > 0 && stepLock(P.id, s.step)) s.step--; };
const pp = () => pg().by[P.id] || (pg().by[P.id] = {step:0});
const pStep = () => P.steps[Math.min(pp().step, P.steps.length - 1)];
const wkKey = di => { const d = new Date(nowS()); d.setDate(d.getDate() - todayIdx()); return dayKey(d) + "|" + P.id + "|" + pp().step + "|" + DAYK[di]; };
const wkGet = di => pg().wk[wkKey(di)] || {};
const pDay = di => {
  const stp = pStep(), d = stp.days[DAYK[di]] || {type:"rest", blocks:[]};
  if (!d.routine) return Object.assign({blocks:[]}, d);
  const R = (P.routines || {})[d.routine] || {blocks:[]};
  return {type:d.type, name:R.name, equip:R.equip, blocks:R.blocks || [], scale:stp.scale || 1, routine:true, circuit:R.circuit, tips:R.tips, drive:R.drive, info:R.info};
};
const unit = b => b.kind === "hold" ? " s" : " rép.";
const fixed = s => s.dur != null || s.reps != null;
const sDur = (s, sc) => Math.max(5, Math.round(s.dur * (sc || 1)));
const sRun = (s, sc) => s.durMax ? Math.max(5, Math.round(s.durMax * (sc || 1))) : sDur(s, sc);
const fixTxt = (b, s, sc) => s.lab ? s.lab : (s.dur != null ? (s.durMax ? sDur(s, sc) + " à " + sRun(s, sc) + " s" : durTxt(sDur(s, sc))) : s.reps + (s.repsMax ? " à " + s.repsMax : "") + " rép.") + (s.sides ? " par côté" : "");
// « 45 s », « 5 min », « 1 min 30 »
const durTxt = n => n < 60 ? n + " s" : Math.floor(n/60) + " min" + (n % 60 ? " " + (n % 60) : "");
const restTxt = s => !s.rest ? "libre" : s.rest % 60 ? s.rest + (s.restMax ? " à " + s.restMax : "") + " s" : (s.rest/60) + (s.restMax ? " à " + (s.restMax/60) : "") + " min";
const pTarget = (b, s) => { if (s.goal) return s.goal; const best = pg().best[b.name]; return best ? Math.max(1, Math.round(best * (s.pct || 100) / 100)) : 0; };
const extLink = (href, txt) => { const a = el("a","lk",txt); a.href = href; a.target = "_blank"; a.rel = "noopener"; return a; };
const ytLink = (id, txt) => extLink("https://www.youtube.com/watch?v=" + id, txt);
const drv = id => "https://drive.google.com/file/d/" + id + "/view";
const vidLink = b => b.yt ? ytLink(b.yt, "Vidéo") : b.url ? extLink(b.url, "Vidéo") : b.drive ? extLink("https://drive.google.com/file/d/" + b.drive + "/view", "Vidéo") : null;

// Programmes chiffrés publiés avec l'app
const normPass = s => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
async function decProg(o, pass){
  const b = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({name:"PBKDF2", salt:b(o.salt), iterations:o.iter, hash:"SHA-256"}, km, {name:"AES-GCM", length:256}, false, ["decrypt"]);
  return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:"AES-GCM", iv:b(o.iv)}, key, b(o.ct))));
}
// Renvoie "ok", "code" (phrase refusée) ou "net" (pas de réseau / rien de publié).
async function loadRemote(pass){
  let idx; try { const r = await fetch("programs/index.json", {cache:"no-cache"}); if (!r.ok) throw 0; idx = await r.json(); } catch(e){ return "net"; }
  let changed = false;
  for (const e of idx){
    if (PS[e.id] && PS[e.id]._v === e.v) continue;
    let o; try { const r = await fetch(e.file, {cache:"no-cache"}); if (!r.ok) throw 0; o = await r.json(); } catch(err){ return "net"; }
    let d; try { d = await decProg(o, pass); } catch(err){ return "code"; }
    if (d && d.format === "hs-program/1" && Array.isArray(d.steps)) { d._v = e.v; PS[d.id] = d; changed = true; }
  }
  if (changed) savePS();
  try { localStorage.setItem(PPASS, pass); } catch(e){}
  return "ok";
}

// Lexique : vocabulaire général de la gymnastique au poids du corps, pour lire les noms d'exercices.
const LEX = [
  ["Planche","Figure où le corps tient à l'horizontale, uniquement sur les mains, bras tendus. Ne pas confondre avec « plank », le gainage."],
  ["Plank","Gainage : position de pompe (bras tendus) ou sur les avant-bras, corps aligné, tenue sans bouger."],
  ["Lean (planche lean, plank lean)","Position de pompe où l'on avance les épaules loin devant les mains. Plus on avance, plus c'est dur : c'est le premier pas vers la planche."],
  ["Tuck","Groupé : genoux repliés contre la poitrine. C'est la planche la plus facile, parce que le corps est ramassé près des mains."],
  ["Advanced tuck","Groupé dos plat : les hanches montent à hauteur des épaules, les genoux s'éloignent de la poitrine."],
  ["Straddle","Jambes tendues et écartées. Écarter rapproche le poids des mains, donc allège la figure."],
  ["Pike","Hanches fléchies, jambes tendues : le corps forme un V."],
  ["Full","La figure complète : jambes tendues et serrées."],
  ["Hold, static hold, iso","Maintien : on tient la position sans bouger, pendant un temps donné."],
  ["Push up","Pompe. « Pseudo », « lean » ou « planche » push up : pompe avec les épaules en avant des mains."],
  ["Press","Mouvement fait bras tendus, où ce sont les épaules qui travaillent : avancer, monter le bassin, ou monter en équilibre."],
  ["Negative","La phase de descente seule, faite lentement."],
  ["Scapula, protraction, rétraction","Les omoplates. Protraction : on les écarte en arrondissant le haut du dos, comme pour repousser le sol. Rétraction : on les rapproche. En planche, on reste en protraction."],
  ["Hollow body","Position « en cuillère » : dos légèrement rond, abdos serrés, bassin basculé. La base du gainage en gymnastique."],
  ["L-sit","Équerre : en appui sur les mains, jambes tendues à l'horizontale devant soi."],
  ["Handstand","Équilibre sur les mains."],
  ["Headstand","Équilibre sur la tête, en appui sur la tête et les mains ou les avant-bras."],
  ["Straddle press, pike press, tuck press","Montées en force vers l'équilibre, sans élan : jambes écartées (la plus accessible), jambes tendues serrées (la plus dure), ou genoux groupés."],
  ["Float, hover","Flotter : les pieds quittent le sol sans élan, portés par les épaules et les abdos. Hover : tenir ce flottement."],
  ["Toe taps","En appui sur les mains, bassin haut : décoller les pieds puis reposer seulement les orteils, par petites touches."],
  ["Crane, crow","Posture de la grue ou du corbeau : mains au sol, genoux posés sur l'arrière des bras, pieds décollés. Bras tendus (crane) ou fléchis (crow)."],
  ["Drill","Exercice éducatif : un geste simplifié qui prépare la figure."],
  ["Core","La sangle abdominale : abdos, lombaires et muscles profonds du tronc."],
  ["Block, props","Brique de yoga ; plus largement, les accessoires (chaise, briques, mur)."],
  ["Elastic band, banded","Élastique passé autour des hanches ou sous les pieds, accroché en hauteur : il porte une partie du poids et rend la figure accessible."],
  ["Parallettes","Petites barres parallèles posées au sol : poignets droits, moins de contrainte."],
  ["Try-out","Tentative : on essaie la figure visée, même si on ne la tient que quelques secondes."],
  ["80 % / 100 %","Intensité de la série par rapport à ton maximum sur l'exercice. 100 % : tu vas à ton record. 80 % : tu t'arrêtes avant."],
  ["Circuit, tour (cycle)","Les exercices s'enchaînent sans pause ; on se repose seulement à la fin du tour, puis on recommence."],
  ["Grease the groove","« Graisser le sillon » : beaucoup de petites séries faciles réparties dans la journée, jamais jusqu'à l'épuisement, pour ancrer le geste."],
  ["TUT (time under tension)","Temps sous tension : on ralentit chaque phase du mouvement selon un tempo donné."],
  ["ROM (range of motion)","Amplitude : faire le mouvement en entier."],
  ["PNF","Technique d'étirement : contracter le muscle étiré 10 s, relâcher 5 s, puis aller un peu plus loin."],
];
function renderSess(){
  pickP();
  const box = $("sess"); box.textContent = "";
  { // en-tête repliable : la séance du jour en une ligne
    const tg = $("sessToggle"), open = !!S.sessOpen, d0 = pDay(todayIdx()), tot = d0.blocks.reduce((n,b)=>n + b.sets.length, 0), dn = Object.keys(wkGet(todayIdx())).length;
    tg.textContent = ""; const g = el("span","grow");
    g.append(el("div","t", "Détail de la séance"));
    tg.append(g, icon("chev","chev")); tg.setAttribute("aria-expanded", open); box.hidden = !open;
    tg.onclick = () => { S.sessOpen = !S.sessOpen; save(); renderSess(); };
  }
  const head = el("div","block"); head.style.border = "0"; box.append(head);
  const passForm = () => { const w = el("div");
    w.append(el("div","mut","Tes programmes (planche, étirements) ne sont pas encore sur cet appareil. Saisis ta phrase d'accès : ils sont téléchargés, déverrouillés, puis conservés dans ce téléphone."));
    const f = el("form"), inp = el("input"), msg = el("div","mut"), b = el("button","btn","Charger mes programmes");
    inp.type = "text"; inp.autocapitalize = "none"; inp.autocomplete = "off"; inp.spellcheck = false; inp.setAttribute("aria-label","Phrase d'accès aux programmes"); inp.className = "pass";
    b.type = "submit"; msg.style.marginTop = "10px";
    f.onsubmit = async e => { e.preventDefault(); const pass = normPass(inp.value); if (!pass) return;
      b.disabled = true; msg.textContent = "Chargement…";
      const r = await loadRemote(pass); b.disabled = false;
      if (r === "ok" && Object.keys(PS).length) { save(); render(); }
      else msg.textContent = r === "code" ? "Phrase incorrecte." : "Impossible de joindre les programmes. Vérifie ta connexion et réessaie."; };
    f.append(inp, b, msg); w.append(f); return w; };
  const step = pStep(), all = allP(), left = new Set(Object.keys(all));
  head.append(el("div","lab","Programme" + (P.author ? " · " + P.author : "")));
  const ps = el("select"); ps.setAttribute("aria-label","Programme"); ps.className = "big";
  PGROUPS.forEach(([label, test])=>{ const ids = [...left].filter(test); if (!ids.length) return;
    const og = document.createElement("optgroup"); og.label = label;
    ids.forEach(id=>{ left.delete(id); const lock = progLock(id), o = new Option(all[id].name + (lock ? " · verrouillé" : ""), id); o.disabled = !!lock; og.append(o); }); ps.append(og); });
  ps.value = P.id;
  ps.onchange = () => { pg().cur = ps.value; save(); render(); };
  head.append(ps);
  const sel = el("select"); sel.setAttribute("aria-label","Étape du programme");
  P.steps.forEach((s,i)=>{ const lock = stepLock(P.id, i), o = new Option(s.name + (lock ? " · verrouillée" : s.goals && s.goals.length ? " · " + s.goals[0].name + " " + s.goals[0].target : s.scale && s.scale < 1 ? " · semaine allégée" : ""), i); o.disabled = !!lock; sel.add(o); });
  sel.value = Math.min(pp().step, P.steps.length - 1);
  sel.onchange = () => { pp().step = +sel.value; save(); render(); };
  head.append(sel);
  if (step.goals && step.goals.length) { const g = el("div","mut","Pour passer à l'étape suivante : " + step.goals.map(g=>g.name + " " + g.target).join(" · ")); g.style.marginTop = "10px"; head.append(g); }

  const wk = el("div","wk");
  DAYK.forEach((k,i)=>{
    const d = pDay(i), tot = d.blocks.reduce((n,b)=>n + b.sets.length, 0), dn = Object.keys(wkGet(i)).length;
    const b = el("button", (tot ? "tr" : "") + (i === todayIdx() ? " today" : "") + (i === selDay ? " on" : ""));
    b.setAttribute("aria-label", DAYN[i]); b.setAttribute("aria-pressed", i === selDay);
    b.append(el("b",null,DAYL[i]), el("small",null, !tot ? "" : dn >= tot ? "fait" : dn ? dn + "/" + tot : "·"));
    b.onclick = () => { selDay = i; renderSess(); };
    wk.append(b);
  });
  head.append(wk);

  const day = pDay(selDay), vals = wkGet(selDay);
  const dh = el("div","blk"); dh.style.borderTop = "0"; dh.style.paddingTop = "4px";
  dh.append(el("h2",null,DAYN[selDay] + (selDay === todayIdx() ? ", aujourd'hui" : "")));
  const info = !day.blocks.length ? (day.type === "rest" && !P.routines ? "Récupération active : mobilité, étirements, marche. Pas de travail de force." : day.type === "rest" ? "Jour de repos dans ce programme." : "Rien de prévu ce jour-là dans ce programme.")
    : day.circuit ? day.name + ". Circuit : " + day.circuit.rounds + " tours, les exercices s'enchaînent, repos " + restTxt(day.circuit) + " entre les tours."
    : day.routine ? day.name + (day.scale < 1 ? " · durées réduites cette semaine" : "") + ". Touche un exercice pour le lancer ; la suite s'enchaîne toute seule." + (day.equip ? " Matériel : " + day.equip : "")
    : day.type === "gtg" ? "Séries réparties sur la journée, bien espacées, sans aller à l'épuisement."
    : "Touche une série pour lancer le chrono. Le repos démarre tout seul après chaque série.";
  const ih = el("div","mut",info); ih.style.marginTop = "6px"; dh.append(ih);
  if (day.blocks.length && (day.info || step.info)) { const x = el("div","mut",day.info || step.info); x.style.marginTop = "6px"; dh.append(x); }
  if (day.blocks.length && day.drive) dh.append(extLink("https://drive.google.com/file/d/" + day.drive + "/view", "Vidéo de la séance"));
  if (day.blocks.length && day.tips && day.tips.length) { const det = el("details"); det.append(el("summary",null,"Rappels du programme")); const ul = el("ul"); ul.style.cssText = "margin:0;padding-left:18px;font-size:14px;color:var(--mut)"; day.tips.forEach(t=>ul.append(el("li",null,t))); det.append(ul); dh.append(det); }
  box.append(dh);
  day.blocks.forEach((b,bi)=>{
    const c = el("div","blk"), h = el("div","blk-h"), t = el("span","grow"), fx = fixed(b.sets[0]);
    t.append(el("div","t",b.name));
    const best = pg().best[b.name];
    const one = fx && b.sets.length === 1;
    t.append(el("div","mut", one ? [b.pnf ? "PNF" : "", b.muscles].filter(Boolean).join(" · ")
      : fx ? b.sets.length + (day.circuit ? " tours · " : " séries · ") + fixTxt(b, b.sets[0], day.scale)
      : b.sets.length + (b.sets.length > 1 ? " séries" : " série") + (b.sets[0].rest ? " · repos " + restTxt(b.sets[0]) : "") + (best ? " · record " + num(best) + unit(b) : "")));
    if (b.how) t.append(el("div","how",b.how));
    if (b.fr && b.fr !== b.name) t.append(el("div","orig","En français : " + b.fr));
    if (b.terms && b.terms.length) { const det = el("details"); det.append(el("summary",null,"Les termes de ce cours · " + b.terms.length));
      const dl = el("dl","lex"); b.terms.forEach(([k,v])=>dl.append(el("dt",null,k), el("dd",null,v))); det.append(dl); t.append(det); }
    h.append(t); const vl = vidLink(b); if (vl) h.append(vl); c.append(h);
    const row = el("div","sets" + (one ? " one" : ""));
    b.sets.forEach((s,si)=>{
      const v = vals[bi + "-" + si], tg = pTarget(b,s);
      const x = el("button","set" + (v != null ? " dn" : ""));
      if (fx && !one) { x.setAttribute("aria-label", b.name + ", " + (si+1) + " sur " + b.sets.length); x.append(el("span","p", (si+1) + "/" + b.sets.length), el("span","v", v != null ? "fait" : s.lab ? s.lab : s.dur != null ? sDur(s, day.scale) + " s" : "× " + s.reps)); }
      else if (fx) { x.setAttribute("aria-label", b.name); x.append(el("span","v", v != null ? (s.lab ? "Fait" : "Fait · " + fixTxt(b,s,day.scale)) : fixTxt(b,s,day.scale))); }
      else { x.setAttribute("aria-label","Série " + (si+1) + " sur " + b.sets.length);
        x.append(el("span","p", (si+1) + "/" + b.sets.length + (s.pct ? " · " + s.pct + " %" : "")), el("span","v", v != null ? num(v) + unit(b) : tg ? tg + unit(b) : "max")); }
      x.onclick = () => openSet(bi, si);
      row.append(x);
    });
    c.append(row); box.append(c);
  });
  const foot = el("div","blk");
  if (P.links && P.links.length) { const l = el("div"); l.style.cssText = "display:flex;flex-wrap:wrap;gap:4px 18px;margin-bottom:8px"; P.links.forEach(k=>l.append(k.url ? extLink(k.url, k.name) : k.drive ? extLink(drv(k.drive), k.name) : ytLink(k.yt, k.name))); foot.append(l); }
  const lx = el("details"); lx.append(el("summary",null,"Lexique : les termes des programmes"));
  const dl = el("dl","lex"); LEX.forEach(([k,v])=>dl.append(el("dt",null,k), el("dd",null,v))); lx.append(dl); foot.append(lx);
  if (!Object.keys(PS).length) foot.append(passForm());
  const fb = el("div","btns"), bi = el("button","btn line","Importer un fichier"), br = el("button","btn warn","Retirer");
  bi.onclick = () => $("pgFile").click();
  br.onclick = () => { if (confirm("Retirer « " + P.name + " » de cet appareil ? Tes records sont conservés.")) {
    if (P._v) { try { localStorage.removeItem(PPASS); } catch(e){} }
    delete PS[P.id]; savePS(); pg().cur = null; renderSess(); } };
  fb.append(bi); if (!P.builtin) fb.append(br); foot.append(fb); box.append(foot);
}
$("pgFile").onchange = async e => {
  const file = e.target.files[0]; e.target.value = ""; if (!file) return;
  try {
    const d = JSON.parse(await file.text());
    if (!d || d.format !== "hs-program/1" || !d.id || !Array.isArray(d.steps) || !d.steps.length) throw 0;
    PS[d.id] = d; savePS(); pg().cur = d.id; save(); render();
  } catch(err){ alert("Fichier illisible : choisis le fichier de programme (.json) tel qu'il t'a été fourni."); }
};
{ let sp = null; try { sp = localStorage.getItem(PPASS); } catch(e){}
  if (sp) loadRemote(sp).then(r => { if (r === "ok") render(); }); }

// Série en cours : chrono (maintien) ou saisie (répétitions), puis repos automatique.
// Étirement à durée imposée : compte à rebours, changement de côté, puis enchaînement sur le suivant.
let sd = null, sdTimer = null, sdWake = null, AUTO = false, sessRes = {};
// Bilan de départ : on parcourt les figures dans l'ordre ; tu dis ce que tu sais faire, l'app valide et se place au bon jalon.
let plSkip = new Set(), plMiss = 0, plN = 0;
function startPlacement(){ plSkip = new Set(); plMiss = 0; plN = 0; plStep(); $("plDlg").showModal(); }
const SAFE = new Set(["fd_roue","st_bail30","st_bailc2w"]);
function plStep(){
  const id = GOALS[0].ms.find(x=>!st(x).done && !msLocked(MS[x]) && !plSkip.has(x)), box = $("plBody"); box.textContent = "";
  if (!id || plMiss >= 3) { S.placed = true; save(); render();
    const nx = GOALS[0].ms.find(x=>!st(x).done && !msLocked(MS[x])); box.append(el("h2",null,"Bilan terminé"), el("p",null, nx ? (plN <= 3 ? "Bilan terminé en " + plN + " question" + (plN > 1 ? "s" : "") + " : tu démarres par « " + SEC[MS[nx].sec].name + " ». " : "") + "Ton point de départ : « " + MS[nx].name + " ». La séance du jour est prête." : "Tu as tout validé !"));
    const b = el("button","btn","Voir ma séance"); b.onclick = () => { $("plDlg").close(); showTab("today"); window.scrollTo(0,0); }; box.append(b); return; }
  const m = MS[id], L = lvls(m), art = el("div","plart"), sp = el("span","sp"); sp.dataset.pose = poseId(id); sp.dataset.anim = id; sp.dataset.lk = ""; sprPaint(sp, 150); art.append(sp);
  box.append(el("div","lab", "Question " + (++plN) + " · " + SEC[m.sec].name), el("h2",null, m.name), art);
  if (m.desc) box.append(el("p","mut", m.desc));
  const yes = () => { const x = st(id); x.done = true; if (m.target) x.best = Math.max(x.best, m.target); if (SAFE.has(id) || FORCE(id) || m.sec === "onearm") (S.confirm || (S.confirm = [])).push(id); save(); plStep(); };
  const no = (v) => { if (v) { const x = st(id); x.best = Math.max(x.best, v); } plSkip.add(id); plMiss++; save(); plStep(); };
  const q = el("div","plq");
  if (m.type === "hold") { q.append(el("div","mut","Combien de temps tiens-tu cette figure ?"));
    const row = el("div","chips"); [["Pas du tout",0]].concat(L.slice(0, -1).map(v=>["≈ " + v + " s", v])).forEach(([lab,v])=>{ const b = el("button","chip",lab); b.onclick = () => no(v); row.append(b); });
    const ok = el("button","chip", m.target + " s ou plus"); ok.onclick = yes; row.append(ok); q.append(row); }
  else { q.append(el("div","mut","Sais-tu le faire proprement ?")); const row = el("div","chips"), y = el("button","chip on","Oui"), n = el("button","chip","Pas encore"); y.onclick = yes; n.onclick = () => no(0); row.append(y, n); q.append(row); }
  box.append(q);
}
// Fin de séance : la charge de chaque figure s'ajuste aux séries réussies ou ratées, puis à ton ressenti.
function endSession(){
  const ad = S.adapt || (S.adapt = {}), ids = Object.keys(sessRes);
  const light = deloadWeek() || moodToday() === "fatigue" || painRecent();
  ids.forEach(id=>{ const r = sessRes[id], tot = r.ok + r.miss; if (!tot) return; const f0 = ad[id] || 1, up = !light && !lightWeek(id);   // jours allégés : on ne monte pas
    ad[id] = Math.round(Math.max(0.6, Math.min(1.35, r.miss / tot <= 0.25 ? (up ? f0 * 1.05 : f0) : r.miss / tot >= 0.5 ? f0 * 0.92 : f0)) * 100) / 100; });
  if (P && P.zen) { save(); render(); const z = ZEN[pp().step]; if (z && z.free) { zenRate("ok"); return; } $("zfDlg").showModal(); say("Séance terminée. Et la forme ?", true); return; }
  save(); $("fbIds").value = ids.join(","); $("fbDlg").showModal(); $("fbDlg").focus(); say("Séance terminée. Comment tu te sens ?", true);
}
function feedback(kind){
  const ad = S.adapt || (S.adapt = {}), ids = $("fbIds").value.split(",").filter(Boolean), mult = {easy:1, ok:1, hard:0.9, pain:1}[kind];   // la hausse vient déjà des séries réussies : le ressenti ne fait que freiner
  ids.forEach(id=>{ ad[id] = Math.round(Math.max(0.6, Math.min(1.35, (ad[id] || 1) * mult)) * 100) / 100; });
  (S.fb || (S.fb = [])).push({t:Date.now(), k:kind}); if (S.fb.length > 200) S.fb = S.fb.slice(-200);
  if (kind === "pain") { S.pain = Date.now(); painLog().push({t:S.pain, zone:S.painZone || "autre"}); if (S.painLog.length > 50) S.painLog.shift(); }
  sessRes = {}; save(); $("fbDlg").close(); render();
  if (sessVal && MS[sessVal] && st(sessVal).done) { const id = sessVal; sessVal = null; showTab("path"); goHere(id); if (window.A3 || typeof A3 !== "undefined") { try { A3.celebrate(); } catch(e){} } setTimeout(() => { toast("« " + MS[id].name + " » validée !"); quick(id); }, 900); return; }
  toast(kind === "easy" ? "Noté : la prochaine séance sera un peu plus longue." : kind === "hard" ? "Noté : on adoucit la prochaine fois." : kind === "pain" ? (S.painZone === "poignet" ? "Merci d'avoir écouté ton corps. " + (painState().again ? "Deuxième fois en 3 semaines : 7 jours" : "3 jours") + " sans appui sur les mains." : S.painZone === "epaule" || S.painZone === "coude" ? "Noté : " + (painState().again ? "7 jours" : "3 jours") + " sans un bras, planche ni montées. La reprise se fera par paliers." : "Noté : séances allégées, puis reprise par paliers.") + (painState().again ? " Ça revient : montre-le à un kiné." : "") : (sessPR ? "Nouveau record : " + num(sessPR[1]) + sessPR[2] + " en " + sessPR[0] + "." : "Merci pour ce moment. À bientôt."));
}
// Séance guidée : un seul toucher, puis l'app enchaîne décompte, série, repos et exercice suivant.
// la séance du jour est figée dès la première série (guidée ou non) : une figure validée en route ne la recompose pas
function freezeDay(){ if (P && P.builtin && !(S.bday && S.bday.d === dayKey(nowS()))) { S.bday = {d:dayKey(nowS()), blocks:builtinBlocks()}; save(); pickP(); } }
let sessVal = null;   // figure validée pendant la séance : fêtée à la fin, sur le parcours
let sessPR = null;   // record battu pendant la séance, annoncé à la fin
function startGuided(){ sessVal = null; sessPR = null; sessRes = {}; sessT = 0; selDay = todayIdx(); sessT = Date.now(); voiceUnlock();
  freezeDay(); const nx = nextSet(); if (!nx) return; AUTO = true; openSet(nx[0], nx[1]); }
// dernière série finie : on ferme et, en séance guidée, on demande le ressenti (il règle la charge suivante)
function closeEnd(){ const was = AUTO; $("sd").close(); if (was) endSession(); }
const autoGo = (mode, ms) => { const me = sd; setTimeout(() => { if (AUTO && sd === me && sd.mode === mode && $("sd").open) $("sdGo").click(); }, ms); };
const sdStop = () => { clearInterval(sdTimer); sdTimer = null; if (sdWake) { sdWake.release().catch(()=>{}); sdWake = null; } };
const mmss = s => Math.floor(s/60) + ":" + String(Math.floor(s%60)).padStart(2,"0");
function nextSet(){
  const day = pDay(selDay), vals = wkGet(selDay), B = day.blocks;
  if (day.circuit) { const n = Math.max(0, ...B.map(b=>b.sets.length));
    for (let s = 0; s < n; s++) for (let b = 0; b < B.length; b++) if (s < B[b].sets.length && vals[b + "-" + s] == null) return [b, s]; }
  else for (let b = 0; b < B.length; b++) for (let s = 0; s < B[b].sets.length; s++) if (vals[b + "-" + s] == null) return [b, s];
  return null;
}
function openSet(bi, si){
  sdStop(); if (selDay === todayIdx()) freezeDay(); $("sdNo").hidden = true;
  const day = pDay(selDay), b = day.blocks[bi], s = b.sets[si], fx = fixed(s), tg = fx ? 0 : pTarget(b, s);
  sd = {bi, si, b, s, tg, fx, day, mode:"idle", side:1};
  $("sdT").textContent = b.name; $("sdHow").textContent = b.how || "";
  { const art = $("sdArt"); art.textContent = ""; if (b.ms && MS[b.ms]) { const sp = el("span","sp"); sp.dataset.pose = poseId(b.ms); sp.dataset.anim = b.ms; sp.dataset.lk = ""; sprPaint(sp, 110); art.append(sp); } else if (b.dk && DR_ANIM[b.dk]) art.append(drSp(b.dk, 110)); }
  const sv = $("sdVid"); sv.textContent = ""; const vl = vidLink(b) || (day.drive ? extLink(drv(day.drive), "Vidéo de la séance") : null);
  if (vl) { if (vl.textContent === "Vidéo") vl.textContent = "Voir la vidéo de l'exercice"; sv.append(vl); }
  if (b.dk && DRILLS[b.dk].eq === "kg" && !noVest() && P.builtin) { const nv = el("button","golink","Pas de gilet sous la main ? Version sans charge"); nv.onclick = () => { setNoVest(true); openSet(sd.bi, sd.si); }; sv.append(nv); }
  const ck = $("sdClock"); ck.className = "clock";
  if (fx){
    const timed = s.dur != null;
    $("sdS").textContent = (b.sets.length > 1 ? (day.circuit ? "Tour " : "Série ") + (si+1) + "/" + b.sets.length + " · " : (bi+1) + "/" + day.blocks.length + " · ") + fixTxt(b, s, day.scale) + (b.pnf ? " · PNF" : "");
    ck.style.display = timed ? "" : "none"; if (timed) ck.textContent = mmss(sRun(s, day.scale));
    $("sdReps").style.display = "none"; $("sdGo").style.display = ""; const essai = s.lab === "essai" && b.ms && MS[b.ms] && MS[b.ms].type === "check"; $("sdGo").textContent = timed ? "Démarrer" : essai ? "Réussi" : "Fait"; $("sdNo").hidden = !essai;
    $("sdHint").textContent = [b.pnf ? "PNF : contracte 10 s, relâche 5 s, puis gagne en amplitude." : "", b.note].filter(Boolean).join(" ");
  } else {
    $("sdS").textContent = "Série " + (si+1) + "/" + b.sets.length + (s.pct ? " · " + s.pct + " %" : "");
    const hold = b.kind === "hold";
    ck.style.display = hold ? "" : "none"; ck.textContent = "0,0";
    $("sdReps").style.display = hold ? "none" : ""; $("sdNum").value = "";
    { const q = $("sdQuick"); q.textContent = ""; const t0 = tg || s.reps || 0; if (!hold && t0) [t0 - 2, t0 - 1, t0, t0 + 1].filter(n => n > 0).forEach(n => { const bq = el("button","src", String(n)); bq.setAttribute("aria-label", n + " répétitions"); bq.onclick = () => saveSet(n); q.append(bq); }); }
    $("sdGo").style.display = hold ? "" : "none"; $("sdGo").textContent = "Démarrer";
    $("sdHint").textContent = tg ? "Cible : " + tg + unit(b) + (s.pct && s.pct < 100 ? " (" + s.pct + " % de ton record)" : s.pct ? ", ton record ou mieux" : "")
      : "Premier passage : fais ton maximum propre, il servira de référence.";
    if (b.note) $("sdHint").textContent += " " + b.note;
  }
  if (!$("sd").open) $("sd").showModal();
  say(setSay(b, s, si, fx, tg, day));
  if (AUTO) { const timed = fx ? s.dur != null : b.kind === "hold";
    if (timed) { if (!fx) $("sdHint").textContent = s.auto ? "Tiens " + tg + unit(b) + " : l'arrêt est automatique. Touche le bouton si tu chutes avant." : "Tentative : tiens le plus longtemps possible, puis touche Stop." + (tg ? " Cible : " + tg + unit(b).replace(/\.$/, "") + "." : ""); autoGo("idle", voiceOn() && !S.countdown ? 2600 : 900); } }
}
// ce que la voix annonce à l'ouverture d'une série : le nom, la série, la cible
function setSay(b, s, si, fx, tg, day){
  if (b.zen) return s.dur != null ? "" : b.name + ". " + s.reps + " répétitions. " + b.how; // tenue : la consigne est lue au départ de la posture
  const n = b.sets.length, ser = n > 1 ? (day.circuit ? "Tour " : "Série ") + (si+1) + " sur " + n + ". " : "";
  let what = "";
  if (fx) what = s.dur != null ? secSay(sDur(s, day.scale)) + (s.sides ? " de chaque côté." : ".") : s.reps != null ? s.reps + " répétitions." : "";
  else if (b.kind === "hold") what = s.auto && tg ? "Tiens " + secSay(tg) + "." : tg ? "Tiens le plus longtemps possible. Cible : " + secSay(tg) + "." : "Tiens le plus longtemps possible.";
  else what = tg ? tg + " répétitions." : "Ton maximum propre.";
  return b.name + ". " + ser + what;
}
function storeSet(v){
  const k = wkKey(selDay), o = pg().wk[k] || (pg().wk[k] = {}), key = sd.bi + "-" + sd.si, fresh = o[key] == null; o[key] = v;
  if (fresh){ const c = cnt(); c.sets++; if (sd.b.kind === "hold" && sd.b.ms) c.hold += v * (sd.fx && sd.s.sides ? 2 : 1);
    if (!nextSet()) { c.sess++; if (/^etirements/.test(P.id)) c.stretch++; } }
  const keys = Object.keys(pg().wk); if (keys.length > 150) keys.slice(0, keys.length - 150).forEach(x=>delete pg().wk[x]);
}
// essai d'une figure « réussi / pas réussi » (roue, montée…) : 3 réussites le même jour = une séance validée
function chkTry(ok){ const id = sd.b.ms; if (ok && id) chkHit(id); }
$("sdNo").onclick = () => { if (sd && sd.fx && sd.s.lab === "essai") saveFixed(0); };   // « pas encore » : l'essai compte, sans réussite
function saveFixed(v){
  const {b, s, day, si} = sd; sdStop();
  storeSet(v != null ? v : s.dur != null ? sDur(s, day.scale) : s.reps);
  if (b.confirm && (S.confirm || []).includes(b.ms) && b.sets.every((_,i)=>wkGet(selDay)[sd.bi + "-" + i] != null)) {
    const okN = b.sets.filter((_,i)=>wkGet(selDay)[sd.bi + "-" + i] > 0).length; S.confirm = (S.confirm || []).filter(x=>x !== b.ms);
    if (okN >= 2) toast("« " + MS[b.ms].name + " » confirmée"); else { st(b.ms).done = false; toast("« " + MS[b.ms].name + " » pas encore confirmée : elle revient dans ton parcours."); } }
  const nx = nextSet();
  if (nx && AUTO && s.rest && nx[0] === sd.bi) { save(); render(); startRest(s, nx, v === 0 ? "Pas encore : l'essai compte quand même" : "Fait"); return; }
  if (!nx) S.log.push({t:Date.now(), id:"pg:" + P.name + (day.name ? " · " + day.name : ""), k:"check", v:true, pr:false});
  save(); render();
  if (nx && day.circuit && day.circuit.rest && nx[1] !== si) { startRest(day.circuit, nx, "Tour " + (si+1) + "/" + b.sets.length + " terminé"); return; }
  if (nx) openSet(nx[0], nx[1]); else closeEnd();
}
function startRest(r, nx, title){
  const end = Date.now() + r.rest*1000, ck = $("sdClock"); let done = false;
  sd.mode = "rest"; sd.next = nx; $("sdNo").hidden = true;
  ck.style.display = ""; ck.className = "clock count"; $("sdReps").style.display = "none";
  $("sdS").textContent = "Repos · " + restTxt(r); $("sdT").textContent = title; $("sdHow").textContent = ""; $("sdVid").textContent = "";
  $("sdGo").style.display = ""; $("sdGo").textContent = nx ? "Passer le repos" : "Terminer la séance"; $("sdGo").disabled = true; setTimeout(() => { $("sdGo").disabled = false; }, 600);   /* un double appui sur « Enregistrer » ne saute pas le repos */
  const nb = nx && pDay(selDay).blocks[nx[0]];
  $("sdHint").textContent = nx ? "Ensuite : " + nb.name + (nb.sets.length > 1 ? ", " + (nx[1]+1) + "/" + nb.sets.length : "") : "C'était la dernière série du jour.";
  say(nx ? "Repos, " + secSay(r.rest) + ". Ensuite : " + (nx[0] === sd.bi ? "série " + (nx[1]+1) + " sur " + nb.sets.length : nb.name) + "." : "C'était la dernière série. Bravo.");
  let warned = r.rest < 25;
  const tick = () => { const left = (end - Date.now())/1000;
    if (!warned && left <= 10 && left > 0) { warned = true; say("Dix secondes. Secoue les poignets, respire."); }
    if (left <= 0) { ck.textContent = "0:00"; ck.className = "clock hit"; if (!done) { done = true; beep(1320, 600); clearInterval(sdTimer); sdTimer = null; if (AUTO) { if (nx) autoGo("rest", 500); else closeEnd(); } } }
    else ck.textContent = mmss(Math.ceil(left)); };
  tick(); sdTimer = setInterval(tick, 250);
}
function runFixed(){
  const {s, day, b} = sd, ck = $("sdClock"), dur = sRun(s, day.scale), zen = !!b.zen;
  const prep = zen ? (sd.side === 1 ? 6 : 4) : sd.side === 1 ? S.countdown : 5;
  let end = Date.now() + prep*1000, last = -1; sd.mode = prep ? "count" : "run";
  let said10 = dur < 25, saidHalf = zen || dur < 60;
  const go = () => { sd.mode = "run"; end = Date.now() + dur*1000; ck.className = "clock"; beep(880, 350);
    setTimeout(() => { if (sd && sd.mode === "run") say(zen ? "Tiens. Contrôle." : cueFor(sd.b)); }, 450); };
  if (sd.side === 2) say(zen ? "L'autre côté." : "Change de côté.");
  else if (zen) say(b.name + ". " + b.how);
  if (!prep) go(); else ck.className = "clock count";
  $("sdGo").textContent = "J'ai fini";
  if (s.sides) $("sdS").textContent = (sd.bi+1) + "/" + day.blocks.length + " · côté " + sd.side + "/2" + (sd.b.pnf ? " · PNF" : "");
  sdTimer = setInterval(()=>{
    const left = (end - Date.now())/1000;
    if (sd.mode === "count"){ const r = Math.ceil(left); if (r <= 0) go(); else { ck.textContent = String(r); if (r !== last) { last = r; if (r <= 3) beep(440, 120); } } }
    else if (left <= 0){ clearInterval(sdTimer); sdTimer = null; beep(1320, 600);
      if (s.sides && sd.side === 1) { sd.side = 2; runFixed(); } else saveFixed(); }
    else { ck.textContent = mmss(Math.ceil(left));
      if (!saidHalf && left <= dur/2) { saidHalf = true; say("La moitié."); }
      if (!said10 && left <= 10) { said10 = true; say("Encore dix secondes."); } }
  }, 200);
}
function saveSet(v){
  const {b, s} = sd; storeSet(v);
  // vérification d'une figure déclarée au bilan : réussie, elle est confirmée ; ratée sur tous les essais, elle repasse à travailler
  if (b.confirm && MS[b.ms] && (S.confirm || []).includes(b.ms)) { const vals = wkGet(selDay), hits = b.sets.map((_,i)=>vals[sd.bi + "-" + i] >= MS[b.ms].target), ok = SIDED.has(b.ms) ? hits.some((h,i)=>h && i % 2 === 0) && hits.some((h,i)=>h && i % 2 === 1) : v >= MS[b.ms].target, all = b.sets.every((_,i)=>wkGet(selDay)[sd.bi + "-" + i] != null);
    if (ok || all) { S.confirm = (S.confirm || []).filter(x=>x !== b.ms); if (!ok) { st(b.ms).done = false; toast("« " + MS[b.ms].name + " » pas encore confirmée : elle revient dans ton parcours."); } else toast("« " + MS[b.ms].name + " » confirmée."); } }
  const old = pg().best[b.name] || 0, pr = v > old; if (pr) pg().best[b.name] = v;
  if (b.ms && MS[b.ms] && MS[b.ms].type === b.kind) { const x = st(b.ms), l0 = lvlOf(MS[b.ms]); if (v > x.best) x.best = v; if (lvlOf(MS[b.ms]) > l0 && S.adapt) delete S.adapt[b.ms];   /* nouveau palier : la charge repart d'une base neutre */
    if (v >= MS[b.ms].target && !x.done) { const msg = hitTarget(b.ms, sd.si % 2); /* séries alternées : paires d'un côté, impaires de l'autre */ if (msg) toast(msg); else { sessVal = b.ms; toast("« " + MS[b.ms].name + " » validée !"); const dy = S.bday && S.bday.blocks[sd.bi]; if (dy) dy.sets = dy.sets.filter((q, i) => i <= sd.si || wkGet(selDay)[sd.bi + "-" + i] != null); } }   /* validée : le reste de la figure est offert */
    if (s.auto && sd.tg) { const r = sessRes[b.ms] || (sessRes[b.ms] = {ok:0, miss:0}); if (v >= sd.tg * 0.95) r.ok++; else r.miss++;
      // tenue bien en dessous de la cible : les séries suivantes de ce bloc, aujourd'hui, visent un peu plus court
      if (v < sd.tg * 0.5) { const ng = Math.max(3, Math.round(v * 1.3)); if (S.bday && S.bday.d === dayKey(Date.now()) && S.bday.blocks[sd.bi]) S.bday.blocks[sd.bi].sets.forEach((x, i) => { if (i > sd.si && x.auto && x.goal > ng) x.goal = ng; });
        toast(num(v) + " s sur " + sd.tg + " : les séries suivantes visent " + ng + " s aujourd'hui. Propre avant long."); } } }
  S.log.push({t:Date.now(), id:"pg:" + b.name, k:b.kind, v, pr:pr && old > 0}); if (pr && old > 0) sessPR = [b.name, v, unit(b)]; if (S.log.length > 2000) S.log = S.log.slice(-2000);
  save(); render();
  const nx = nextSet();
  if (!s.rest) { sdStop(); if (nx && sd.day.type !== "gtg") openSet(nx[0], nx[1]); else closeEnd(); return; }
  const tgt = s.goal || sd.tg; startRest(s, nx, tgt ? (v >= tgt ? "Cible atteinte ✓ · " + num(v) + unit(b) : num(v) + " sur " + tgt + unit(b) + (v >= tgt * 0.75 ? " : presque" : "")) + (pr && old > 0 ? " · record" : "") : "Fait : " + num(v) + unit(b));
}
$("sdGo").onclick = async e => {
  if (e && e.isTrusted) voiceUnlock();
  const ck = $("sdClock");
  if (sd.mode === "rest") { sdStop(); if (sd.next) openSet(sd.next[0], sd.next[1]); else { const was = AUTO; $("sd").close(); if (was) endSession(); } return; }
  if (sd.fx){
    if (sd.s.dur == null) { if (sd.s.lab === "essai") chkTry(true); saveFixed(); return; }
    if (sd.mode === "idle") { keepAwake(sdKeep); runFixed(); }
    else { clearInterval(sdTimer); sdTimer = null; if (sd.s.sides && sd.side === 1) { sd.side = 2; runFixed(); } else saveFixed(); }
    return;
  }
  if (sd.mode === "idle"){
    keepAwake(sdKeep);
    const left = S.countdown; let t = performance.now(), last = -1, hit = false;
    let said3 = !(sd.tg >= 8);
    const run = () => { sd.mode = "run"; t = performance.now(); sd.t0 = t; ck.className = "clock"; setTimeout(() => { if (sd && sd.mode === "run") say(cueFor(sd.b)); }, 450); $("sdGo").textContent = AUTO && sd.s.auto ? (/^(st_|b1_|b2_|in_|oa_|pr_)/.test(sd.b.ms || "") ? "J'ai chuté" : "J'arrête") : AUTO ? "Stop" : "Arrêter"; beep(880, 350); };
    if (left > 0) { sd.mode = "count"; ck.className = "clock count"; $("sdGo").textContent = "Annuler"; } else run();
    sdTimer = setInterval(()=>{
      const e = (performance.now() - t)/1000;
      if (sd.mode === "count"){ const r = Math.ceil(left - e); if (r <= 0) run(); else { ck.textContent = String(r); if (r !== last) { last = r; if (r <= 3) beep(440, 120); } } }
      else if (sd.mode === "run"){ ck.textContent = e.toFixed(1).replace(".", ","); if (!said3 && e >= sd.tg - 3) { said3 = true; say("Encore trois, en respirant."); }
        if (!hit && sd.tg && e >= sd.tg) { hit = true; if (!(AUTO && sd.s.auto)) say("Cible atteinte."); ck.className = "clock hit"; beep(1320, 600); if (AUTO && sd.s.auto) autoGo("run", 120); } }
    }, 50);
  } else if (sd.mode === "count"){ openSet(sd.bi, sd.si); }
  else if (sd.mode === "run"){
    const v = Math.floor((performance.now() - sd.t0)/100)/10; clearInterval(sdTimer); sdTimer = null;
    if (v >= 0.5) saveSet(v); else openSet(sd.bi, sd.si);
  }
};
$("sdSave").onclick = () => { const v = parseInt($("sdNum").value, 10); if (!(v > 0)) { toast("Entre un nombre de répétitions."); return; } if (saneReps(v, sd && sd.tg)) saveSet(v); };
$("sd").addEventListener("close", () => { AUTO = false; sdStop(); });
$("sdX").addEventListener("click", hush);
// douleur pendant la séance : on arrête tout de suite et on demande où
$("sdPain").onclick = () => { hush(); sdStop(); $("sd").close(); $("fbIds").value = ""; $("fbZone").hidden = false; $("fbDlg").showModal(); };
// l'écran reste allumé pendant le chrono : le verrou est repris au retour dans l'app, et rendu s'il arrive trop tard
function sdKeep(w){ if (sdTimer) { sdWake = w; w.addEventListener && w.addEventListener("release", () => { if (sdWake === w) sdWake = null; }); } else w.release().catch(()=>{}); }
document.addEventListener("visibilitychange", () => { if (!document.hidden && sdTimer && !sdWake) keepAwake(sdKeep); });
