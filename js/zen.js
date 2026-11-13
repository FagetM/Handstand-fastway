// Maîtrise du corps : postures tenues de plus en plus longtemps (esprit gymnaste-yogi), météo du corps, petites histoires.
"use strict";
// Chaque séance est une suite de postures tenues, enchaînées toute seule par la séance guidée.
const zh = (name, dur, how, x) => Object.assign({name, how, kind:"hold", sets:[{dur}]}, x || {});
const zr = (name, n, reps, how) => ({name, how, kind:"reps", sets:Array.from({length:n}, () => ({reps}))});
const zn = (n, name, dur, how, x) => Object.assign(zh(name, dur, how, x), {sets:Array.from({length:n}, () => ({dur}))});
// Maîtrise : l'esprit gymnaste-yogi. Des postures tenues, contrôlées, de plus en plus longtemps, au service de la planche et du un bras.
// Chaque séance terminée allonge ses tenues de 6 % (jusqu'à +60 %) : on maîtrise la pose, puis on l'étire dans le temps.
const ZEN = [
  {id:"poignets", name:"Poignets solides", min:9, when:"Avant l'équilibre ou la planche : des poignets qui encaissent",
   blocks:[zh("Bascules à quatre pattes", 60, "Mains à plat, doigts écartés : avance et recule les épaules au-dessus des mains, lentement."),
           zn(3, "Appui sur le bout des doigts", 15, "Genoux au sol, mains en griffe, paumes décollées. Pousse dans les doigts."),
           zn(3, "Planche inclinée", 20, "Bras verrouillés, épaules devant les mains, omoplates écartées. Le poids sur les poignets."),
           zh("Appui sur le dos des mains", 30, "À genoux, dos des mains au sol, doigts vers toi : bascule doucement le poids."),
           zr("Pompes de poignets", 2, 10, "À genoux, paumes au sol : monte sur les doigts puis redescends, bras tendus.")]},
  {id:"compression", name:"Compression", min:12, when:"Pour la montée en force et la planche : des abdos qui ramènent",
   blocks:[zr("Levées de talons en pike", 3, 10, "Assis jambes tendues, mains près des genoux : décolle les talons sans te pencher en arrière."),
           zn(4, "L-sit groupé", 10, "Mains au sol ou sur parallettes, bras tendus : décolle les fesses, genoux à la poitrine."),
           zn(3, "Cuillère creuse", 20, "Sur le dos, bas du dos plaqué, bras et jambes tendus décollés. La ligne de l'équilibre."),
           zn(2, "Écart facial actif", 30, "Assis jambes écartées, dos plat : penche-toi en avant et soulève les talons par moments.")]},
  {id:"ligne", name:"Ligne et épaules", min:10, when:"Pour un équilibre droit : épaules ouvertes, corps gainé",
   blocks:[zh("Posture du chiot", 60, "À genoux, bras tendus loin devant, poitrine vers le sol : ouvre les épaules."),
           zn(3, "Chien tête en bas actif", 30, "Pousse le sol, épaules aux oreilles, talons vers le sol. Les bras dans la ligne du dos."),
           zn(3, "Épaules au mur", 30, "Dos au sol, ou face au mur : bras tendus au-dessus de la tête, côtes rentrées, sans cambrer."),
           zr("Pompes d'omoplates en pike", 2, 10, "En V inversé, bras tendus : laisse descendre puis repousse avec les épaules seulement."),
           zn(2, "Gainage creux au sol", 30, "Position de pompe, dos légèrement arrondi, fesses serrées. Pousse le sol.")]},
  {id:"controle", name:"Contrôle lent", min:12, when:"Poses tenues et transitions lentes : le corps sous contrôle",
   blocks:[zn(4, "Corbeau", 15, "Genoux sur l'arrière des bras, regard devant : bascule jusqu'à décoller les pieds. Tiens, sans à-coup."),
           zh("Planche latérale", 30, "Sur une main, corps aligné, hanche haute. Le bras libre tendu vers le ciel.", {sides:1}),
           zn(3, "Chaturanga tenu", 10, "Descends à mi-pompe, coudes contre le corps, épaules devant les mains. Tiens."),
           zr("Planche vers chien, au ralenti", 2, 6, "De la planche au chien tête en bas en 4 secondes, puis retour en 4 secondes."),
           zh("Guerrier III", 30, "Sur une jambe, corps et jambe arrière à l'horizontale, bras devant. Immobile.", {sides:1})]},
  {id:"recup", name:"Récup active", min:8, when:"Après la séance ou un jour léger : on récupère en bougeant",
   blocks:[zh("Étirement des avant-bras", 60, "À genoux, doigts vers toi, recule doucement les épaules. Puis dos des mains."),
           zh("Enfant bras longs", 60, "Fesses vers les talons, bras allongés loin devant : les épaules s'étirent."),
           zh("Pigeon", 45, "Jambe avant pliée devant toi, jambe arrière allongée : laisse descendre les hanches.", {sides:1}),
           zh("Chien tête en bas", 45, "Pédale doucement avec les talons, pousse le sol."),
           zh("Torsion couchée", 30, "Genoux d'un côté, épaules au sol.", {sides:1})]},
];
const zenLvl = id => Math.min(10, ((S.zenDone || {})[id] || 0));
const zenScale = id => 1 + 0.06 * zenLvl(id);
// La Maîtrise est un programme comme les autres : une étape par séance, la même chaque jour de la semaine.
function zenP(){
  const day = z => { const k = zenScale(z.id), d = {type:"train", blocks:z.blocks.map(b => ({name:b.name, how:b.how, kind:b.kind, zen:true,
      sets:b.sets.map(s => s.dur ? {dur:Math.round(s.dur * k / 5) * 5, sides:b.sides ? true : undefined, rest:b.sets.length > 1 ? 20 : undefined} : {reps:s.reps, rest:20})}))};
    const o = {}; DAYK.forEach(x => o[x] = d); return o; };
  return {id:"detente", name:"Maîtrise", zen:true, steps:ZEN.map(z => ({name:z.name, info:z.when, days:day(z)}))};
}
const zenIdx = id => Math.max(0, ZEN.findIndex(z => z.id === id));
function openZen(id){ pg().cur = "detente"; pickP(); pp().step = zenIdx(id); save(); render(); showTab("today"); window.scrollTo(0, 0); }
// séance de Maîtrise terminée : les tenues de cette séance s'allongent la prochaine fois
function zenDone(){ const z = ZEN[pp().step]; if (!z) return; const d = S.zenDone || (S.zenDone = {}); d[z.id] = (d[z.id] || 0) + 1; return z; }

// Météo du corps : trois secondes avant la séance pour écouter comment on va. Elle règle la séance du jour.
const MOODS = [["top","En forme","☀️"],["calme","Tranquille","🌤️"],["fatigue","Fatigué·e","🌧️"],["raide","Raide","🌬️"]];
const moodToday = () => S.mood && S.mood.d === dayKey(Date.now()) ? S.mood.k : null;
function setMood(k){ S.mood = {d:dayKey(Date.now()), k}; if (S.bday && S.bday.d === dayKey(Date.now()) && !Object.keys(wkGet(todayIdx())).length) S.bday = null; save(); render();
  toast(k === "fatigue" ? "Merci de l'avoir dit. Séance plus courte aujourd'hui, sans tentative à fond." : k === "raide" ? "On ajoute un peu de mobilité en début de séance." : k === "calme" ? "Séance normale, à ton rythme." : "Belle énergie : profite, sans forcer."); }

// Petites histoires : racontées par le personnage dans le conseil du jour, une par jour.
const STORIES = [
  "À 19 ans, je comptais mes secondes à l'envers. Une coach m'a demandé : « Et ta respiration ? » Elle était bloquée. Le jour où j'ai expiré, j'ai tenu deux fois plus longtemps.",
  "Mon plus bel équilibre, je l'ai fait un dimanche matin sur la plage, sans chrono et sans objectif. Juste le sable chaud sous les mains.",
  "Un vieux maître de cirque me disait : « Le sol te porte, tu n'as pas à le combattre. » Depuis, je pousse le sol comme on caresse un chat.",
  "La première fois que j'ai tenu cinq secondes, je ne l'ai pas su : je souriais trop pour regarder le chrono.",
  "J'ai passé un hiver entier sans progresser. Au printemps, tout est venu d'un coup. Le corps travaillait en silence.",
  "Mes poignets m'ont appris la patience. Cinq minutes d'échauffement, c'est le prix d'un équilibre sans douleur.",
  "Le jour où j'ai arrêté de vouloir réussir, j'ai commencé à sentir. Et c'est en sentant que j'ai réussi.",
  "Une chute, c'est juste le sol qui te dit bonjour. Roue, sourire, et on remonte.",
  "Les jours de fatigue, je fais juste de la récup active. Le lendemain, mon équilibre est toujours meilleur. Toujours.",
  "Avant chaque montée, je prends une respiration. Pas pour me concentrer : pour me rappeler que j'aime ça.",
];
const storyOfDay = () => STORIES[Math.floor(Date.now() / 864e5) % STORIES.length];
