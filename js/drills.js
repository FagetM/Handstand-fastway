// Exercices d’accompagnement : la bibliothèque (DRILLS), le choix par figure (drillsFor) et le bloc prêt à jouer (drillBlock).
"use strict";
// ---------- Exercices d’accompagnement : ce qui prépare chaque figure, en plus de la figure elle-même ----------
// sets : [séries, durée en s] (tenue) ou [séries, répétitions] (reps). Repères généraux d’entraînement.
const DRILLS = {
  miseEnRoute:{name:"Mise en route", kind:"hold", sets:[1,150], how:"2 minutes et demie : marche rapide ou petits sauts sur place pour réchauffer, puis haussements et ouvertures d’omoplates, bras tendus devant toi. Le corps chaud avant les poignets."},
  poignets:{name:"Préparation des poignets", kind:"hold", sets:[1,300], how:"5 minutes : cercles dans les deux sens, appuis sur les paumes en avançant les épaules, sur le dos des mains, sur le bout des doigts, puis 2 × 10 pompes de poignets (soulève-toi sur les doigts). Les poignets portent tout ton poids : ne la saute jamais."},
  hollow:{name:"Gainage en cuillère", kind:"hold", sets:[3,25], how:"Sur le dos, bas du dos plaqué au sol, bras tendus derrière la tête, jambes tendues décollées. C’est la ligne du corps en équilibre. Trop dur : genoux vers la poitrine, puis tends les jambes ; si le bas du dos décolle, remonte les jambes."},
  dentele:{name:"Épaules aux oreilles", kind:"reps", sets:[2,10], how:"À quatre pattes, index vers l’avant : repousse le sol, bras tendus, la poitrine s’éloigne du sol et le haut du dos s’arrondit, 2 s. Puis à genoux, bras tendus au-dessus de la tête : épaules aux oreilles, coudes rapprochés, 2 s."},
  tuckMur:{name:"Groupés glissés au mur", kind:"reps", sets:[2,5], how:"Ventre au mur, mains à deux mains du mur, en chaussettes : glisse les pieds en groupant, genoux à la poitrine, puis remonte jambes tendues. Les épaules ne bougent pas."},
  epaules:{name:"Ouverture des épaules", kind:"hold", sets:[2,40], how:"À genoux, mains sur une chaise ou un banc, bras tendus : laisse descendre la poitrine, puis rentre le bassin, serre le ventre, ramène les côtes. L’étirement reste dans les épaules, pas dans le bas du dos."},
  omoplates:{name:"Pompes d’omoplates en équilibre au mur", kind:"reps", sets:[3,8], how:"Poitrine face au mur, bras tendus : laisse le corps descendre de quelques centimètres en relâchant les épaules, puis repousse le sol vers les oreilles."},
  c2w:{name:"Tenue poitrine face au mur", kind:"hold", sets:[3,30], how:"Monte en marchant les pieds le long du mur, mains à 15 à 20 cm du mur (une longueur de main). Seuls les orteils touchent le mur, ventre décollé, poussée dans les épaules."},
  toepull:{name:"Décollages du mur", kind:"reps", sets:[4,5], how:"En équilibre poitrine face au mur, appuie dans les doigts pour décoller les pieds du mur et tiens une ou deux secondes, puis reviens."},
  kickup:{name:"Montées contrôlées", kind:"reps", sets:[2,8], how:"Sans mur, monte en fente et cherche à t’arrêter pile à la verticale, sans dépasser. Sors en roue si tu pars trop loin."},
  doigts:{name:"Corrections avec les doigts", kind:"reps", sets:[3,5], how:"Au mur ou libre : volontairement, laisse partir le poids vers le dos puis rattrape-le en appuyant fort dans le bout des doigts."},
  pike:{name:"Compressions jambes tendues", kind:"reps", sets:[3,10], how:"Assis jambes tendues, mains au sol près des genoux : décolle les talons en ramenant les jambes vers toi. Prépare les 7 et les montées."},
  pancake:{name:"Écart facial penché", kind:"hold", sets:[2,45], pnf:1, how:"Assis jambes écartées, dos plat, penche-toi vers l’avant le plus loin possible sans arrondir le dos."},
  shift:{name:"Transferts de poids au mur", kind:"reps", sets:[3,6], how:"Dos au mur, jambes écartées : glisse le poids sur une main jusqu’à alléger l’autre, puis reviens au centre. Côté gauche, puis côté droit."},
  lean:{name:"Planche inclinée", kind:"hold", sets:[3,20], how:"Position de pompe, bras tendus, épaules loin devant les mains, omoplates écartées. Avance un peu plus à chaque série."},
  pseudo:{name:"Pompes mains aux hanches", kind:"reps", sets:[3,8], how:"Pompes avec les mains à hauteur des hanches, doigts vers l’extérieur : les épaules passent loin devant les mains."},
  frog:{name:"Grenouille", kind:"hold", sets:[3,10], how:"Accroupi, mains au sol, genoux posés sur les coudes : bascule vers l’avant jusqu’à décoller les pieds. Les premières fois, un coussin devant le visage, et des tenues courtes."},
  oawall:{name:"Tenue un bras dos au mur", kind:"hold", sets:[3,20], sides:1, how:"Dos au mur, jambes écartées : transfère le poids sur une main, retire l’autre et tiens. Épaule poussée vers l’oreille, bassin au-dessus de la main. Côté faible d’abord."},
  oashrug:{name:"Haussements d’épaule à un bras", kind:"reps", sets:[3,8], sides:1, how:"En appui à un bras au mur, bras verrouillé : laisse l’épaule descendre puis repousse-la vers l’oreille. La force de base de l’équilibre sur un bras."},
  tuckflag:{name:"Drapeaux groupés pulsés", kind:"reps", sets:[3,6], how:"En équilibre, genoux groupés : incline-les sur le côté en petits rebonds contrôlés, puis tiens 3 s la position la plus basse. Change de côté."},
  biceps:{name:"Renforcement du biceps bras tendu", kind:"reps", sets:[3,12], rest:45, how:"Curl bras presque tendu, à l’élastique, avec un haltère léger ou un sac un peu lesté, lent : prépare le tendon du biceps et le coude au travail bras tendus."},
  tuck2strad:{name:"Extensions tuck vers straddle", kind:"reps", sets:[4,3], how:"Depuis l’advanced tuck, ouvre les jambes en straddle 2 s puis reviens, sans laisser tomber les hanches."},
  // avec du matériel (réglages › Mon matériel)
  bandpl:{name:"Planche à l’élastique", kind:"hold", sets:[4,10], rest:150, how:"Élastique en boucle sous les hanches, fixé en hauteur par un ancrage de porte (porte fermée à clé) : tiens la position de l’étape suivante, bras verrouillés, omoplates écartées.", eq:"band"},
  lsitpara:{name:"L-sit sur parallettes", kind:"hold", sets:[3,15], how:"Bras verrouillés, épaules abaissées loin des oreilles, jambes tendues à l’horizontale (groupé si besoin).", eq:"para"},
  dipsW:{name:"Dips lestés", kind:"reps", sets:[3,6], rest:90, alt:{name:"Dips lents (sans gilet)", reps:10, how:"Sans gilet aujourd’hui : descente en 3 secondes, une seconde en bas, remontée bras verrouillés."}, how:"Sur barres ou supports fixes, jamais sur des chaises avec le gilet : descends coudes à 90°, épaules basses, remonte bras verrouillés. Force de base pour la planche.", eq:"kg"},
  pushW:{name:"Pompes lestées", kind:"reps", sets:[3,8], rest:90, alt:{name:"Pompes lentes (sans gilet)", reps:12, how:"Sans gilet aujourd’hui : descente en 3 secondes, poitrine au sol, épaules devant les mains."}, how:"Gilet lesté, corps gainé, poitrine jusqu’au sol. Force de base pour la planche.", eq:"kg"},
  protrac:{name:"Pompes d’omoplates en planche inclinée", kind:"reps", sets:[3,10], how:"Position de pompe, bras tendus, épaules devant les mains : sans plier les coudes, rapproche puis écarte les omoplates. Le dos s’arrondit à chaque poussée."},
  pikepulse:{name:"Pulsations en pike", kind:"reps", sets:[3,15], how:"Assis jambes serrées tendues, mains près des chevilles, dos rond : décolle les talons et fais de petites pulsations sans reposer."},
  appuiArr:{name:"Appui arrière sur parallettes", kind:"hold", hands:1, sets:[3,20], rest:45, how:"Mains derrière le bassin, doigts vers l’arrière, bras tendus, bassin levé, épaules basses et ouvertes."},
  mannaLift:{name:"Bassin qui avance depuis l’équerre", kind:"reps", sets:[3,5], rest:60, how:"En équerre groupée sur parallettes, pousse le bassin devant les mains et reviens, 2 s à chaque fois. Bras tendus."},
  extEp:{name:"Épaules en extension", kind:"hold", hands:1, sets:[3,30], rest:30, how:"Assis, mains au sol derrière toi doigts vers l’arrière (ou sur un banc) : avance le bassin, ouvre la poitrine, bras tendus. Sans douleur à l’avant de l’épaule."},
  tirage:{name:"Tirage à l’élastique", kind:"reps", sets:[3,12], rest:40, eq:"band", how:"Élastique à l’ancrage de porte : tire les coudes en arrière, serre les omoplates 1 s, reviens en 3 s."},
  rotext:{name:"Rotation externe d’épaule", kind:"reps", sets:[2,15], rest:30, eq:"band", sides:true, how:"Coude au corps à 90°, écarte la main vers l’extérieur contre l’élastique, lentement."},
  extpoig:{name:"Extenseurs du poignet", kind:"reps", sets:[2,15], rest:30, eq:"band", sides:true, how:"Avant-bras sur la cuisse, paume vers le sol : relève le poing contre l’élastique, redescends en 3 s."},
  stradlift:{name:"Élévations jambes écartées", kind:"reps", sets:[3,8], rest:45, how:"En écart facial, mains au sol devant le bassin : lève les deux jambes tendues, tiens 2 s, repose sans bruit."},
  elevpress:{name:"Montée pieds surélevés", kind:"reps", sets:[4,2], rest:90, how:"Mains sur parallettes, pieds sur une chaise, jambes écartées : épaules devant, le bassin monte jusqu’à l’équilibre, dos au mur si besoin."},
  stalneg:{name:"Descentes du stalder", kind:"reps", sets:[3,2], rest:120, how:"Sur parallettes : de l’équilibre à l’équerre écartée en 5 secondes, sans poser les pieds.", eq:"para"},
  // souplesse active (5 min en fin de séance) : soulever l’amplitude qu’on sait atteindre
  pikeAct:{name:"Pliage actif", kind:"reps", sets:[3,8], how:"Assis jambes serrées tendues, mains au sol à côté des genoux : décolle les talons et tiens 2 s, le buste penché vers les jambes, sans t’aider des bras."},
  ecartAct:{name:"Écart actif, décollages", kind:"reps", sets:[3,10], how:"Assis en écart facial, buste penché vers l’avant, mains au sol devant toi : décolle une jambe tendue puis l’autre, tiens 2 s."},
  cavalier:{name:"Squat cavalier lent", kind:"hold", sets:[3,20], how:"Pieds très écartés, pointes vers l’extérieur : descends lentement, genoux au-dessus des pieds, dos droit, et tiens en bas."},
  jambesMur:{name:"Levées de jambe actives", kind:"reps", sets:[2,8], sides:1, how:"Debout, une main au mur : lève la jambe tendue devant puis sur le côté, le plus haut possible sans t’aider, tiens 2 s en haut."},
  epAct:{name:"Décollages des bras au mur", kind:"reps", sets:[3,8], how:"Ventre contre le mur, bras tendus au-dessus de la tête, pouces au mur : décolle les mains du mur sans creuser le bas du dos, tiens 2 s."},
  poignetsAct:{name:"Poignets actifs", kind:"reps", sets:[2,10], hands:1, how:"À genoux, paumes à plat : avance doucement les épaules devant les mains, puis décolle les paumes en gardant les doigts au sol, et repose."},
  // souplesse douce (jours de récup) : tenues longues, toujours échauffé, sans rebond ni personne pour pousser
  pliage:{name:"Pliage en pike, PNF", kind:"hold", sets:[3,40], pnf:1, how:"Assis jambes tendues, dos long : penche-toi depuis les hanches. Pousse 6 s les talons dans le sol à moitié de ta force, relâche, puis descends un peu plus."},
  ecartF:{name:"Grand écart facial sur blocs", kind:"hold", sets:[2,45], how:"Un bloc ou un coussin sous le bassin, pointes vers le plafond : descends doucement sans forcer, respire. Une douleur vive à l’aine : stop."},
  demiEcart:{name:"Demi grand écart", kind:"hold", sets:[2,30], sides:1, how:"Genou arrière au sol, jambe avant tendue, pointe vers toi : penche le buste dos plat au-dessus de la jambe avant."},
  fente:{name:"Fente basse", kind:"hold", sets:[2,30], sides:1, how:"Genou arrière au sol, bassin qui avance et descend, fesse serrée : l’avant de la hanche arrière s’étire."},
  ecartAP:{name:"Grand écart antéro-postérieur sur blocs", kind:"hold", sets:[1,60], sides:1, how:"Un bloc sous la cuisse avant, bassin de face : descends seulement tant que c’est confortable. Jamais de rebond."},
  pont:{name:"Pont progressif", kind:"hold", sets:[3,20], hands:1, how:"Après les épaules en extension : pont sur les mains, bras tendus, épaules au-dessus des poignets. Débutant : mains sur un banc ou descentes le long du mur. Mal au bas du dos : stop."},
  poignetsExt:{name:"Poignets en extension", kind:"hold", sets:[2,30], hands:1, how:"À genoux, paumes à plat, doigts vers l’avant : avance les épaules au-delà des mains, sans douleur, et respire."},
  leanPress:{name:"Pressions en lean", kind:"reps", sets:[3,8], rest:60, how:"En planche lean, bras verrouillés : avance les épaules de quelques centimètres puis reviens, lentement, sans plier les coudes."},
  ironWrist:{name:"Poignets d’acier", kind:"reps", sets:[2,15], hands:1, how:"À genoux, paumes au sol : 15 poussées dans les paumes en avançant les épaules, 15 sur le dos des poignets doucement, puis 15 levées de doigts en alternance."},
  gainLat:{name:"Gainage latéral", kind:"hold", sets:[2,30], sides:1, how:"Sur un avant-bras ou bras tendu, corps aligné sur le côté, bassin haut. Change de côté."},
  gainArr:{name:"Gainage inversé", kind:"hold", sets:[2,30], hands:1, how:"Assis, mains derrière toi, monte le bassin jusqu’à aligner épaules, hanches et chevilles, bras tendus."},
  ruades:{name:"Ruades", kind:"reps", sets:[3,6], rest:45, how:"Mains au sol, petits sauts jambes groupées pour amener les hanches au-dessus des épaules, puis retour doux. On apprend à monter sans peur, avant la montée en fente."},
  rowTable:{name:"Tirage sous une table", kind:"reps", sets:[3,10], rest:45, how:"Allongé sous une table solide, mains au bord, corps gainé : tire la poitrine vers la table, serre les omoplates, redescends lentement."},
  pikepu:{name:"Pompes en V inversé", kind:"reps", sets:[3,8], how:"Bassin en l’air, la tête descend entre les mains, puis tu repousses. Pieds surélevés pour plus de difficulté."},
};
function drillsFor(m){
  const s = m.sec, id = m.id, out = [];
  if (s === "base") out.push("dentele","hollow","gainLat","frog");
  else if (s === "starter") out.push("ruades","dentele","hollow","gainArr","epaules");
  else if (s === "b1") out.push("c2w","kickup","toepull","hollow");
  else if (s === "b2") out.push(...(["in_tuck","in_holds","in_changes"].includes(id) ? ["tuckMur"] : []), "c2w","kickup","doigts","hollow");
  else if (s === "inter") out.push(/7|toes/.test(id) ? "pike" : "doigts", /7/.test(id) ? "pancake" : "kickup", "omoplates");
  else if (s === "onearm") out.push(...(id === "oa_strad30" || id === "oa_tuckflag" ? ["shift","pancake"] : []), "oawall","oashrug","doigts");
  else if (s === "planche" && !["pl_lean","pl_ppp"].includes(id)) out.push("leanPress");
  if (s === "planche") out.push(id === "pl_lean" || id === "pl_ppp" ? "lean" : (S.equip || {}).kg && st("fd_dips").done ? "dipsW" : "lean","protrac","pseudo","biceps");
  if (["pl_frog","pl_1leg","pl_straddle"].includes(id)) out.unshift("tuck2strad");
  if (id === "oa_flaghoriz" || id === "oa_wall") out.unshift("tuckflag");
  if (s === "press") out.push("pikepulse","stradlift","pancake","omoplates");   // l’appui penché reste réservé aux jours de planche
  if (id === "pr_straddle") out.unshift("elevpress");
  if (/^pr_(manna|vsitH|extSup)/.test(id)) { out.splice(0, out.length, "extEp", ...(frag("epaule") ? [] : ["appuiArr"]), "mannaLift", "biceps", "pancake"); }   // la manna, c’est d’abord des épaules en extension
  if (s === "ultime") out.push("doigts","extEp","omoplates");
  if (id === "pr_stalder" || id === "pr_lsitHs") { out.unshift("stalneg"); if ((S.equip || {}).para) out.unshift("lsitpara"); }
  else if (s === "low") out.push("frog","omoplates");
  if (id === "in_hspu") out.unshift("pikepu");
  const E = S.equip || {};
  if (E.band && ["pl_tuck","pl_adv","pl_frog","pl_1leg","pl_straddle","pl_full"].includes(id)) out.unshift("bandpl");
  if ((E.para || E.blocks) && (s === "planche" || s === "press")) out.push("lsitpara");
  if (E.kg && ["pl_lean","pl_ppp","pl_tuck"].includes(id) && st("fd_push").done) out.push("pushW");
  const iw = out.indexOf("dipsW"); if (iw > 0) { out.splice(iw, 1); out.unshift("dipsW"); }   // la force de base de la planche passe en premier
  const dup = {oa_tuckflag:"tuckflag", oa_shrug:"oashrug", pr_pikeLift:"pikepulse", pr_stradLift:"stradlift", pl_strBand:"bandpl", pl_strBandL:"bandpl", pl_fullBand:"bandpl"}[id];
  return [...new Set(out)].filter(k => k !== dup);
}
// gilet lesté : « pas de gilet aujourd’hui » remplace les exercices lestés par leur version lente, sans charge
const noVest = () => S.noVest === dayKey(Date.now());
function setNoVest(on){ S.noVest = on ? dayKey(Date.now()) : null;
  const bd = S.bday && S.bday.d === dayKey(Date.now()) ? S.bday : null;   // séance du jour déjà composée : on échange les blocs lestés restants
  if (bd) bd.blocks = bd.blocks.map((b, bi) => b.dk && DRILLS[b.dk].eq === "kg" && !Object.keys(wkGet(todayIdx())).some(x => x.startsWith(bi + "-")) ? Object.assign(drillBlock(b.dk, painRecent()), {sets:drillBlock(b.dk, painRecent()).sets.slice(0, b.sets.length)}) : b);
  save(); render(); }
const drillBlock = (k, pain) => { const d = DRILLS[k];
  // parallettes : les exercices d’appui se font dessus ; lest : on indique la charge
  const E = S.equip || {}, nv = d.eq === "kg" && (noVest() || deloadWeek()) && d.alt, d2 = nv ? Object.assign({}, d, {name:d.alt.name, how:d.alt.how, sets:[d.sets[0], d.alt.reps]}) : d;
  const how = d2.how + (eqLine(k) ? " " + eqLine(k) : "") + (E.para && ["lean","pseudo","protrac","bandpl"].includes(k) ? " Sur parallettes si tu veux : poignets ménagés." : "")
    + (d.eq === "kg" && !nv ? " Charge : commence à 5 kg" + (E.kg > 5 ? ", monte jusqu’à " + E.kg + " kg quand les 3 séries sont propres." : ".") : "");
  const n = Math.max(1, pain ? d2.sets[0] - 1 : d2.sets[0]);
  return {name:k === "lsitpara" && !E.para ? "L-sit sur briques de yoga" : d2.name, kind:d.kind, how, dk:k, pnf:d.pnf ? true : undefined, sets:Array.from({length:n}, ()=>d.kind === "hold" ? {dur:d2.sets[1], rest:d.rest || 30, sides:d.sides ? true : undefined} : {reps:d2.sets[1], rest:d.rest || 30, sides:d.sides ? true : undefined})}; };
