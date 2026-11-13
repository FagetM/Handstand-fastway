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
const todayIdx = () => (new Date().getDay() + 6) % 7;
let selDay = todayIdx();
const pg = () => { const g = S.pg || (S.pg = {}); g.best = g.best || {}; g.wk = g.wk || {}; g.by = g.by || {}; return g; };
// Séance d'équilibre : construite à partir de l'arbre (les prochains jalons accessibles de la quête 1), pas d'un programme importé.
function builtin(){
  // une fois la séance commencée, elle reste la même jusqu'au soir (les records du jour ne la modifient pas en route)
  if (S.bday && S.bday.d === dayKey(Date.now())) return builtinOf(S.bday.blocks);
  return builtinOf(builtinBlocks());
}
const builtinOf = blocks => { const day = {type:"train", blocks};
  return {id:"equilibre", name:"Mes jalons", builtin:true, steps:[{name:"Prochains jalons de la quête", info:"Séance construite à partir du parcours et du temps que tu as indiqué : tes prochains jalons accessibles, avec des séries ajustées à tes dernières séances.", days:Object.fromEntries(DAYK.map(k=>[k, day]))}]}; };
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
  oawall:{name:"Tenue un bras dos au mur", kind:"hold", sets:[3,20], how:"Dos au mur, jambes écartées : transfère le poids sur une main, retire l'autre et tiens. Épaule poussée vers l'oreille, bassin au-dessus de la main. Côté faible d'abord."},
  oashrug:{name:"Haussements d'épaule à un bras", kind:"reps", sets:[3,8], how:"En appui à un bras au mur, bras verrouillé : laisse l'épaule descendre puis repousse-la vers l'oreille. C'est la force qui porte l'équilibre sur un bras."},
  tuckflag:{name:"Drapeaux groupés pulsés", kind:"reps", sets:[3,6], how:"En équilibre, genoux groupés : incline-les sur le côté en petits rebonds contrôlés, puis tiens 3 s la position la plus basse. Change de côté."},
  biceps:{name:"Renforcement du biceps bras tendu", kind:"reps", sets:[3,12], how:"Curl bras presque tendu à l'élastique, lent : prépare le tendon du biceps et le coude au travail bras tendus."},
  tuck2strad:{name:"Extensions tuck vers straddle", kind:"reps", sets:[4,3], how:"Depuis l'advanced tuck, ouvre les jambes en straddle 2 s puis reviens, sans laisser tomber les hanches."},
  // avec du matériel (réglages › Mon matériel)
  bandpl:{name:"Planche à l'élastique", kind:"hold", sets:[4,10], how:"Élastique sous les hanches, accroché en hauteur : tiens la position de l'étape suivante, bras verrouillés, omoplates écartées.", eq:"band"},
  lsitpara:{name:"L-sit sur parallettes", kind:"hold", sets:[3,15], how:"Bras verrouillés, épaules abaissées loin des oreilles, jambes tendues à l'horizontale (groupé si besoin).", eq:"para"},
  dipsW:{name:"Dips lestés", kind:"reps", sets:[3,6], how:"Entre deux chaises solides ou aux barres, gilet sur le dos : descends coudes à 90°, épaules basses, remonte bras verrouillés. Force de base pour la planche.", eq:"kg"},
  pushW:{name:"Pompes lestées", kind:"reps", sets:[3,8], how:"Gilet lesté, corps gainé, poitrine jusqu'au sol. Pour construire la force qui porte la planche.", eq:"kg"},
  protrac:{name:"Pompes d'omoplates en planche inclinée", kind:"reps", sets:[3,10], how:"Position de pompe, bras tendus, épaules devant les mains : sans plier les coudes, rapproche puis écarte les omoplates. Le dos s'arrondit à chaque poussée."},
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
  else if (s === "planche") out.push("lean","protrac","pseudo","biceps");
  if (["pl_frog","pl_1leg","pl_straddle"].includes(id)) out.unshift("tuck2strad");
  if (id === "oa_flaghoriz" || id === "oa_wall") out.unshift("tuckflag");
  else if (s === "press") out.push("pike","pancake","lean");
  else if (s === "low") out.push("frog","lean");
  if (id === "in_hspu") out.unshift("pikepu");
  const E = S.equip || {};
  if (E.band && ["pl_tuck","pl_adv","pl_frog","pl_1leg","pl_straddle","pl_full"].includes(id)) out.unshift("bandpl");
  if (E.para && (s === "planche" || s === "press")) out.push("lsitpara");
  if (E.kg && (id === "fd_dips" || s === "planche") && st("fd_dips").done) out.push("dipsW");
  if (E.kg && id === "fd_push" && st("fd_push").done) out.push("pushW");
  return [...new Set(out)];
}
const drillBlock = (k, pain) => { const d = DRILLS[k], n = Math.max(1, pain ? d.sets[0] - 1 : d.sets[0]);
  // parallettes : les exercices d'appui se font dessus ; lest : on indique la charge
  const E = S.equip || {}, how = d.how + (E.para && ["lean","pseudo","protrac","bandpl"].includes(k) ? " Sur parallettes si tu veux : poignets ménagés." : "") + (d.eq === "kg" ? " Charge : jusqu'à " + E.kg + " kg, en gardant la forme." : "");
  return {name:d.name, kind:d.kind, how, sets:Array.from({length:n}, ()=>d.kind === "hold" ? {dur:d.sets[1], rest:30} : {reps:d.sets[1], rest:30})}; };
// jours où une figure de force a été travaillée (planche, montées, pompes, dips)
function forceDays(){ const byName = {}; Object.values(MS).forEach(m=>{ byName["pg:" + m.name] = m.id; });
  return new Set(S.log.filter(l=>FORCE(MS[l.id] ? l.id : byName[l.id] || "")).map(l=>dayKey(l.t))); }
function forceOk(){ const fd = forceDays(), d = new Date(); d.setDate(d.getDate() - 1); if (fd.has(dayKey(d))) return false;
  let n = 0; const w = new Date(); w.setDate(w.getDate() - todayIdx()); for (let i = 0; i < 7; i++) { const x = new Date(w); x.setDate(w.getDate() + i); if (fd.has(dayKey(x))) n++; }
  return n < 3 || fd.has(dayKey(Date.now())); }
// une semaine légère toutes les cinq : moins de séries, pas de tentative à fond (tendons et poignets récupèrent)
function deloadWeek(){ const t1 = S.log.length ? S.log[0].t : Date.now(), wk = Math.floor((Date.now() - t1) / (7 * 864e5)); return wk > 0 && wk % 5 === 4; }
function builtinBlocks(){
  // météo du corps : fatigué·e, séance courte et sans tentative à fond ; raide, de la mobilité en plus
  const mood = moodToday(), tired = mood === "fatigue";
  const deload = deloadWeek();
  const mins = S.mins || 30, pain = painRecent(), nMs = tired || mins <= 15 ? 1 : mins <= 30 ? 2 : 3, scale = Math.max(0.6, Math.min(1.5, mins / 30)) * (tired ? 0.6 : 1) * (deload ? 0.6 : 1);
  // douleur au poignet : 48 h sans appui sur les mains, on travaille le reste
  if (pain && S.painZone === "poignet") return ["hollow","epaules","pike","pancake"].map(k=>drillBlock(k, false));
  const open = GOALS[0].ms.filter(id=>!st(id).done && !msLocked(MS[id])), fok = forceOk() && !(pain && S.painZone === "epaule");
  const next = open.filter(id=>!FORCE(id)).concat(fok ? open.filter(FORCE) : []).slice(0, nMs);
  const nDr = mins <= 15 ? 1 : mins <= 30 ? 2 : mins <= 45 ? 3 : 4;
  const blocks = next.map(id=>{ const m = MS[id], pl = planFor(m).n, base = {name:m.name, how:m.desc, ms:id, yt:m.yt && m.yt[0] ? m.yt[0][0] : undefined};
    const sets = Math.max(3, Math.round(pl.sets * scale * (pain ? 0.7 : 1))), tries = pain || tired || deload ? 0 : pl.tries || 0;
    if (pl.attempts) return Object.assign(base, {kind:"hold", note:pl.sides ? "Alterne gauche et droite à chaque essai, en commençant par ton côté faible." : undefined,
      sets:Array.from({length:pl.sides ? Math.min(16, sets * 2) : sets}, ()=>({goal:pl.T, rest:pl.rest || 30, max:true}))});
    if (m.type === "check") return Object.assign(base, {kind:"reps", note:"Quand tu le réussis proprement 3 fois sur 5, valide-le depuis sa fiche.", sets:Array.from({length:Math.min(sets, 8)}, ()=>({reps:1, lab:"essai", rest:45}))});
    const pr = /^pl_/.test(id); // planche : bras tendus, on récupère complètement entre deux séries
    return Object.assign(base, {kind:m.type, sets:Array.from({length:sets}, ()=>({goal:pl.work, rest:pr ? 150 : m.sec === "base" ? 45 : 75, auto:true})).concat(Array.from({length:tries}, ()=>({goal:pl.T, rest:pr ? 180 : 120, max:true})))}); });
  // figures validées au bilan sur simple déclaration : on vérifie la sortie de secours en pratique
  const conf = (S.confirm || []).filter(id=>MS[id]).map(id=>({name:MS[id].name + " · vérification", how:"Validé à ton bilan : refais-le 3 fois proprement pour le confirmer. C'est ta sécurité pour la suite.", ms:id, confirm:true, kind:"reps", sets:Array.from({length:3}, ()=>({reps:1, lab:"essai", rest:45}))}));
  if (!next.length && !conf.length) return blocks;
  const dr = []; next.forEach(id=>drillsFor(MS[id]).forEach(k=>{ if (!dr.includes(k)) dr.push(k); }));
  const mob = mood === "raide" ? ["epaules","pike"].filter(k=>!dr.includes(k)).map(k=>drillBlock(k, pain)) : [];
  return [drillBlock("poignets", pain)].concat(mob, conf, blocks, dr.slice(0, tired ? 1 : nDr).map(k=>drillBlock(k, pain)));
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
const PD_STEPS = ["pl_lean","pl_tuck","pl_adv","pl_frog","pl_1leg","pl_straddle"];   // figure à valider pour ouvrir l'étape suivante du programme
const stepLock = (pid, i) => pid === "planche-domination" && i > 0 ? needMs([PD_STEPS[i - 1]]) : null;
const pickP = () => { const all = allP(); P = all[pg().cur]; if (!P) P = all.equilibre; else if (progLock(P.id)) { P = all.equilibre; pg().cur = "equilibre"; }
  const s = pp(); while (s.step > 0 && stepLock(P.id, s.step)) s.step--; };
const pp = () => pg().by[P.id] || (pg().by[P.id] = {step:0});
const pStep = () => P.steps[Math.min(pp().step, P.steps.length - 1)];
const wkKey = di => { const d = new Date(); d.setDate(d.getDate() - todayIdx()); return dayKey(d) + "|" + P.id + "|" + pp().step + "|" + DAYK[di]; };
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
    g.append(el("div","t", "Détail de la séance"), el("div","mut", "Voir chaque série, changer de jour ou d'étape, lexique"));
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
let plSkip = new Set(), plMiss = 0;
function startPlacement(){ plSkip = new Set(); plMiss = 0; plStep(); $("plDlg").showModal(); }
const SAFE = new Set(["fd_roue","st_bail30","st_bailc2w"]);
function plStep(){
  const id = GOALS[0].ms.find(x=>!st(x).done && !msLocked(MS[x]) && !plSkip.has(x)), box = $("plBody"); box.textContent = "";
  if (!id || plMiss >= 3) { S.placed = true; save(); render();
    const nx = GOALS[0].ms.find(x=>!st(x).done && !msLocked(MS[x])); box.append(el("h2",null,"Bilan terminé"), el("p",null, nx ? "Ton point de départ : « " + MS[nx].name + " ». La séance du jour est prête." : "Tu as tout validé !"));
    const b = el("button","btn","Voir ma séance"); b.onclick = () => { $("plDlg").close(); showTab("today"); window.scrollTo(0,0); }; box.append(b); return; }
  const m = MS[id], L = lvls(m), art = el("div","plart"), sp = el("span","sp"); sp.dataset.pose = poseId(id); sp.dataset.anim = id; sp.dataset.lk = ""; sprPaint(sp, 150); art.append(sp);
  box.append(el("div","lab", SEC[m.sec].name), el("h2",null, m.name), art);
  if (m.desc) box.append(el("p","mut", m.desc));
  const yes = () => { const x = st(id); x.done = true; if (m.target) x.best = Math.max(x.best, m.target); if (SAFE.has(id)) (S.confirm || (S.confirm = [])).push(id); save(); plStep(); };
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
  ids.forEach(id=>{ const r = sessRes[id], tot = r.ok + r.miss; if (!tot) return; const f0 = ad[id] || 1;
    ad[id] = Math.round(Math.max(0.6, Math.min(1.35, r.miss === 0 ? f0 * 1.08 : r.miss / tot > 0.34 ? f0 * 0.9 : f0)) * 100) / 100; });
  if (P && P.zen) { save(); render(); const z = ZEN[pp().step]; if (z && z.free) { zenRate("ok"); return; } $("zfDlg").showModal(); say("Séance terminée. Et la forme ?", true); return; }
  save(); $("fbIds").value = ids.join(","); $("fbDlg").showModal(); say("Séance terminée. Comment tu te sens ?", true);
}
function feedback(kind){
  const ad = S.adapt || (S.adapt = {}), ids = $("fbIds").value.split(",").filter(Boolean), mult = {easy:1.08, ok:1, hard:0.9, pain:0.8}[kind];
  ids.forEach(id=>{ ad[id] = Math.round(Math.max(0.6, Math.min(1.35, (ad[id] || 1) * mult)) * 100) / 100; });
  (S.fb || (S.fb = [])).push({t:Date.now(), k:kind}); if (S.fb.length > 200) S.fb = S.fb.slice(-200);
  if (kind === "pain") S.pain = Date.now();
  sessRes = {}; save(); $("fbDlg").close(); render();
  toast(kind === "easy" ? "Noté : la prochaine séance sera un peu plus longue." : kind === "hard" ? "Noté : on adoucit la prochaine fois." : kind === "pain" ? (S.painZone === "poignet" ? "Merci d'avoir écouté ton corps. On prend soin des poignets pendant 2 jours : gainage, respiration, souplesse." : S.painZone === "epaule" || S.painZone === "coude" ? "Noté : 48 h sans force (planche, montées, pompes), équilibre allégé." : "Noté : séances allégées pendant deux jours.") + " Si ça dure, offre-toi une vraie pause." : "Merci pour ce moment. À bientôt.");
}
// Séance guidée : un seul toucher, puis l'app enchaîne décompte, série, repos et exercice suivant.
function startGuided(){ sessRes = {}; selDay = todayIdx(); voiceUnlock();
  if (P && P.builtin && !(S.bday && S.bday.d === dayKey(Date.now()))) { S.bday = {d:dayKey(Date.now()), blocks:builtinBlocks()}; save(); pickP(); } const nx = nextSet(); if (!nx) return; AUTO = true; openSet(nx[0], nx[1]); }
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
  sdStop();
  const day = pDay(selDay), b = day.blocks[bi], s = b.sets[si], fx = fixed(s), tg = fx ? 0 : pTarget(b, s);
  sd = {bi, si, b, s, tg, fx, day, mode:"idle", side:1};
  $("sdT").textContent = b.name; $("sdHow").textContent = b.how || "";
  { const art = $("sdArt"); art.textContent = ""; if (b.ms && MS[b.ms]) { const sp = el("span","sp"); sp.dataset.pose = poseId(b.ms); sp.dataset.anim = b.ms; sp.dataset.lk = ""; sprPaint(sp, 110); art.append(sp); } }
  const sv = $("sdVid"); sv.textContent = ""; const vl = vidLink(b) || (day.drive ? extLink(drv(day.drive), "Vidéo de la séance") : null);
  if (vl) { if (vl.textContent === "Vidéo") vl.textContent = "Voir la vidéo de l'exercice"; sv.append(vl); }
  const ck = $("sdClock"); ck.className = "clock";
  if (fx){
    const timed = s.dur != null;
    $("sdS").textContent = (b.sets.length > 1 ? (day.circuit ? "Tour " : "Série ") + (si+1) + "/" + b.sets.length + " · " : (bi+1) + "/" + day.blocks.length + " · ") + fixTxt(b, s, day.scale) + (b.pnf ? " · PNF" : "");
    ck.style.display = timed ? "" : "none"; if (timed) ck.textContent = mmss(sRun(s, day.scale));
    $("sdReps").style.display = "none"; $("sdGo").style.display = ""; $("sdGo").textContent = timed ? "Démarrer" : "Fait";
    $("sdHint").textContent = [b.pnf ? "PNF : contracte 10 s, relâche 5 s, puis gagne en amplitude." : "", b.note].filter(Boolean).join(" ");
  } else {
    $("sdS").textContent = "Série " + (si+1) + "/" + b.sets.length + (s.pct ? " · " + s.pct + " %" : "") + (s.rest ? " · repos " + restTxt(s) : "");
    const hold = b.kind === "hold";
    ck.style.display = hold ? "" : "none"; ck.textContent = "0,0";
    $("sdReps").style.display = hold ? "none" : ""; $("sdNum").value = "";
    $("sdGo").style.display = hold ? "" : "none"; $("sdGo").textContent = "Démarrer";
    $("sdHint").textContent = tg ? "Cible : " + tg + unit(b) + (s.pct && s.pct < 100 ? " (" + s.pct + " % de ton record)" : s.pct ? ", ton record ou mieux" : "")
      : "Premier passage : fais ton maximum propre, il servira de référence.";
    if (b.note) $("sdHint").textContent += " " + b.note;
  }
  if (!$("sd").open) $("sd").showModal();
  say(setSay(b, s, si, fx, tg, day));
  if (AUTO) { const timed = fx ? s.dur != null : b.kind === "hold";
    if (timed) { if (!fx) $("sdHint").textContent = s.auto ? "Tiens " + tg + unit(b) + " : l'arrêt est automatique. Touche le bouton si tu chutes avant." : "Tentative : tiens le plus longtemps possible, puis touche Stop." + (tg ? " Cible : " + tg + unit(b) + "." : ""); autoGo("idle", voiceOn() && !S.countdown ? 2600 : 900); } }
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
  if (fresh){ const c = cnt(); c.sets++; if (sd.b.kind === "hold") c.hold += v * (sd.fx && sd.s.sides ? 2 : 1);
    if (!nextSet()) { c.sess++; if (/^etirements/.test(P.id)) c.stretch++; } }
  const keys = Object.keys(pg().wk); if (keys.length > 150) keys.slice(0, keys.length - 150).forEach(x=>delete pg().wk[x]);
}
function saveFixed(){
  const {b, s, day, si} = sd; sdStop();
  storeSet(s.dur != null ? sDur(s, day.scale) : s.reps);
  if (b.confirm && b.sets.every((_,i)=>wkGet(selDay)[sd.bi + "-" + i] != null)) { S.confirm = (S.confirm || []).filter(x=>x !== b.ms); toast("« " + MS[b.ms].name + " » confirmé"); }
  const nx = nextSet();
  if (nx && AUTO && s.rest && nx[0] === sd.bi) { save(); render(); startRest(s, nx, "Fait"); return; }
  if (!nx) S.log.push({t:Date.now(), id:"pg:" + P.name + (day.name ? " · " + day.name : ""), k:"check", v:true, pr:false});
  save(); render();
  if (nx && day.circuit && day.circuit.rest && nx[1] !== si) { startRest(day.circuit, nx, "Tour " + (si+1) + "/" + b.sets.length + " terminé"); return; }
  if (nx) openSet(nx[0], nx[1]); else closeEnd();
}
function startRest(r, nx, title){
  const end = Date.now() + r.rest*1000, ck = $("sdClock"); let done = false;
  sd.mode = "rest"; sd.next = nx;
  ck.style.display = ""; ck.className = "clock count"; $("sdReps").style.display = "none";
  $("sdS").textContent = "Repos · " + restTxt(r); $("sdT").textContent = title; $("sdHow").textContent = ""; $("sdVid").textContent = "";
  $("sdGo").style.display = ""; $("sdGo").textContent = nx ? "Passer le repos" : "Terminer la séance";
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
  const old = pg().best[b.name] || 0, pr = v > old; if (pr) pg().best[b.name] = v;
  if (b.ms && MS[b.ms] && MS[b.ms].type === b.kind) { const x = st(b.ms); if (v > x.best) x.best = v; if (v >= MS[b.ms].target && !x.done) { const msg = hitTarget(b.ms); if (msg) toast(msg); else toast("« " + MS[b.ms].name + " » validée : deux séances à la cible !"); }
    if (s.auto && sd.tg) { const r = sessRes[b.ms] || (sessRes[b.ms] = {ok:0, miss:0}); if (v >= sd.tg * 0.95) r.ok++; else r.miss++; } }
  S.log.push({t:Date.now(), id:"pg:" + b.name, k:b.kind, v, pr:pr && old > 0}); if (S.log.length > 2000) S.log = S.log.slice(-2000);
  save(); render();
  const nx = nextSet();
  if (!s.rest) { sdStop(); if (nx && sd.day.type !== "gtg") openSet(nx[0], nx[1]); else closeEnd(); return; }
  startRest(s, nx, "Fait : " + num(v) + unit(b) + (pr && old > 0 ? ", record" : ""));
}
$("sdGo").onclick = async e => {
  if (e && e.isTrusted) voiceUnlock();
  const ck = $("sdClock");
  if (sd.mode === "rest") { sdStop(); if (sd.next) openSet(sd.next[0], sd.next[1]); else { const was = AUTO; $("sd").close(); if (was) endSession(); } return; }
  if (sd.fx){
    if (sd.s.dur == null) { saveFixed(); return; }
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
$("sdSave").onclick = () => { const v = parseInt($("sdNum").value, 10); if (v > 0) saveSet(v); };
$("sd").addEventListener("close", () => { AUTO = false; sdStop(); });
$("sdX").addEventListener("click", hush);
// l'écran reste allumé pendant le chrono : le verrou est repris au retour dans l'app, et rendu s'il arrive trop tard
function sdKeep(w){ if (sdTimer) { sdWake = w; w.addEventListener && w.addEventListener("release", () => { if (sdWake === w) sdWake = null; }); } else w.release().catch(()=>{}); }
document.addEventListener("visibilitychange", () => { if (!document.hidden && sdTimer && !sdWake) keepAwake(sdKeep); });
