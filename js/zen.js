// Douceur : séances Détente (respiration, étirements doux, relâchement), météo du corps avant la séance, petites histoires.
"use strict";
// Chaque séance est une suite de postures tenues, enchaînées toute seule par la séance guidée.
// breath : rythme de respiration guidé à la voix et par le cercle qui respire [inspire, expire] ou [inspire, retiens, expire, attends].
const zh = (name, dur, how, x) => Object.assign({name, how, kind:"hold", sets:[{dur}]}, x || {});
const ZEN = [
  {id:"souffle", name:"Juste respirer", min:3, when:"Quand tu veux, même au bureau",
   blocks:[zh("Cohérence cardiaque", 120, "Inspire 5 secondes par le nez, expire 5 secondes. Le cœur ralentit, tout se pose.", {breath:[5,5]}),
           zh("Relâchement", 60, "Ferme les yeux. Laisse les épaules descendre, la mâchoire se desserrer.")]},
  {id:"calme", name:"Retour au calme", min:8, when:"Juste après ta séance",
   blocks:[zh("Cohérence cardiaque", 120, "Inspire 5 secondes par le nez, expire 5 secondes. Le cœur ralentit, tout se pose.", {breath:[5,5]}),
           zh("Avant-bras doux", 60, "À genoux, dos des mains au sol, recule très légèrement. Aucune douleur, juste de la chaleur."),
           zh("Enfant bras longs", 60, "Fesses vers les talons, front posé, bras allongés. Laisse les épaules s'ouvrir sans forcer."),
           zh("Torsion couchée", 30, "Genoux d'un côté, regard de l'autre. Respire dans le flanc qui s'ouvre.", {sides:1}),
           zh("Papillon couché", 60, "Plantes de pieds jointes, genoux ouverts, mains sur le ventre."),
           zh("Relâchement total", 120, "Allongé, paumes vers le ciel. Lâche le sol, lâche l'effort.", {breath:[4,6]})]},
  {id:"doux", name:"Jour doux", min:12, when:"Un jour de repos",
   blocks:[zh("Respiration ventrale", 120, "Main sur le ventre : il gonfle à l'inspiration et se vide à l'expiration.", {breath:[4,6]}),
           zh("Chat-vache lent", 60, "Arrondis le dos en expirant, creuse-le en inspirant, au rythme du souffle.", {breath:[4,4]}),
           zh("Fente basse", 45, "Genou arrière posé, hanches qui descendent doucement vers l'avant.", {sides:1}),
           zh("Pigeon tout doux", 75, "Penche-toi sur la jambe avant, appuie-toi sur un coussin si besoin.", {sides:1}),
           zh("Chenille", 120, "Assis, jambes allongées, le dos s'arrondit tranquillement. Genoux fléchis si besoin."),
           zh("Repos final", 180, "Allongé, une couverture si tu veux. Rien à faire.", {breath:[4,6]})]},
  {id:"soir", name:"Cocon du soir", min:14, when:"Le soir, avant de dormir",
   blocks:[zh("Cohérence cardiaque", 180, "Inspire en 5, expire en 5. Pense à une chose agréable de ta journée.", {breath:[5,5]}),
           zh("Papillon assis", 120, "Dos rond, front vers les pieds, épaules lourdes."),
           zh("Bébé heureux", 60, "Attrape tes pieds, berce-toi de gauche à droite. Souris."),
           zh("Torsion couchée", 45, "Genoux d'un côté, bras en croix.", {sides:1}),
           zh("Jambes au mur", 180, "Fesses contre le mur, jambes en appui dessus. Les jambes se reposent."),
           zh("Expiration longue", 210, "Allongé : inspire en 4, expire en 6. Le sommeil approche.", {breath:[4,6]})]},
  {id:"mains", name:"Mains libres", min:9, when:"Poignets fatigués : rien ne pèse sur les mains",
   blocks:[zh("Respiration carrée", 120, "Inspire 4, retiens 4, expire 4, attends 4.", {breath:[4,4,4,4]}),
           zh("Cercles de poignets", 60, "Mains dans le vide, cercles lents dans les deux sens, puis secoue-les."),
           zh("Prière et prière inversée", 60, "Paumes jointes devant la poitrine, puis dos des mains joints. Pousse à peine."),
           zh("Bras d'aigle", 30, "Croise les bras, coudes levés, le haut du dos s'étire.", {sides:1}),
           zh("Enfant, paumes vers le ciel", 90, "Bras le long du corps, mains posées à côté des pieds. Les poignets ne portent rien."),
           zh("Relâchement", 150, "Mains sur le ventre, sens-les monter et descendre.", {breath:[4,6]})]},
];
// La Détente est un programme comme les autres : une étape par séance, la même chaque jour de la semaine.
function zenP(){
  const day = z => { const d = {type:"train", blocks:z.blocks.map(b => ({name:b.name, how:b.how, kind:"hold", breath:b.breath, zen:true,
      sets:b.sets.map(s => ({dur:s.dur, sides:b.sides ? true : undefined}))}))}; const o = {}; DAYK.forEach(k => o[k] = d); return o; };
  return {id:"detente", name:"Détente", zen:true, steps:ZEN.map(z => ({name:z.name, info:z.when, days:day(z)}))};
}
const zenIdx = id => Math.max(0, ZEN.findIndex(z => z.id === id));
function openZen(id){ pg().cur = "detente"; pickP(); pp().step = zenIdx(id); save(); render(); showTab("today"); window.scrollTo(0, 0); }

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
  "Les jours de fatigue, je fais Jour doux. Le lendemain, mon équilibre est toujours meilleur. Toujours.",
  "Avant chaque montée, je prends une respiration. Pas pour me concentrer : pour me rappeler que j'aime ça.",
];
const storyOfDay = () => STORIES[Math.floor(Date.now() / 864e5) % STORIES.length];

// Cercle qui respire : pendant un exercice guidé par le souffle, l'horloge grossit à l'inspiration et rétrécit à l'expiration.
function breathPhase(br, t){ // renvoie [phase, nom, secondes restantes dans la phase]
  const names = br.length === 4 ? ["Inspire","Retiens","Expire","Attends"] : ["Inspire","Expire"], cyc = br.reduce((a,b)=>a+b,0);
  let x = t % cyc, i = 0; while (x >= br[i]) { x -= br[i]; i++; } return [i, names[i], br[i] - x];
}
