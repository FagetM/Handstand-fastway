// Maîtrise du corps : postures tenues de plus en plus longtemps (esprit gymnaste-yogi), météo du corps, petites histoires.
"use strict";
// Chaque séance est une suite de postures tenues, enchaînées toute seule par la séance guidée.
const zh = (name, dur, how, x) => Object.assign({name, how, kind:"hold", sets:[{dur}]}, x || {});
const zr = (name, n, reps, how) => ({name, how, kind:"reps", sets:Array.from({length:n}, () => ({reps}))});
const zn = (n, name, dur, how, x) => Object.assign(zh(name, dur, how, x), {sets:Array.from({length:n}, () => ({dur})), work:true});
// Maîtrise : l’esprit gymnaste-yogi. Chaque séance est une échelle de paliers verrouillés : on n’en saute aucun.
// Dans un palier, les tenues de travail (work) s’allongent quand la séance est propre avec de la marge ; le palier se valide
// quand elles ont atteint leur plafond (up secondes de plus) et que deux séances propres, à 48 h d’écart au moins, le confirment.
const W = {
  bascules:zh("Bascules à quatre pattes", 60, "Mains à plat, doigts écartés : avance et recule les épaules au-dessus des mains, lentement."),
  doigts:d => zn(3, "Appui sur le bout des doigts", d, "Genoux au sol, mains en griffe, paumes décollées. Pousse dans les doigts."),
  lean:d => zn(3, "Planche inclinée", d, "Bras verrouillés, épaules devant les mains, omoplates écartées. Le poids sur les poignets."),
  leanD:d => zn(3, "Planche inclinée sur les doigts", d, "Même planche inclinée, paumes décollées : le poids sur le bout des doigts."),
  dos:zh("Appui sur le dos des mains", 30, "À genoux, dos des mains au sol, doigts vers toi : bascule doucement le poids."),
  ppoig:n => zr("Pompes de poignets", 2, n, "À genoux, paumes au sol : monte sur les doigts puis redescends, bras tendus."),
  talons:n => zr("Levées de talons en pike", 3, n, "Assis jambes tendues, mains près des genoux : décolle les talons sans te pencher en arrière."),
  lgroup:d => zn(4, "L-sit groupé", d, "Mains au sol ou sur parallettes, bras tendus : décolle les fesses, genoux à la poitrine."),
  lone:d => zn(3, "L-sit une jambe tendue", d, "L-sit groupé, puis tends une jambe devant toi. Alterne la jambe à chaque série."),
  lsit:d => zn(3, "L-sit", d, "Jambes tendues et serrées à l’horizontale, épaules abaissées, bras verrouillés."),
  cuil:d => zn(3, "Cuillère creuse", d, "Sur le dos, bas du dos plaqué, bras et jambes tendus décollés. La ligne de l’équilibre."),
  ecart:zn(2, "Écart facial actif", 30, "Assis jambes écartées, dos plat : penche-toi en avant et soulève les talons par moments."),
  chiot:zh("Posture du chiot", 60, "À genoux, bras tendus loin devant, poitrine vers le sol : ouvre les épaules."),
  chien:d => zn(3, "Chien tête en bas actif", d, "Pousse le sol, épaules aux oreilles, talons vers le sol. Les bras dans la ligne du dos."),
  murEp:d => zn(3, "Épaules au mur", d, "Dos au mur (ou allongé sur le dos) : bras tendus au-dessus de la tête, mains au mur, côtes rentrées."),
  omoP:n => zr("Pompes d’omoplates en pike", 2, n, "En V inversé, bras tendus : laisse descendre puis repousse avec les épaules seulement."),
  creux:d => zn(3, "Gainage creux", d, "Position de pompe, dos légèrement arrondi, fesses serrées. Pousse le sol."),
  pikeBox:d => zn(3, "Appui tendu en pike, pieds sur une caisse", d, "Pieds sur une chaise, bassin au-dessus des épaules, bras tendus aux oreilles. Pousse le sol."),
  dosMur:d => zn(3, "Équilibre dos au mur", d, "Talons contre le mur, mains à 20 cm : corps droit, épaules ouvertes, regard entre les mains."),
  corbeau:d => zn(4, "Corbeau", d, "Genoux sur l’arrière des bras, regard devant : bascule jusqu’à décoller les pieds. Tiens, sans à-coup."),
  corbeauT:d => zn(4, "Corbeau bras tendus", d, "Genoux haut sur les bras tendus, épaules devant les mains, dos rond. Immobile."),
  latérale:d => zh("Planche latérale", d, "Sur une main, corps aligné, hanche haute. Le bras libre tendu vers le ciel.", {sides:1}),
  chat:d => zn(3, "Chaturanga tenu", d, "Descends à mi-pompe, coudes contre le corps, épaules devant les mains. Tiens."),
  pseudo:d => zn(3, "Pseudo-planche", d, "Position de pompe, mains au niveau des hanches, épaules loin devant, bras verrouillés. Tiens."),
  transi:n => zr("Planche vers chien, au ralenti", 2, n, "De la planche au chien tête en bas en 4 secondes, puis retour en 4 secondes."),
  guerrier:zh("Guerrier III", 30, "Sur une jambe, corps et jambe arrière à l’horizontale, bras devant. Immobile.", {sides:1}),
};
const ZEN = [
  {id:"poignets", name:"Poignets solides", min:9, when:"Avant l’équilibre ou la planche : des poignets qui encaissent", tiers:[
    {name:"Doigts 3 × 15 s → 25 s", up:10, blocks:[W.bascules, W.doigts(15), W.lean(20), W.dos, W.ppoig(10)]},
    {name:"Doigts 3 × 20 s, planche inclinée 3 × 30 s", up:10, blocks:[W.bascules, W.doigts(20), W.lean(30), W.dos, W.ppoig(12)]},
    {name:"Planche inclinée sur les doigts 3 × 15 s", up:10, blocks:[W.bascules, W.leanD(15), W.lean(30), W.dos, W.ppoig(15)]}]},
  {id:"compression", name:"Compression", min:12, when:"Pour la montée en force et la planche : des abdos qui ramènent", tiers:[
    {name:"L-sit groupé 4 × 10 s → 20 s", up:10, blocks:[W.talons(10), W.lgroup(10), W.cuil(20), W.ecart]},
    {name:"L-sit groupé 4 × 20 s, cuillère 3 × 30 s", up:10, blocks:[W.talons(12), W.lgroup(20), W.cuil(30), W.ecart]},
    {name:"L-sit une jambe tendue 3 × 10 s", up:10, blocks:[W.talons(15), W.lone(10), W.cuil(35), W.ecart]},
    {name:"L-sit 3 × 10 s", up:10, blocks:[W.talons(15), W.lsit(10), W.cuil(45), W.ecart]},
    {name:"Équerre écartée 3 × 10 s", up:10, blocks:[W.talons(15), zn(3, "Équerre écartée", 10, "Mains entre les jambes, fesses et talons décollés."), W.cuil(45), W.ecart]}]},
  {id:"ligne", name:"Ligne et épaules", min:10, when:"Pour un équilibre droit : épaules ouvertes, corps gainé", tiers:[
    {name:"Épaules au mur et chien actif 3 × 30 s", up:15, blocks:[W.chiot, W.chien(30), W.murEp(30), W.omoP(10), W.creux(30)]},
    {name:"Gainage creux 3 × 45 s, appui pike sur caisse", up:10, blocks:[W.chiot, W.creux(45), W.pikeBox(20), W.omoP(12)]},
    {name:"Équilibre dos au mur 3 × 30 s", up:15, blocks:[W.chiot, W.pikeBox(30), W.dosMur(30), W.creux(45)]}]},
  {id:"controle", name:"Contrôle lent", min:12, when:"Poses tenues et transitions lentes", tiers:[
    {name:"Corbeau 4 × 15 s → 30 s", up:15, blocks:[W.corbeau(15), W.latérale(30), W.chat(10), W.transi(6), W.guerrier]},
    {name:"Corbeau 4 × 30 s, chaturanga 3 × 20 s", up:10, blocks:[W.corbeau(30), W.latérale(45), W.chat(20), W.transi(8)]},
    {name:"Corbeau bras tendus 4 × 10 s, pseudo-planche", up:10, blocks:[W.corbeauT(10), W.pseudo(15), W.chat(20)]},
    {name:"Corbeau bras tendus 4 × 20 s", up:10, blocks:[W.corbeauT(20), W.pseudo(20), W.chat(20)]}]},
  {id:"recup", name:"Récup active", min:8, when:"Après la séance ou un jour léger : on récupère en bougeant", free:true, tiers:[
    {name:"Mobilité libre", up:0, blocks:[zh("Étirement des avant-bras", 60, "À genoux, doigts vers toi, recule doucement les épaules. Puis dos des mains."),
      zh("Enfant bras longs", 60, "Fesses vers les talons, bras allongés loin devant : les épaules s’étirent."),
      zh("Pigeon", 45, "Jambe avant pliée devant toi, jambe arrière allongée : laisse descendre les hanches.", {sides:1}),
      zh("Chien tête en bas", 45, "Pédale doucement avec les talons, pousse le sol."),
      zh("Torsion couchée", 30, "Genoux d’un côté, épaules au sol.", {sides:1})]}]},
];
// état d’une échelle : palier, nombre de crans gagnés (un cran = +2 s sur une tenue courte, +5 s sinon), séances propres au plafond (dates)
const zst = id => { const all = S.zst || (S.zst = {}); return all[id] || (all[id] = {tier:0, add:0, ok:[]}); };
const zTier = z => z.tiers[Math.min(zst(z.id).tier, z.tiers.length - 1)];
const zStep = d => d <= 15 ? 2 : 5;   // +2 s sur les tenues courtes, +5 s sinon
function zenP(){
  const day = z => { const t = zTier(z), add = zst(z.id).add;
    const d = {type:"train", blocks:t.blocks.map(b => ({name:b.name, how:b.how, kind:b.kind, zen:true,
      sets:b.sets.map(s => s.dur ? {dur:s.dur + (b.work ? Math.min(t.up, add * zStep(s.dur)) : 0), sides:b.sides ? true : undefined, rest:b.sets.length > 1 ? 20 : undefined} : {reps:s.reps, rest:20})}))};
    const o = {}; DAYK.forEach(x => o[x] = d); return o; };
  return {id:"detente", name:"Postures", zen:true, steps:ZEN.map(z => ({name:z.name, info:z.when, days:day(z)}))};
}
document.querySelectorAll("#zfDlg [data-zk]").forEach(b => b.onclick = () => zenRate(b.dataset.zk));
const zenIdx = id => Math.max(0, ZEN.findIndex(z => z.id === id));
function openZen(id){ pg().cur = "detente"; pickP(); pp().step = zenIdx(id); save(); render(); showTab("today"); window.scrollTo(0, 0); }
const zenTxt = z => z.free ? "Toujours accessible" : "Palier " + (zst(z.id).tier + 1) + "/" + z.tiers.length + " : " + zTier(z).name.charAt(0).toLowerCase() + zTier(z).name.slice(1) + (zst(z.id).fin ? ", échelle terminée" : "");
// fin d’une séance de Maîtrise : la forme décide. Propre avec de la marge : on allonge (au plafond, ça compte pour valider le palier).
// Juste : on garde. Ça s’affaisse ou ça tire : on revient un cran en arrière. Fatigué·e : la séance compte, sans faire progresser.
function zenRate(k){
  const z = ZEN[pp().step]; $("zfDlg").close(); if (!z) return;
  const x = zst(z.id), t = zTier(z), now = Date.now();
  // plafond : assez de crans pour que chaque tenue de travail ait gagné « up » secondes
  const cap = Math.max(1, ...t.blocks.filter(b => b.work).map(b => Math.ceil(t.up / zStep(b.sets[0].dur))));
  let msg = "Séance enregistrée.";
  if (z.free) msg = "Récup faite.";
  else if (k === "bad") { x.add = Math.max(0, x.add - 1); x.ok = []; msg = "On revient un cran en arrière : la forme d’abord."; }
  else if (k === "ok") msg = "On garde les mêmes temps.";
  else if (moodToday() === "fatigue") msg = "Séance comptée. Fatigué·e aujourd’hui : on entretient, sans allonger.";
  else if (k === "top") {
    if (x.add < cap) { x.add++; msg = "Propre et avec de la marge : les tenues s’allongent la prochaine fois."; }
    else { if (!x.ok.length || now - x.ok[x.ok.length - 1] >= 48 * 3600e3) x.ok.push(now);
      if (x.ok.length >= 2 && x.tier < z.tiers.length - 1) { x.tier++; x.add = 0; x.ok = []; msg = "Palier validé : « " + zTier(z).name + " » s’ouvre."; say("Palier validé.", true); }
      else if (x.ok.length >= 2) { x.fin = true; x.ok = x.ok.slice(-2); msg = "Dernier palier maîtrisé. Garde-le en entretien."; }
      else msg = "Au plafond du palier, propre : refais une séance comme ça dans 2 jours ou plus pour le valider."; } }
  if (!z.free && (z.id === "poignets" || z.id === "controle")) { const zw = S.zw || (S.zw = []), d = dayKey(Date.now()); if (!zw.includes(d)) zw.push(d); if (zw.length > 60) zw.shift(); }   // jour d’appui sur les mains : compte dans la charge des poignets
  if (!z.free && ((z.id === "poignets" && x.tier >= 2) || (z.id === "controle" && x.tier >= 2) || (z.id === "compression" && x.tier >= 3))) { const zf = S.zf || (S.zf = []), d = dayKey(Date.now()); if (!zf.includes(d)) zf.push(d); if (zf.length > 60) zf.shift(); }
  save(); render(); toast(msg);
}
// Météo du corps : trois secondes avant la séance pour écouter comment on va. Elle règle la séance du jour.
const MOODS = [["top","En forme",""],["calme","Tranquille",""],["fatigue","Fatigué·e",""],["raide","Raide",""]];
const moodToday = () => S.mood && S.mood.d === dayKey(Date.now()) ? S.mood.k : null;
function setMood(k){ S.mood = {d:dayKey(Date.now()), k}; if (S.bday && S.bday.d === dayKey(Date.now()) && !Object.keys(wkGet(todayIdx())).length) S.bday = null; save(); render();
  toast(k === "fatigue" ? "Séance plus courte aujourd’hui, sans tentative à fond." : k === "raide" ? "On ajoute un peu de mobilité en début de séance." : k === "calme" ? "Séance normale, à ton rythme." : "Séance complète, tentatives permises."); }

// (les petites histoires du personnage ont été retirées avec la carte du conseil du jour)
