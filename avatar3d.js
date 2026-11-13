// Personnage 3D : un mannequin articulé construit avec des formes simples, posé selon le dernier jalon validé,
// habillable (tenue choisie dans le vestiaire) et capable de fêter un passage de niveau.
// Chargé à la demande ; si WebGL ou ce module manquent, l'app garde la silhouette 2D.
import * as THREE from "./vendor/three.module.min.js";

const PI = Math.PI;
// Angles en radians. pitch : bascule du corps vers l'avant (π = tête en bas). arm / hip : flexion (négatif = vers l'avant).
// armZ / hipZ : écartement latéral. knee : flexion (positif). elbow : flexion (négatif). Valeurs à deux éléments : [gauche, droite].
export const POSES = {
  stand:      {pitch:0,    arm:[0.08,0.08],   armZ:[0.13,0.13], elbow:[-0.22,-0.22], hip:[0,0],        hipZ:[0.05,0.05], knee:[0,0],     head:0},
  cheer:      {pitch:0,    arm:[-2.75,-2.75], armZ:[0.5,0.5],   elbow:[-0.25,-0.25], hip:[0,0],        hipZ:[0.12,0.12], knee:[0,0],     head:0.25},
  crouch:     {pitch:0.25, arm:[0.5,0.5],     armZ:[0.2,0.2],   elbow:[-0.7,-0.7],   hip:[-1.0,-1.0],  hipZ:[0.08,0.08], knee:[1.5,1.5], head:-0.1},
  hs:         {pitch:PI,   arm:[-PI,-PI],     armZ:[0,0],       hip:[0,0],        hipZ:[0,0],       knee:[0,0],     head:-0.35},
  hs_split:   {pitch:PI,   arm:[-PI,-PI],     armZ:[0,0],       hip:[-0.75,0.75], hipZ:[0,0],       knee:[0,0],     head:-0.35},
  hs_straddle:{pitch:PI,   arm:[-PI,-PI],     armZ:[0,0],       hip:[0,0],        hipZ:[0.7,0.7],   knee:[0,0],     head:-0.35},
  hs_tuck:    {pitch:PI+0.03, arch:0.1, arm:[-PI,-PI], armZ:[0,0],    hip:[-1.9,-1.9],  hipZ:[0,0],       knee:[2.1,2.1], head:-0.35},
  hs_seven1:  {pitch:PI+0.14,arm:[-PI-0.08,-PI-0.08],armZ:[0,0],  hip:[-1.7,0.05],     hipZ:[0,0],       knee:[0,0],     head:-0.45},
  // le 7 : bassin au-dessus des mains (légèrement en arrière), jambes tendues fermées à l'équerre, à l'horizontale ou un peu au-dessus
  hs_seven:   {pitch:PI+0.18,arm:[-PI,-PI],      armZ:[0,0],      hip:[-1.75,-1.75],hipZ:[0,0],       knee:[0,0],     head:-0.5, arch:0.05},   // épaules légèrement devant, dos jamais creusé
  oahs:       {pitch:PI,   arm:[-PI,-0.2],    armZ:[0.32,1.35], hip:[0,0],        hipZ:[0.55,0.55], knee:[0,0],     head:-0.3, roll:0.4},   // bras d'appui vertical, bassin au-dessus de la main
  pl_lean:    {pitch:1.225, arm:[-0.9,-0.9], armZ:[0,0],       hip:[0,0],        hipZ:[0,0],       knee:[0,0],     head:-0.5},
  pl_tuck:    {pitch:1.4, arm:[-1.3,-1.3], armZ:[0,0], arch:0.3, hip:[-2.65,-2.65], hipZ:[0,0], knee:[2.55,2.55], head:-0.6},   // dos arrondi, épaules devant les mains
  pl_adv:     {pitch:1.57, arm:[-1.12,-1.12], armZ:[0,0],       hip:[-1.55,-1.55],hipZ:[0,0],       knee:[2.0,2.0], head:-0.6},
  pl_frog:    {pitch:1.57, arm:[-1.08,-1.08],   armZ:[0,0],       hip:[-0.9,-0.9],  hipZ:[0.55,0.55], knee:[1.7,1.7], head:-0.6},
  pl_pike:    {pitch:1.57, arm:[-1.08,-1.08], armZ:[0,0],       hip:[-0.28,-0.28],hipZ:[0.55,0.55], knee:[0,0],     head:-0.6},
  pl_straddle:{pitch:1.57, arm:[-1.02,-1.02], armZ:[0,0],       hip:[0,0],        hipZ:[0.6,0.6],   knee:[0,0],     head:-0.7},
  pl_1legP:   {pitch:1.57, arm:[-1.12,-1.12], armZ:[0,0], hip:[-1.55,0], hipZ:[0,0], knee:[2.0,0], head:-0.6},   // advanced tuck, une jambe tendue derrière
  pl_pdown:   {feet:true, pitch:1.34, arm:[-0.3,-0.3], armZ:[0.15,0.15], elbow:[-1.3,-1.3], hip:[-0.05,-0.05], hipZ:[0,0], knee:[0,0], head:-0.6, point:0},   // pompe pseudo planche, en bas
  pl_full:    {pitch:1.57, arm:[-0.95,-0.95],   armZ:[0,0],       hip:[0,0],        hipZ:[0,0],       knee:[0,0],     head:-0.7},
  hs_flag:    {pitch:PI,   arm:[-PI,-PI],     armZ:[0,0.5],     hip:[0,0],        hipZ:[1.8,-0.4],  knee:[0,0],     head:-0.3, roll:-0.1},   // drapeau : le bassin part d'un côté, la jambe basse passe sous l'horizontale
  crow:       {pitch:1.2,  arm:[-0.75,-0.75], armZ:[0.1,0.1],   elbow:[-0.9,-0.9],   hip:[-2.25,-2.25],hipZ:[0.4,0.4],   knee:[2.5,2.5], head:-0.7},
  lever:      {pitch:1.57, arm:[-0.2,-0.2],   armZ:[0,0],       elbow:[-1.0,-1.0], hip:[0,0],        hipZ:[0.08,0.08], knee:[0,0],     head:-0.8},
};
// postures de passage, utilisées seulement pendant les transitions
Object.assign(POSES, {
  fold: {pitch:1.9,  arm:[-1.9,-1.9],   armZ:[0,0], hip:[-1.9,-1.9],   hipZ:[0,0],       knee:[0.15,0.15], head:-0.4},
  // montée en fente : bras tendus au-dessus de la tête, grand pas en avant genou fléchi (le bassin descend), puis bascule d'un bloc
  // accroupi pour poser les mains : genoux fléchis, bassin bas (avant la planche, les pompes, la montée face au mur)
  squat:{pitch:0.85, arch:0.1, arm:[-1.25,-1.25], armZ:[0.12,0.12], elbow:[-0.1,-0.1], hip:[-2.1,-2.1], hipZ:[0.18,0.18], knee:[2.15,2.15], head:-0.25, point:0},
  // appui sur barres ou parallettes, jambes groupées : bras tendus (haut) puis coudes à 90° (bas)
  sup_up:{pitch:0.08, arm:[0.1,0.1], armZ:[0.25,0.25], elbow:[0,0], hip:[0.05,0.05], hipZ:[0.06,0.06], knee:[1.5,1.5], head:-0.05},
  sup_dn:{pitch:0.4, arm:[1.05,1.05], armZ:[0.22,0.22], elbow:[-1.6,-1.6], hip:[-0.25,-0.25], hipZ:[0.06,0.06], knee:[1.5,1.5], head:-0.25},
  reach:{pitch:0,    arm:[-2.95,-2.95], armZ:[0.05,0.05], hip:[0,0],      hipZ:[0.03,0.03], knee:[0,0],      head:0.05},
  lunge:{pitch:0.15, arm:[-3.0,-3.0],   armZ:[0.05,0.05], hip:[-1.5,0.8], hipZ:[0.04,0.04], knee:[1.5,0.08], head:0, point:0},   // genou avant à 90°, jambe arrière loin derrière
  tip:  {pitch:0.95, arch:-0.1, arm:[-3.0,-3.0], armZ:[0.05,0.05], hip:[-2.1,0.1], hipZ:[0.03,0.03], knee:[1.3,0], head:-0.15, point:0},
  plant:{pitch:1.62, arch:-0.15, arm:[-1.62,-1.62], armZ:[0.05,0.05], hip:[-2.5,-0.2], hipZ:[0,0], knee:[2.1,0], head:-0.45, point:0.4},
  kick: {pitch:2.45, arm:[-2.5,-2.5],   armZ:[0,0], hip:[-1.75,0.3],   hipZ:[0,0],       knee:[0.75,0],    head:-0.4},
  pike: {pitch:2.3,  arm:[-2.45,-2.45], armZ:[0,0], hip:[-1.15,-1.15], hipZ:[0.35,0.35], knee:[0,0],       head:-0.45},
});
const VIA = {fold:1, kick:1, pike:1, fold_s:1};
const FEET = {stand:1, cheer:1, crouch:1, pl_lean:1, fold:1, reach:1, lunge:1, tip:1, squat:1};
const cat = n => n.startsWith("pl_") || n.startsWith("lv_") || n === "crow" || n === "lever" ? "pl" : n.startsWith("hs") || n === "oahs" || n === "kick" || n === "pike" ? "hs" : "up";
// Chemin d'une posture à l'autre : [posture, durée en secondes]. On passe par un vrai mouvement
// (flexion puis lancer de jambe pour monter en équilibre, descente carpée pour aller en planche…).
function route(a, b){
  const A = cat(a), B = cat(b);
  if (A === "up" && B === "hs") return [["reach",0.3],["lunge",0.35],["tip",0.3],["plant",0.2],["kick",0.25],[b,0.55]];
  if (A === "hs" && B === "up") return [["kick",0.35],["plant",0.3],["tip",0.3],["lunge",0.35],[b,0.45]];   // on redescend une jambe après l'autre, en fente
  if (A === "up" && B === "pl") return b === "pl_lean" ? [["squat",0.45],[b,0.5]] : [["squat",0.45],["pl_lean",0.45],[b,0.55]];
  if (A === "pl" && B === "up") return a === "pl_lean" ? [["squat",0.45],[b,0.5]] : [["pl_lean",0.4],["squat",0.4],[b,0.5]];
  if (A !== B) return [["pike",0.5],[b,0.65]];
  // en appui sur les mains au sol (gainage, pompes) : on ramène les pieds, accroupi, avant de se relever
  if (/^(c2w_0|pu_down)$/.test(a) && b === "stand") return [["squat",0.45],[b,0.5]];
  return [[b,0.75]];
}
const back = t => { const c = 1.6, u = t - 1; return 1 + (c + 1)*u*u*u + c*u*u; };      // arrivée avec un léger dépassement          // postures en appui sur les pieds (ou pieds + mains)
// ---------- Animations propres à chaque jalon ----------
const P = (base, o) => Object.assign({}, POSES[base], o);
const mirror = p => Object.assign({}, p, {hipY:p.hipY ? [p.hipY[1],p.hipY[0]] : undefined, arm:[p.arm[1],p.arm[0]], armZ:[p.armZ[1],p.armZ[0]], elbow:p.elbow ? [p.elbow[1],p.elbow[0]] : undefined, hip:[p.hip[1],p.hip[0]], hipZ:[p.hipZ[1],p.hipZ[0]], knee:[p.knee[1],p.knee[0]], roll:-(p.roll || 0), one:p.one ? -p.one : p.one}); // un bras : l'appui change de main
Object.assign(POSES, {
  // poitrine face au mur : dos au mur au départ, mains au sol, on remonte les pieds le long du mur en rapprochant les mains
  pu_down:  {point:0, feet:true, pitch:1.37, arm:[-0.55,-0.55], armZ:[0.2,0.2], elbow:[-1.45,-1.45], hip:[-0.1,-0.1], hipZ:[0,0], knee:[0,0], head:-0.6},
  c2w_0:    {point:0, feet:true, pitch:1.31, arm:[-1.31,-1.31], armZ:[0,0], hip:[-0.15,-0.15], hipZ:[0,0], knee:[0,0], head:-0.6},
  c2w_1:    {point:0, pitch:2.0, arm:[-2.0,-2.0], armZ:[0,0], hip:[-0.75,-0.55], hipZ:[0,0], knee:[0.5,0.2], head:-0.5},
  c2w_2:    {pitch:2.6, arm:[-2.6,-2.6], armZ:[0,0], hip:[-0.45,-0.2], hipZ:[0,0], knee:[0.25,0], head:-0.4},
  hs_cw1:   P("hs", {roll:1.15, hipZ:[0.8,0.8], feet:true}),                                             // sortie en roue : on bascule sur le côté…
  hs_cw2:   {pitch:PI, roll:PI, arm:[0.1,0.1], armZ:[0.3,0.3], elbow:[-0.2,-0.2], hip:[0,0], hipZ:[0.25,0.25], knee:[0,0], head:0, feet:true},   // …et on retombe debout
  hs_cw3:   {pitch:PI, roll:PI, spin:PI, arm:[0.08,0.08], armZ:[0.13,0.13], elbow:[-0.22,-0.22], hip:[0,0], hipZ:[0.05,0.05], knee:[0,0], head:0, feet:true},
  hs_splitM:mirror(POSES.hs_split),
  hs_split2:P("hs_split", {hip:[-0.5,0.95]}),
  hs_tuck90:P("hs", {pitch:PI+0.05, arm:[-PI,-PI], arch:0.1, hip:[-1.62,-1.62], knee:[1.9,1.9], head:-0.45}),
  hs_headin:P("hs", {head:0.6}),
  hs_7headin:P("hs_seven", {head:0.55}),
  hs_flagM: mirror(POSES.hs_flag),
  hs_flagLo:P("hs_flag", {roll:0.44, armZ:[0.44,-0.44], hipZ:[2.0,-0.25]}),
  hs_flagLoM:mirror(P("hs_flag", {roll:0.44, armZ:[0.44,-0.44], hipZ:[2.0,-0.25]})),
  lv_crow0: {pitch:1.2, arch:0.35, arm:[-0.9,-0.9], elbow:[-0.6,-0.6], armZ:[0.2,0.2], hip:[-2.2,-2.2], hipZ:[0.7,0.7], hipY:[0.5,0.5], knee:[2.3,2.3], head:-0.6, feet:true},   // accroupi, mains posées, genoux ouverts
  lv_frog:  {pitch:1.32, arch:0.3, arm:[-0.75,-0.75], elbow:[-1.1,-1.1], armZ:[0.25,0.25], hip:[-2.3,-2.3], hipZ:[0.75,0.75], hipY:[0.6,0.6], knee:[2.4,2.4], head:-0.9},         // grenouille : genoux posés à l'extérieur des coudes, bras fléchis
  lv_crow:  {pitch:1.42, arch:0.35, arm:[-1.0,-1.0], elbow:[-0.5,-0.5], armZ:[0.2,0.2], hip:[-2.45,-2.45], hipZ:[0.6,0.6], hipY:[0.4,0.4], knee:[2.5,2.5], head:-1.0},           // corbeau : bassin plus haut, bras presque tendus
  hs_mex:   {pitch:PI + 0.5, arch:-0.8, arm:[-PI + 0.15,-PI + 0.15], armZ:[0,0], hip:[0.35,0.35], hipZ:[0,0], knee:[0.45,0.45], head:-0.9},
  hs_hspu:  P("hs", {pitch:PI + 0.15, arm:[-PI + 0.75,-PI + 0.75], elbow:[-1.9,-1.9], armZ:[0.15,0.15], head:-0.7}),
  hs_shiftL:P("hs_straddle", {roll:0.14, armZ:[0,0.16]}),
  hs_shiftR:mirror(P("hs_straddle", {roll:0.14, armZ:[0,0.16]})),
  hs_finger:P("oahs", {arm:[-PI,-PI], armZ:[0.14,0.34], roll:-0.04}),   // main libre posée sur le bout des doigts
  hs_oastr: P("oahs", {arm:[-PI,-PI], armZ:[0.2,0.4], roll:0.06}),     // main libre au sol, bras tendu, loin sur le côté // main libre au sol, loin sur le côté
  hs_oafull:P("oahs", {arm:[-PI,-0.2], armZ:[0.32,1.3], roll:0.4, one:1}), // bras libre en balancier, bassin au-dessus de la main
  fold_s:   P("fold", {hipZ:[0.55,0.55]}),
  // montée jambes serrées : forte compression, hanches fermées, puis ouverture ; jambes écartées : on ouvre seulement une fois le bassin en haut
  hs_wsplit:P("hs", {hip:[0,0.8]}), hs_wsplitM:P("hs", {hip:[0.8,0]}),
  pk1:P("pike", {pitch:2.2, arch:0.35, arm:[-2.05,-2.05], hip:[-2.5,-2.5], hipZ:[0.03,0.03]}),
  pk2:P("hs_seven", {pitch:2.75, arch:0.25, arm:[-2.6,-2.6], hip:[-1.9,-1.9]}),
  sp2:P("hs_straddle", {pitch:2.7, arch:0.25, arm:[-2.55,-2.55], hip:[-1.7,-1.7], hipZ:[0.95,0.95]}),
  hs_spress:P("pike", {pitch:1.78, arch:0.35, arm:[-1.65,-1.65], hip:[-2.0,-2.0], hipZ:[0.85,0.85]}),   // épaules loin devant les doigts, bassin haut
  hs_stal0: {pitch:0.05, arch:0.32, arm:[-0.3,-0.3], armZ:[0.12,0.12], hip:[-2.15,-2.15], hipZ:[0.85,0.85], knee:[0,0], head:-0.15},     // équerre écartée, jambes au-dessus de l'horizontale
  hs_stal1: {pitch:1.05, arch:0.4, arm:[-1.35,-1.35], armZ:[0.05,0.05], hip:[-2.6,-2.6], hipZ:[1.05,1.05], knee:[0,0], head:-0.5},      // le bassin monte derrière, jambes le long des bras
  // de l'équerre (L-sit, jambes serrées) à l'équilibre : le bassin monte derrière, les jambes restent serrées et passent au-dessus
  lsit0:    {pitch:0.05, arch:0.3, arm:[-0.3,-0.3], armZ:[0.22,0.22], hip:[-1.75,-1.75], hipZ:[0.03,0.03], knee:[0,0], head:-0.1},
  lsit1:    {pitch:1.0, arch:0.4, arm:[-1.3,-1.3], armZ:[0.26,0.26], hip:[-2.75,-2.75], hipZ:[0.03,0.03], knee:[0,0], head:-0.5},
  lsit2:    {pitch:1.9, arch:0.3, arm:[-2.0,-2.0], armZ:[0.2,0.2], hip:[-2.8,-2.8], hipZ:[0.03,0.03], knee:[0,0], head:-0.5},
  // assis jambes tendues (serrées ou écartées), entre l'accroupi et l'équerre : les pieds ne traversent plus le sol
  sit:      {feet:true, pitch:0, arch:0.3, arm:[-0.25,-0.25], armZ:[0.22,0.22], hip:[-1.57,-1.57], hipZ:[0.03,0.03], knee:[0,0], head:-0.1, point:1},
  sit_s:    {feet:true, pitch:0, arch:0.3, arm:[-0.25,-0.25], armZ:[0.22,0.22], hip:[-1.7,-1.7], hipZ:[0.85,0.85], knee:[0,0], head:-0.1, point:1},
  hs_stal2: {pitch:1.9, arch:0.2, arm:[-2.05,-2.05], armZ:[0,0], hip:[-2.2,-2.2], hipZ:[1.05,1.05], knee:[0,0], head:-0.5},          // bassin au-dessus des épaules, jambes encore basses
  lv_croc:  P("lever", {roll:0.35, arm:[-0.2,-0.35], elbow:[-1.0,-0.2], armZ:[0,0.35]}),   // deux mains au sol, un seul coude calé dans la hanche
  lv_qdr0:  {pitch:1.15, roll:0.45, arm:[-0.85,-1.1], armZ:[0,0.3], elbow:[-0.9,-0.3], hip:[-1.7,-1.4], hipZ:[0.2,0.3], knee:[1.7,1.5], head:-0.5, feet:true},
  lv_qdr:   {pitch:1.98, roll:1.25, arch:0.3, arm:[-0.3,-1.35], armZ:[0,0.5], elbow:[-2.0,-0.3], hip:[-1.5,-0.5], hipZ:[-0.9,0.6], hipY:[0.4,0], knee:[1.4,1.4], head:0.35, feet:true},   // sur le côté, hanche posée sur le coude, tête près du sol, genoux fléchis en l'air
  lv_qdr2:  {pitch:1.98, roll:1.25, arch:0.3, arm:[-0.3,-1.35], armZ:[0,0.5], elbow:[-2.0,-0.3], hip:[-1.2,0.2], hipZ:[-1.0,0.7], hipY:[-0.5,0], knee:[0.9,1.2], head:0.35, feet:true},      // les jambes s'ouvrent en ciseaux
});
Object.assign(FEET, {fold_s:1});
// Un script : [posture, durée du mouvement en s, temps de maintien en s]. wall : mur derrière (-1) ou devant (1). cut : la boucle se referme sans retour.
POSES.lsit3 = P("pk2", {hip:[-2.2,-2.2]});   // passage jambes serrées au-dessus des mains, pieds au-dessus du sol
const UP = [["reach",0.3,0.1],["lunge",0.4,0.25],["tip",0.3,0],["plant",0.2,0],["kick",0.25,0]];
export const SCRIPTS = {
  st_bail30: {wall:1, cut:true, s:[...UP,["hs",0.5,0.8],["hs_cw1",0.45,0],["hs_cw2",0.45,0.3],["hs_cw3",0.5,0.2]], still:"hs"},
  st_bailc2w:{wall:-1, cut:true, s:[["squat",0.45,0.1],["c2w_0",0.45,0.2],["c2w_1",0.6,0.2],["c2w_2",0.6,0.2],["hs",0.6,1.0],["hs_cw1",0.45,0],["hs_cw2",0.45,0.3],["hs_cw3",0.5,0.2]], still:"hs"},
  st_split:  {wall:-1, cut:true, s:[["squat",0.45,0.1],["c2w_0",0.45,0.2],["c2w_1",0.6,0.2],["c2w_2",0.6,0.2],["hs",0.6,0.4],["hs_wsplit",0.6,0.8],["hs_wsplitM",0.7,0.8],["hs",0.6,0.3],["c2w_2",0.6,0],["c2w_1",0.6,0],["c2w_0",0.6,0.2],["squat",0.5,0],["stand",0.4,0.1]], still:"hs_wsplit"},   // on redescend en marchant le long du mur
  b1_free5:  {s:[...UP,["hs_split",0.5,1.0],["hs_split2",0.5,0.4],["hs_split",0.5,0.8]]},
  b2_free15: {s:[...UP,["hs_straddle",0.5,0.8],["hs_split",0.6,0.9],["hs_straddle",0.6,0.6]], still:"hs_straddle"},
  b2_str15:  {s:[...UP,["hs_straddle",0.5,0.3],["hs",0.5,1.6]]},
  in_str40:  {s:[...UP,["hs",0.5,2.4]]},
  in_str60:  {s:[...UP,["hs",0.5,1.2],["hs_headin",0.5,0.5],["hs",0.5,1.0]], still:"hs"},
  in_holds:  {s:[...UP,["hs",0.5,0.3],["hs_straddle",0.6,0.7],["hs_tuck",0.6,0.7],["hs_split",0.6,0.7],["hs",0.6,0.3]], still:"hs_straddle"},
  in_changes:{s:[...UP,["hs_straddle",0.45,0.1],["hs_tuck",0.45,0.1],["hs",0.45,0.1],["hs_straddle",0.45,0.1],["hs_tuck",0.45,0.1],["hs",0.45,0.3]], still:"hs_tuck"},
  in_tuck:   {s:[...UP,["hs",0.5,0.2],["hs_tuck90",0.7,1.6]]},
  in_7s:     {s:[...UP,["hs",0.5,0.2],["hs_seven1",0.7,1.5]]},
  in_7d:     {s:[...UP,["hs",0.5,0.2],["hs_seven",0.8,1.5]]},
  in_toes:   {s:[...UP,["hs",0.5,0.5],["hs_headin",0.6,1.5]]},
  in_toes7:  {s:[...UP,["hs",0.5,0.2],["hs_seven",0.7,0.3],["hs_7headin",0.5,1.3]]},
  oa_flaghoriz:{yaw:-0.15, s:[...UP,["hs_straddle",0.5,0.3],["hs_flag",0.8,0.8],["hs_straddle",0.6,0.1],["hs_flagM",0.8,0.8],["hs_straddle",0.6,0.1]], still:"hs_flag"},
  oa_flagfloor:{yaw:-0.15, s:[...UP,["hs_straddle",0.5,0.2],["hs_flagLo",1.0,0.7],["hs_straddle",0.7,0.1],["hs_flagLoM",1.0,0.7],["hs_straddle",0.7,0.1]], still:"hs_flagLo"},
  in_mexican:{s:[...UP,["hs",0.5,0.4],["hs_mex",1.0,1.8],["hs",0.8,0.2]], still:"hs_mex"},
  in_hspu:   {s:[...UP,["hs",0.5,0.3],["hs_hspu",0.7,0.15],["hs",0.6,0.15],["hs_hspu",0.7,0.15],["hs",0.6,0.15],["hs_hspu",0.7,0.15],["hs",0.6,0.4]], still:"hs_hspu"},
  oa_shift:  {yaw:-0.15, s:[...UP,["hs_straddle",0.5,0.3],["hs_shiftL",0.5,0.7],["hs_straddle",0.4,0.1],["hs_shiftR",0.5,0.7],["hs_straddle",0.4,0.2]], still:"hs_shiftL"},
  oa_finger: {yaw:-0.15, s:[...UP,["hs_straddle",0.5,0.3],["hs_finger",0.7,1.8]]},
  oa_strarm: {yaw:-0.15, s:[...UP,["hs_straddle",0.5,0.3],["hs_finger",0.6,0.3],["hs_oastr",0.7,1.5]]},
  oa_oahs:   {yaw:-0.15, s:[...UP,["hs_straddle",0.5,0.3],["hs_finger",0.6,0.2],["hs_oafull",0.8,1.8]]},
  oa_oahs10: {yaw:-0.15, s:[...UP,["hs_straddle",0.5,0.3],["hs_finger",0.6,0.2],["hs_oafull",0.8,2.4]]},
  oa_lift:   {yaw:-0.15, s:[...UP,["hs_straddle",0.5,0.3],["hs_oastr",0.6,0.6],["hs_oafull",0.5,0.6],["hs_oastr",0.5,0.6],["hs_oafull",0.5,0.6],["hs_oastr",0.5,0.3]], still:"hs_oafull"},
  oa_wall:   {wall:1, yaw:-2.74, s:[...UP,["hs_straddle",0.5,0.4],["hs_finger",0.6,0.3],["hs_oafull",0.7,1.8]], still:"hs_oafull"},
  oa_strad30:{s:[...UP,["hs_straddle",0.5,2.4]]},
  pr_straddle:{s:[["fold_s",0.5,0.3],["hs_spress",0.8,0.3],["sp2",0.6,0.2],["hs_straddle",0.6,0.3],["hs",0.5,1.0]], still:"hs_spress"},
  pr_elev:   {s:[["fold_s",0.5,0.3],["hs_spress",0.8,0.3],["sp2",0.6,0.2],["hs_straddle",0.6,0.3],["hs",0.5,1.0]], still:"hs_spress"},
  pr_negS:   {cut:true, s:[...UP,["hs_straddle",0.5,0.6],["hs_spress",1.6,0.1],["fold_s",0.9,0.4],["stand",0.6,0.3]], still:"hs_spress"},
  pr_stradL: {cut:true, yaw:-0.55, s:[["crouch",0.4,0],["sit_s",0.4,0],["hs_stal0",0.6,2.2],["sit_s",0.4,0],["crouch",0.5,0.1],["stand",0.4,0.1]], still:"hs_stal0"},
  pr_pike:   {s:[["fold",0.5,0.3],["pk1",0.9,0.2],["pk2",0.7,0.1],["hs",0.8,1.2]], still:"pk1"},
  pr_lsit:   {cut:true, yaw:-0.7, s:[["crouch",0.4,0],["sit",0.4,0],["lsit0",0.6,2.0],["sit",0.4,0],["crouch",0.5,0.1],["stand",0.4,0.1]], still:"lsit0"},
  pr_lsitHs: {cut:true, yaw:-0.7, s:[["crouch",0.4,0],["sit",0.4,0],["lsit0",0.6,0.6],["lsit1",0.7,0.3],["lsit2",0.6,0],["lsit3",0.6,0],["hs",0.6,0.6],["lsit3",0.6,0],["lsit2",0.6,0],["lsit1",0.6,0],["lsit0",0.6,0.3],["sit",0.4,0],["crouch",0.4,0],["stand",0.4,0.05]], still:"lsit1"},
  pr_stalder:{cut:true, yaw:-0.55, s:[["crouch",0.4,0],["sit_s",0.4,0],["hs_stal0",0.6,0.5],["hs_stal1",0.6,0],["hs_stal2",0.55,0],["sp2",0.5,0.1],["hs_straddle",0.5,0.15],["hs",0.45,0.4],["hs_straddle",0.45,0],["sp2",0.5,0],["hs_stal2",0.55,0],["hs_stal1",0.55,0],["hs_stal0",0.6,0.35],["sit_s",0.4,0],["crouch",0.4,0],["stand",0.4,0.05]], still:"hs_stal0"},
  lo_frog:   {cut:true, yaw:-0.7, s:[["crouch",0.45,0],["lv_crow0",0.5,0.2],["lv_frog",0.6,1.1],["lv_crow",0.7,1.1],["lv_frog",0.5,0.1],["lv_crow0",0.5,0],["crouch",0.45,0],["stand",0.4,0.1]], still:"lv_frog"},
  lo_elbow:  {s:[["squat",0.45,0],["lever",0.7,1.9]]},
  lo_croc:   {s:[["squat",0.45,0],["lever",0.6,0.4],["lv_croc",0.7,1.6]]},
  lo_qdr:    {cut:true, yaw:-0.5, s:[["crouch",0.45,0],["lv_qdr0",0.5,0.1],["lv_qdr",0.8,1.0],["lv_qdr2",0.7,0.9],["lv_qdr",0.6,0.3],["lv_qdr0",0.6,0],["crouch",0.45,0],["stand",0.4,0.1]], still:"lv_qdr2"},
  fd_plank:  {s:[["squat",0.45,0],["c2w_0",0.5,2.4]], still:"c2w_0"},
  fd_push:   {s:[["squat",0.45,0],["c2w_0",0.5,0.4],["pu_down",0.55,0.05],["c2w_0",0.5,0.15],["pu_down",0.55,0.05],["c2w_0",0.5,0.15],["pu_down",0.55,0.05],["c2w_0",0.5,0.6]], still:"pu_down"},
  fd_roue:   {cut:true, yaw:-0.15, s:[["stand",0.2,0.2],...UP,["hs_straddle",0.45,0.2],["hs_cw1",0.45,0],["hs_cw2",0.45,0.3],["hs_cw3",0.5,0.2]], still:"hs_straddle"},
  fd_dips:   {wall:"bars", s:[["stand",0.3,0.1],["sup_up",0.5,0.4],["sup_dn",0.7,0.1],["sup_up",0.6,0.2],["sup_dn",0.7,0.1],["sup_up",0.6,0.6]], still:"sup_up"},
  fd_c2w:    {wall:-1, s:[["squat",0.45,0.1],["c2w_0",0.45,0.2],["c2w_1",0.6,0.2],["c2w_2",0.6,0.2],["hs",0.6,1.6],["c2w_2",0.6,0],["c2w_1",0.6,0],["c2w_0",0.6,0.2]], still:"hs"},
  me:        {s:[["stand",0.3,1.2],["cheer",0.5,0.7],["stand",0.5,0.4],["cheer",0.5,0.7],["stand",0.5,0.8]], still:"stand"},
  pl_lean:   {s:[["squat",0.45,0],["pl_lean",0.5,2.2]]},
  pl_tuck:   {s:[["squat",0.45,0],["pl_lean",0.45,0.2],["pl_tuck",0.6,1.8]]},
  pl_adv:    {s:[["squat",0.45,0],["pl_lean",0.45,0.1],["pl_tuck",0.5,0.3],["pl_adv",0.6,1.6]]},
  pl_1leg:   {s:[["squat",0.45,0],["pl_lean",0.45,0.1],["pl_tuck",0.5,0.2],["pl_adv",0.5,0.3],["pl_1legP",0.6,1.6]]},
  pl_ppp:    {s:[["squat",0.45,0],["pl_lean",0.5,0.3],["pl_pdown",0.6,0.1],["pl_lean",0.6,0.2],["pl_pdown",0.6,0.1],["pl_lean",0.6,0.6]], still:"pl_lean"},
  pl_frog:   {s:[["squat",0.45,0],["pl_lean",0.45,0.1],["pl_tuck",0.5,0.2],["pl_frog",0.6,1.6]]},
  pl_pike:   {s:[["squat",0.45,0],["pl_lean",0.45,0.1],["pl_tuck",0.5,0.2],["pl_pike",0.7,1.6]]},
  pl_straddle:{s:[["squat",0.45,0],["pl_lean",0.45,0.1],["pl_tuck",0.5,0.2],["pl_straddle",0.7,1.7]]},
  pl_full:   {s:[["squat",0.45,0],["pl_lean",0.45,0.1],["pl_tuck",0.5,0.2],["pl_straddle",0.6,0.3],["pl_full",0.6,1.7]]},
};// étapes intermédiaires : postures dédiées quand le geste diffère, sinon l'animation de la figure dont elles dérivent
Object.assign(POSES, {
  hs_oafullM:mirror(POSES.hs_oafull),                                   // un bras, l'autre côté (côté faible)
  hs_tflag:P("hs_tuck", {roll:-0.1, armZ:[0,0.5], hipZ:[1.2,-0.4]}), // drapeau groupé : deux mains au sol, genoux sur le côté
  pl_halfL:P("pl_full", {hip:[-0.15,-0.15], knee:[1.6,1.6]}),            // half-lay : hanches tendues, genoux pliés
  pl_tuckDn:P("pl_tuck", {elbow:[-1.2,-1.2], arm:[-0.5,-0.5], pitch:1.5}),   /* les épaules descendent en restant devant les mains */               // pompe en tuck : coudes fléchis, pieds en l'air
  pl_strN:P("pl_straddle", {hipZ:[0.3,0.3]}),                            // straddle serrée
  sitP:P("sit", {hip:[-1.85,-1.85], arch:0.45, point:1}),                // élévation en pike : talons décollés
  sitSL:P("sit_s", {hip:[-1.9,-1.9], arch:0.45, point:1}),               // élévation jambes écartées
  pkC:P("pk2", {pitch:2.5, hip:[-2.6,-2.6], arch:0.35}), pk1L:P("pk1", {pitch:2.1}),   // descente pike : bassin qui recule, pieds posés près des mains
  lsitT:P("lsit0", {pitch:0.55, arch:0.5, arm:[-0.55,-0.55], armZ:[0.1,0.1], hip:[-2.9,-2.9], knee:[2.9,2.9], head:-0.35}),                   // équerre groupée
  tuckRise:P("hs_tuck", {pitch:2.2, arm:[-2.2,-2.2]}),                   // le bassin monte en groupé
});
POSES.hs_tflagM = mirror(POSES.hs_tflag);   // drapeau groupé, autre côté
Object.assign(SCRIPTS, {
  oa_oahsw:{yaw:-0.15, s:[...UP,["hs_straddle",0.5,0.3],["hs_finger",0.6,0.2],["hs_oafullM",0.8,1.8]], still:"hs_oafullM"},
  oa_sidehold:{yaw:-0.15, s:[...UP,["hs_straddle",0.5,0.3],["hs_shiftL",0.6,2.0]], still:"hs_shiftL"},
  oa_tuckflag:{yaw:-0.15, s:[...UP,["hs_tuck",0.5,0.3],["hs_tflag",0.8,0.8],["hs_tuck",0.6,0.1],["hs_tflagM",0.8,0.8],["hs_tuck",0.6,0.1]], still:"hs_tflag"},
  oa_shrug:SCRIPTS.oa_wall, oa_finger3:SCRIPTS.oa_finger, oa_finger2:SCRIPTS.oa_finger,
  oa_finger1:{yaw:-0.15, s:[...UP,["hs_straddle",0.5,0.3],["hs_finger",0.7,0.8],["hs_oafull",0.5,0.4],["hs_finger",0.5,0.6]], still:"hs_finger"},
  pl_lean2:SCRIPTS.pl_lean, pl_tuckP:SCRIPTS.pl_tuck, pl_tuckO:SCRIPTS.pl_adv,
  pl_tuckPu:{s:[["squat",0.45,0],["pl_lean",0.45,0.1],["pl_tuck",0.5,0.3],["pl_tuckDn",0.6,0.1],["pl_tuck",0.6,0.2],["pl_tuckDn",0.6,0.1],["pl_tuck",0.6,0.5]], still:"pl_tuck"},
  pl_strBand:SCRIPTS.pl_straddle, pl_strBandL:SCRIPTS.pl_straddle,
  pl_strNar:{s:[["squat",0.45,0],["pl_lean",0.45,0.1],["pl_tuck",0.5,0.2],["pl_strN",0.7,1.7]], still:"pl_strN"},
  pl_half:{s:[["squat",0.45,0],["pl_lean",0.45,0.1],["pl_tuck",0.5,0.2],["pl_halfL",0.7,1.7]], still:"pl_halfL"},
  pl_fullBand:SCRIPTS.pl_full,
  pl_fullNeg:{cut:true, s:[["squat",0.45,0],["pl_lean",0.45,0.1],["pl_tuck",0.5,0.2],["pl_straddle",0.6,0.2],["pl_full",0.6,0.4],["pl_lean",3.0,0.3],["squat",0.5,0],["stand",0.4,0.1]], still:"pl_full"},
  pr_pikeLift:{cut:true, s:[["crouch",0.4,0],["sit",0.4,0.2],["sitP",0.5,0.6],["sit",0.4,0.2],["sitP",0.5,0.6],["sit",0.4,0.2],["crouch",0.4,0],["stand",0.4,0.1]], still:"sitP"},
  pr_stradLift:{cut:true, yaw:-0.55, s:[["crouch",0.4,0],["sit_s",0.4,0.2],["sitSL",0.5,0.6],["sit_s",0.4,0.2],["sitSL",0.5,0.6],["sit_s",0.4,0.2],["crouch",0.4,0],["stand",0.4,0.1]], still:"sitSL"},
  pr_vsit:SCRIPTS.pr_stradL,
  pr_wallNeg:{wall:-1, cut:true, s:[["squat",0.45,0.1],["c2w_0",0.45,0.2],["c2w_1",0.6,0.2],["c2w_2",0.6,0.2],["hs",0.6,0.4],["hs_straddle",0.5,0.3],["sp2",0.8,0],["hs_spress",1.2,0.1],["fold_s",0.9,0.4],["stand",0.6,0.3]], still:"hs_spress"},   // monte en marchant au mur, ventre face au mur
  pr_elevLow:SCRIPTS.pr_elev,
  pr_negP:{cut:true, s:[...UP,["hs",0.5,0.6],["pk2",1.2,0],["pkC",1.0,0],["pk1L",0.6,0.1],["fold",0.8,0.3],["stand",0.6,0.2]], still:"pk2"},
  pr_halfSt:{cut:true, yaw:-0.55, s:[["crouch",0.4,0],["sit_s",0.4,0],["hs_stal0",0.6,0.3],["hs_stal1",0.6,0],["hs_stal2",0.55,0],["sp2",0.5,0],["hs_straddle",0.5,0.4],["sp2",1.0,0],["hs_stal2",1.0,0],["hs_stal1",1.0,0],["hs_stal0",1.0,0.3],["sit_s",0.4,0],["crouch",0.4,0],["stand",0.4,0.1]], still:"hs_stal1"},
  pr_tuckUp:{cut:true, yaw:-0.7, s:[["crouch",0.4,0],["sit",0.4,0],["lsitT",0.6,0.4],["tuckRise",0.8,0],["hs_tuck",0.6,0.3],["hs",0.6,0.6],["hs_tuck",0.6,0],["tuckRise",0.6,0],["lsitT",0.6,0.2],["sit",0.4,0],["crouch",0.4,0],["stand",0.4,0.05]], still:"tuckRise"},
  pr_stalPart:{cut:true, yaw:-0.55, s:[["crouch",0.4,0],["sit_s",0.4,0],["hs_stal0",0.6,0.4],["hs_stal1",0.6,0],["hs_stal2",0.6,1.0],["hs_stal1",0.6,0],["hs_stal0",0.6,0.3],["sit_s",0.4,0],["crouch",0.4,0],["stand",0.4,0.05]], still:"hs_stal2"},
  pr_lsitNeg:SCRIPTS.pr_lsitHs,
});

const KEYS = ["point","hands","one","spin","arch","pitch","roll","head","arm0","arm1","armZ0","armZ1","elbow0","elbow1","hip0","hip1","hipZ0","hipZ1","hipY0","hipY1","knee0","knee1"];
const flat = name => { const p = POSES[name] || POSES.stand, n = POSES[name] ? name : "stand", e = p.elbow || [0, 0];
  // pointes de pied : tendues dès que les pieds quittent le sol (en gym, un pied en l'air est toujours pointé)
  return {point:p.point != null ? p.point : FEET[n] || p.feet ? 0 : 1, hands:FEET[n] || p.feet ? 0 : 1, one:p.one ? p.one : n === "oahs" ? 1 : 0, spin:p.spin || 0, arch:p.arch || 0, pitch:p.pitch, roll:p.roll || 0, head:p.head, arm0:p.arm[0], arm1:p.arm[1],
    armZ0:p.armZ[0], armZ1:p.armZ[1], elbow0:e[0], elbow1:e[1], hip0:p.hip[0], hip1:p.hip[1], hipZ0:p.hipZ[0], hipZ1:p.hipZ[1], hipY0:(p.hipY || [0,0])[0], hipY1:(p.hipY || [0,0])[1], knee0:p.knee[0], knee1:p.knee[1]}; };
const mix = (a, b, k) => { const o = {}; KEYS.forEach(key => o[key] = a[key] + (b[key] - a[key]) * k); return o; };
const ease = t => t*t*(3 - 2*t);

const SKIN = {s1:"#f0c8a4", s2:"#d9a074", s3:"#a86e45", s4:"#6b452b"};
const CLOTH = {w:"#f2f0ea", k:"#1d1d1b", g:"#8a8880", o:"#ff5b2e", b:"#3d5f94", v:"#4f7a5b", y:"#dba622", r:"#b3362b", p:"#6a4c93", n:"#22324f"};
const HAIR = {brown:"#3a2a20", black:"#141312", blond:"#c9a45c", red:"#9a4a22", grey:"#9a9892"};
const OLD = {wraps:"wraps_o", band:"band_o", cap:"cap_o", shoes:"shoes_k", socks:"socks_w", belt:"belt_o"};   // anciens identifiants de tenue

// opts.bare : pas de socle, pas de rotation (vignettes) · opts.manual : pas d'horloge, on avance image par image avec step()
export function mount(host, opts = {}){
  // opts.offscreen : {canvas, w, h, colors} pour un rendu hors de la page (Web Worker) ; sinon rendu dans host
  const OFF = opts.offscreen, DOM = !OFF;
  const cssv = n => OFF ? (OFF.colors || {})[n] || "" : getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const renderer = new THREE.WebGLRenderer(Object.assign({antialias:true, alpha:true, preserveDrawingBuffer:!!opts.manual}, OFF ? {canvas:OFF.canvas} : {}));
  renderer.setPixelRatio(opts.manual ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
  const canvas = renderer.domElement;
  if (DOM) { canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab"; canvas.setAttribute("role","img"); host.append(canvas); }
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8a84, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(2.5, 5, 4); scene.add(sun);

  const M = n => new THREE.MeshStandardMaterial({roughness:n, metalness:0.03});
  const mSkin = M(0.6), mTop = M(0.85), mBot = M(0.85), mShoe = M(0.7), mAcc = M(0.6), mHair = M(0.9), mDark = M(0.4), mGold = M(0.35), soft = M(0.95);
  const mHead = M(0.8), mWrist = M(0.8), mBelt = M(0.7), mChalk = M(0.95); mChalk.color.set("#f4f2ec");
  mHair.color.set("#2a211c"); mDark.color.set("#1b1b19"); mGold.color.set("#c9a227"); mGold.metalness = 0.6;
  const cap = (r, len, mat) => new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 18), mat);
  const ball = (r, mat) => new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), mat);
  const cyl = (r, h, mat) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), mat);
  const grp = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  const at = (mesh, parent, x, y, z) => { mesh.position.set(x, y, z); parent.add(mesh); return mesh; };

  const pivot = grp(scene, 0, 0, 0);             // rotation à la main, rotation lente, saut
  const root = grp(pivot, 0, 0, 0);              // bassin
  const pelvis = cap(0.108, 0.13, mBot); pelvis.rotation.z = PI/2; root.add(pelvis);
  const waist = at(cap(0.118, 0.1, mSkin), root, 0, 0.16, 0);
  const torso = at(cap(0.132, 0.2, mSkin), root, 0, 0.34, 0);
  const chest = cap(0.118, 0.21, mSkin); chest.rotation.z = PI/2; at(chest, root, 0, 0.47, 0);
  const belt = at(cyl(0.136, 0.05, mBelt), root, 0, 0.09, 0);
  const knot = at(cap(0.02, 0.07, mBelt), root, 0.03, 0.07, 0.135); knot.rotation.z = 0.5;
  const medal = grp(root, 0, 0, 0);
  const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.012, 8, 32), mAcc); ribbon.rotation.x = 1.15; at(ribbon, medal, 0, 0.5, 0.075);
  const coin = cyl(0.042, 0.012, mGold); coin.rotation.x = PI/2; at(coin, medal, 0, 0.385, 0.142);
  const coin2 = cyl(0.036, 0.012, mGold); coin2.rotation.x = PI/2; at(coin2, medal, 0.05, 0.345, 0.146);
  const neck = grp(root, 0, 0.6, 0);
  at(cyl(0.048, 0.1, mSkin), neck, 0, 0.03, 0);
  const head = at(ball(0.125, mSkin), neck, 0, 0.17, 0); head.scale.set(0.95, 1.05, 1);
  [-1, 1].forEach(s => at(ball(0.014, mDark), neck, s*0.045, 0.185, 0.113));
  const hairShort = new THREE.Mesh(new THREE.SphereGeometry(0.131, 28, 18, 0, 2*PI, 0, 1.25), mHair); hairShort.rotation.x = -0.45; hairShort.scale.set(0.97, 1.06, 1.02); at(hairShort, neck, 0, 0.172, -0.004);
  const bun = at(ball(0.052, mHair), neck, 0, 0.3, -0.07);
  const tail = at(cap(0.034, 0.16, mHair), neck, 0, 0.13, -0.15); tail.rotation.x = -0.35;
  const headband = at(cyl(0.126, 0.034, mHead), neck, 0, 0.215, 0); headband.rotation.x = -0.12;
  const beanie = new THREE.Mesh(new THREE.SphereGeometry(0.136, 28, 14, 0, 2*PI, 0, 1.75), mHead); beanie.rotation.x = -0.3; beanie.scale.set(0.99, 1.1, 1.03); at(beanie, neck, 0, 0.172, -0.002);
  const crown = grp(neck, 0, 0.275, 0); crown.rotation.x = -0.12;
  crown.add(new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.092, 0.045, 20, 1, true), mGold)); crown.children[0].material.side = THREE.DoubleSide;
  for (let i = 0; i < 6; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.055, 8), mGold), a = i / 6 * 2 * PI; sp.position.set(Math.cos(a)*0.095, 0.048, Math.sin(a)*0.095); crown.add(sp); }
  const capG = grp(neck, 0, 0.19, 0);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.134, 28, 14, 0, 2*PI, 0, PI/2), mHead); dome.scale.set(1, 0.85, 1.03); capG.add(dome);
  const brim = cyl(0.1, 0.012, mHead); brim.scale.set(1, 1, 0.8); at(brim, capG, 0, 0.004, 0.13);
  const limbs = [0, 1].map(i => { const sx = i ? -1 : 1;
    const sh = grp(root, sx*0.215, 0.5, 0);
    const shoulder = at(ball(0.066, mSkin), sh, 0, 0, 0);
    at(cap(0.05, 0.2, mSkin), sh, 0, -0.15, 0);
    const sleeve = at(cap(0.062, 0.1, mTop), sh, 0, -0.085, 0);
    const el = grp(sh, 0, -0.3, 0);
    const fore = at(cap(0.043, 0.19, mSkin), el, 0, -0.14, 0);
    const hand = at(ball(0.052, mSkin), el, 0, -0.3, 0); hand.scale.set(0.8, 1.05, 1.15);
    const thumb = at(ball(0.02, mSkin), el, sx*-0.03, -0.285, 0.035);
    const wrist = at(cyl(0.049, 0.06, mWrist), el, 0, -0.225, 0);
    const hip = grp(root, sx*0.095, -0.03, 0);
    const thigh = at(cap(0.074, 0.3, mSkin), hip, 0, -0.22, 0);
    const short = at(cap(0.084, 0.13, mBot), hip, 0, -0.12, 0);
    const kn = grp(hip, 0, -0.45, 0);
    const shin = at(cap(0.056, 0.3, mSkin), kn, 0, -0.21, 0);
    const ank = grp(kn, 0, -0.44, 0);   // cheville : le pied se tend dans le prolongement du tibia
    const foot = cap(0.043, 0.1, mSkin); foot.rotation.x = PI/2; at(foot, ank, 0, 0, 0.06);
    const sock = at(cyl(0.058, 0.09, mShoe), kn, 0, -0.36, 0);
    const sole = cap(0.05, 0.13, mShoe); sole.rotation.x = PI/2; sole.scale.set(1.1, 1, 0.62); at(sole, ank, 0, -0.025, 0.07);
    return {sx, sh, el, hip, kn, ank, hand, thumb, fore, upper:sh.children[1], shoulder, sleeve, wrist, thigh, short, shin, foot, sock, sole}; });
  // articulation de la taille : le haut du corps (torse, cou, épaules) peut se cambrer ou s'arrondir par rapport au bassin
  const spine = grp(root, 0, 0.2, 0);
  [torso, chest, neck, medal, limbs[0].sh, limbs[1].sh].forEach(o => { o.position.y -= 0.2; spine.add(o); });

  // socle : disque + arc de progression vers le niveau suivant
  const base = at(new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.03, 64), soft), scene, 0, -0.016, 0);
  const track = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.018, 8, 96), soft); track.rotation.x = PI/2; scene.add(track);
  if (opts.bare) base.visible = track.visible = false;
  // mur des exercices au mur : un panneau derrière ou devant le personnage
  const wall = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.06), new THREE.MeshStandardMaterial({roughness:1, transparent:true, opacity:0.5})); wall.position.set(0, 1.25, -0.42); wall.visible = false;
  const wallPivot = grp(scene, 0, 0, 0); wallPivot.add(wall);                 // le mur suit la vue, pas les pirouettes du personnage
  // barres parallèles (dips) : deux barres sous les mains, à hauteur de hanches
  const BAR_H = 0.95, bars = grp(wallPivot, 0, 0, 0), barM = new THREE.MeshStandardMaterial({roughness:0.6, metalness:0.2}); bars.visible = false;
  const barL = [-1, 1].map(() => { const g = grp(bars, 0, 0, 0), top = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 12), barM); top.rotation.x = PI/2; top.position.y = BAR_H - 0.03; g.add(top);
    [-0.38, 0.38].forEach(z => { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, BAR_H, 10), barM); post.position.set(0, BAR_H / 2, z); g.add(post); }); return g; });
  const ringM = new THREE.MeshStandardMaterial({roughness:0.5});
  let arc = null;
  const setArc = frac => { if (arc) { scene.remove(arc); arc.geometry.dispose(); }
    arc = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.03, 8, 96, Math.max(0.02, Math.min(1, frac)) * 2 * PI), ringM);
    arc.rotation.x = -PI/2; arc.rotation.z = PI/2; arc.visible = !opts.bare; scene.add(arc); };

  // confettis de célébration
  const NC = 110, conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.06, 0.035), new THREE.MeshBasicMaterial({side:THREE.DoubleSide}), NC);
  conf.visible = false; conf.frustumCulled = false; scene.add(conf);
  const cp = Array.from({length:NC}, () => ({})), dummy = new THREE.Object3D(), cols = ["#ff5b2e","#f2f0ea","#c9a227","#3d5f94","#8a8880"];
  cp.forEach((c, i) => conf.setColorAt(i, new THREE.Color(cols[i % cols.length])));

  function dress(f){
    f = Object.assign({}, f || {}); Object.keys(f).forEach(k => { if (OLD[f[k]]) f[k] = OLD[f[k]]; });
    const part = v => String(v || "none").split("_"), col = (c, d) => CLOTH[c] || CLOTH[d];
    mSkin.color.set(SKIN[f.skin] || SKIN.s2); mHair.color.set(HAIR[f.hairc] || HAIR.brown);
    const [tk, tc] = part(f.top), [bk, bc] = part(f.bottom || "short_k"), [fk, fc] = part(f.feet), [wk, wc] = part(f.wrists), [hk, hc] = part(f.head), [xk, xc] = part(f.extra);
    const topM = tk === "none" ? mSkin : mTop; mTop.color.set(col(tc, "w")); mBot.color.set(col(bc, "k"));
    [waist, torso, chest].forEach(m => m.material = topM);
    const pants = bk === "pants", sleeves = tk === "tee" || tk === "ls", long = tk === "ls", shoes = fk === "shoes", socks = fk === "socks";
    mShoe.color.set(col(fc, shoes ? "k" : "w")); mWrist.color.set(col(wc, "o")); mHead.color.set(col(hc, "o")); mBelt.color.set(col(xc, "o"));
    limbs.forEach(L => { L.sleeve.visible = sleeves && !long; L.shoulder.material = sleeves ? mTop : mSkin; L.upper.material = long ? mTop : mSkin; L.fore.material = long ? mTop : mSkin;
      L.thigh.material = pants ? mBot : mSkin; L.shin.material = pants ? mBot : mSkin; L.short.visible = !pants;
      L.wrist.visible = wk === "wraps"; L.hand.material = L.thumb.material = wk === "chalk" ? mChalk : mSkin;
      L.sock.visible = shoes || socks; L.sole.visible = shoes; L.foot.visible = !shoes; L.foot.material = socks ? mShoe : mSkin; });
    const covered = hk === "cap" || hk === "beanie";
    hairShort.visible = f.hair !== "none" && f.hair != null && hk !== "beanie"; bun.visible = f.hair === "bun" && !covered; tail.visible = f.hair === "tail";
    headband.visible = hk === "band"; capG.visible = hk === "cap"; beanie.visible = hk === "beanie"; crown.visible = hk === "crown";
    belt.visible = knot.visible = xk === "belt"; medal.visible = xk === "medal" || xk === "medal2"; coin2.visible = xk === "medal2";
  }
  function colors(){ wall.material.color.set(cssv("--mut") || "#918e86"); barM.color.set(cssv("--mut") || "#918e86"); const a = cssv("--acc") || "#ff5b2e"; mAcc.color.set(a); ringM.color.set(a); soft.color.set(cssv("--line") || "#2c2c29"); }

  let cur = flat("stand"), yaw = opts.yaw != null ? opts.yaw : -0.9, spin = !opts.bare, scale = 1, jump = 0, extraYaw = 0;
  let queue = [], seg = null, here = "stand", wob = null, pulse = null, holdT = 0, scripted = false;      // transition en cours, posture atteinte, oscillation d'arrivée
  const off = {p:0, r:0};
  const box = new THREE.Box3(), hb = new THREE.Box3(), tmp = new THREE.Vector3(); let camD = -1, camY = 1, camX = 0, camZ = 0; let lastC = {};   // appuis au sol de l'image précédente
  const reduce = !opts.manual && window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function apply(p, breath){
    root.rotation.set(p.pitch + off.p, 0, p.roll + off.r); neck.rotation.x = p.head; spine.rotation.x = p.arch;
    limbs.forEach((L, i) => {
      L.sh.rotation.set(p["arm" + i], 0, L.sx * p["armZ" + i]); L.el.rotation.x = p["elbow" + i];
      L.hip.rotation.set(p["hip" + i], L.sx * p["hipY" + i], L.sx * p["hipZ" + i]); L.kn.rotation.x = p["knee" + i]; L.ank.rotation.x = p.point * 1.38; });
    torso.scale.set(1 + breath, 1, 1 + breath); chest.scale.set(1, 1 + breath, 1 + breath);
    root.position.set(0, 0, 0); pivot.position.y = 0; pivot.scale.setScalar(scale); pivot.rotation.y = yaw + extraYaw + p.spin; wallPivot.rotation.y = yaw + extraYaw; pivot.updateMatrixWorld(true);
    box.setFromObject(root); let low = box.min.y;
    if (p.hands > 0.5) { low = Infinity; limbs.forEach(L => { if (L.sx === (p.one < 0 ? -1 : 1) || Math.abs(p.one) < 0.5) low = Math.min(low, hb.setFromObject(L.hand).min.y); low = Math.min(low, hb.setFromObject(L.foot).min.y, hb.setFromObject(L.shin).min.y); }); }
    // centrage : sur le corps quand on est debout, sur les mains d'appui quand on est en appui (les mains ne glissent plus au sol)
    let cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2; const w = Math.max(0, Math.min(1, p.hands));
    if (w > 0) { let hx = 0, hz = 0, n = 0; limbs.forEach(L => { const k = L.sx === (p.one < 0 ? -1 : 1) ? 1 : 1 - Math.max(0, Math.min(1, Math.abs(p.one))); if (k > 0) { hb.setFromObject(L.hand); hx += k * (hb.min.x + hb.max.x) / 2; hz += k * (hb.min.z + hb.max.z) / 2; n += k; } });
      if (n) { cx += (hx / n - cx) * w; cz += (hz / n - cz) * w; } }
    tmp.set(cx, 0, cz); pivot.worldToLocal(tmp);
    root.position.set(-tmp.x, -low / scale, -tmp.z);                         // l'appui touche le socle, le corps est centré dessus
    pivot.position.y = jump + (bars.visible && p.hands > 0.5 ? BAR_H : 0);
    if (opts.bare && !wall.visible && !bars.visible) { pivot.updateMatrixWorld(true);
      const pts = []; limbs.forEach((L, i) => { [["h" + i, L.hand], ["f" + i, L.foot]].forEach(([k, o]) => { hb.setFromObject(o); pts.push([k, (hb.min.x + hb.max.x) / 2, hb.min.y, (hb.min.z + hb.max.z) / 2]); }); });
      const held = pts.find(([k, x, y]) => y < 0.03 && lastC[k]);
      if (held) { const [k, x, , z] = held, dx = lastC[k][0] - x, dz = lastC[k][1] - z; const v = new THREE.Vector3(dx, 0, dz); pivot.updateMatrixWorld(true);
        const inv = new THREE.Matrix4().copy(pivot.matrixWorld).invert(); v.applyMatrix4(new THREE.Matrix4().extractRotation(inv)).multiplyScalar(1 / scale); root.position.x += v.x; root.position.z += v.z; pivot.updateMatrixWorld(true);
        pts.forEach(q => { q[1] += dx; q[3] += dz; }); }
      lastC = {}; pts.forEach(([k, x, y, z]) => { if (y < 0.03) lastC[k] = [x, z]; }); }   // debout entre les barres, puis en appui dessus
    // les barres suivent les mains (écartement et avancée)
    if (bars.visible) { pivot.updateMatrixWorld(true); limbs.forEach((L, i) => { hb.setFromObject(L.hand); hb.getCenter(tmp); wallPivot.worldToLocal(tmp); barL[i].position.x = tmp.x; barL[i].position.z = tmp.z; }); }
    // exercices au mur : le personnage reste au contact du mur (talons, pieds ou poitrine), au lieu de le traverser
    if (wall.visible) { const ry = pivot.rotation.y; pivot.rotation.y = p.spin; pivot.updateMatrixWorld(true); box.setFromObject(root);
      const side = wall.position.z > 0 ? 1 : -1, surf = side * (Math.abs(wall.position.z) - 0.03), ext = side > 0 ? box.max.z : box.min.z;
      root.position.z += (surf - ext) / scale; pivot.rotation.y = ry; pivot.updateMatrixWorld(true); }
    // vignettes : la caméra suit le personnage et se rapproche quand la figure est basse ou ramassée
    if (opts.bare) { pivot.updateMatrixWorld(true); box.setFromObject(root); box.getSize(tmp); const r = 0.5 * Math.hypot(tmp.x, tmp.y, tmp.z), cy = (box.min.y + box.max.y) / 2;
      // cadrage : la caméra suit aussi le centre horizontal (mur, barres, figures décalées) et recule assez pour tout voir
      const cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2;
      const wantD = Math.max(2.5, Math.min(5.2, r * 1.32 / 0.268)), wantY = Math.max(0.42, cy);
      if (camD < 0) { camD = wantD; camY = wantY; camX = cx; camZ = cz; } else { const k = 0.22; camD += (wantD - camD) * k; camY += (wantY - camY) * k; camX += (cx - camX) * k; camZ += (cz - camZ) * k; }
      cam.position.set(camX, camY + 0.03, camZ + camD); cam.lookAt(camX, camY, camZ); }
  }
  function size(){ const w = OFF ? OFF.w : host.clientWidth || 300, h = OFF ? OFF.h : host.clientHeight || 240; renderer.setSize(w, h, false); cam.aspect = w / h;
    if (opts.bare) { cam.position.set(0, 1.08, 4.25); cam.lookAt(0, 1.06, 0); } else { cam.position.set(0, 1.3, 5.6); cam.lookAt(0, 0.98, 0); }
    cam.updateProjectionMatrix(); }

  // célébration : flexion, saut bras levés avec un tour sur soi, confettis, puis retour à la posture
  let party = null, pending = false, restPose = "stand";
  function startParty(){
    pending = false; party = {t:0};
    cp.forEach(c => { const a = Math.random() * 2 * PI, r = 0.5 + Math.random() * 1.4;
      c.x = 0; c.y = 1.1 + Math.random() * 0.5; c.z = 0; c.vx = Math.cos(a) * r; c.vz = Math.sin(a) * r; c.vy = 2.2 + Math.random() * 2.4;
      c.rx = Math.random() * 6; c.ry = Math.random() * 6; c.sp = 3 + Math.random() * 6; });
    conf.visible = true; kick();
  }
  function partyStep(dt){
    const T = party.t += dt, D = 3.0, A = flat("crouch"), B = flat("cheer"), R = flat(restPose);
    if (T < 0.35) cur = mix(R, A, ease(T / 0.35));
    else if (T < 0.7) cur = mix(A, B, ease((T - 0.35) / 0.35));
    else if (T < 2.3) cur = B;
    else cur = mix(B, R, ease(Math.min(1, (T - 2.3) / 0.7)));
    const j = T < 0.5 ? 0 : T < 1.4 ? Math.sin((T - 0.5) / 0.9 * PI) * 0.42 : T < 2.0 ? Math.sin((T - 1.4) / 0.6 * PI) * 0.2 : 0; jump = j;
    extraYaw = T < 0.5 ? 0 : T < 1.4 ? ease((T - 0.5) / 0.9) * 2 * PI : 0;
    arc.scale.setScalar(1 + Math.sin(Math.min(1, T / 1.2) * PI) * 0.08); track.scale.copy(arc.scale);
    cp.forEach((c, i) => { c.vy -= 5.5 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.z += c.vz * dt; if (c.y < 0.02) { c.y = 0.02; c.vx *= 0.8; c.vz *= 0.8; c.vy = 0; }
      dummy.position.set(c.x, c.y, c.z); dummy.rotation.set(c.rx + T * c.sp, c.ry + T * c.sp * 0.7, 0); dummy.scale.setScalar(T > 2.4 ? Math.max(0, 1 - (T - 2.4) / 0.6) : 1); dummy.updateMatrix(); conf.setMatrixAt(i, dummy.matrix); });
    conf.instanceMatrix.needsUpdate = true; if (conf.instanceColor) conf.instanceColor.needsUpdate = true;
    if (T >= D) { party = null; conf.visible = false; jump = 0; extraYaw = 0; arc.scale.setScalar(1); track.scale.setScalar(1); cur = R; queue = []; seg = null; here = restPose; }
  }

  let last = performance.now(), visible = true, raf = 0, dirty = true, drag = null;
  let clock = 0;
  function frame(now){ raf = 0;
    if (!party && !seg && !queue.length && !drag && now - last < 30) { if (visible) raf = requestAnimationFrame(frame); return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now; core(dt, now);
    if (visible && (!reduce || seg || queue.length || party)) raf = requestAnimationFrame(frame); }
  function core(dt, now){
    if (party) { partyStep(dt); dirty = true; }
    else if (seg || queue.length || holdT > 0) {
      if (holdT > 0) { holdT -= dt; dirty = true; }
      else if (!seg) { const [name, dur, hold] = queue.shift(); seg = {from:cur, to:flat(name), name, dur:reduce ? 0.01 : dur, hold:hold || 0, t:0, last:!queue.length, soft:scripted}; }
      if (seg) {
      seg.t = Math.min(1, seg.t + dt / seg.dur); cur = mix(seg.from, seg.to, seg.last && !seg.soft ? back(seg.t) : ease(seg.t)); dirty = true;
      if (seg.t >= 1) { cur = seg.to; here = seg.name; holdT = seg.hold; const done = seg.last && !seg.soft; seg = null;
        if (done && !reduce) { const c = cat(here); wob = {t:0, a:c === "hs" ? 0.075 : c === "pl" ? 0.04 : 0.015}; pulse = {t:0}; } } } }
    off.p = 0; off.r = 0;
    if (!party && !reduce) {
      const c = cat(here), s = now / 1000, w = opts.loopT ? 2 * PI * clock / opts.loopT : 0;   // équilibre : micro-corrections permanentes
      if (opts.loopT) { if (!seg && c === "hs") { off.r += Math.sin(w) * 0.022; off.p += Math.sin(2*w) * 0.012; } if (!seg && c === "pl") off.p += Math.sin(2*w) * 0.012; }
      else {
      if (!seg && c === "hs") { off.r += Math.sin(s * 1.3) * 0.012; off.p += Math.sin(s * 0.9 + 1) * 0.01; }
      if (!seg && c === "pl") { off.p += Math.sin(s * 5.1) * 0.004; } }
      if (wob) { wob.t += dt; const k = Math.exp(-3.2 * wob.t) * wob.a * Math.sin(wob.t * 9); off.r += k; off.p += k * 0.6; if (wob.t > 1.6) wob = null; dirty = true; }
      if (pulse) { pulse.t += dt; const k = 1 + Math.sin(Math.min(1, pulse.t / 0.5) * PI) * 0.05; arc.scale.setScalar(k); track.scale.setScalar(k); if (pulse.t > 0.5) { pulse = null; arc.scale.setScalar(1); track.scale.setScalar(1); } dirty = true; }
    }
    if (spin && !reduce && !drag && !party) { yaw += dt * 0.25; dirty = true; }
    const breath = reduce ? 0 : opts.loopT ? Math.sin(2 * PI * clock / opts.loopT) * 0.02 : Math.sin(now / 900) * 0.012;
    if (dirty || !reduce) { apply(cur, breath); renderer.render(scene, cam); dirty = false; }
  }
  const kick = () => { dirty = true; if (opts.manual) return; if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  if (DOM) {
  canvas.addEventListener("pointerdown", e => { drag = {x:e.clientX, yaw, moved:false}; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; });
  canvas.addEventListener("pointermove", e => { if (drag) { if (Math.abs(e.clientX - drag.x) > 4) { drag.moved = true; spin = false; } yaw = drag.yaw + (e.clientX - drag.x) * 0.012; kick(); } });
  canvas.addEventListener("pointerup", () => { const tap = drag && !drag.moved; drag = null; canvas.style.cursor = "grab"; if (tap && !party && !opts.bare) startParty(); });
  canvas.addEventListener("pointercancel", () => { drag = null; canvas.style.cursor = "grab"; });
  if (window.ResizeObserver) new ResizeObserver(() => { size(); kick(); }).observe(host);
  if (window.IntersectionObserver) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) { if (pending) startParty(); kick(); } }).observe(host);
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; if (visible) kick(); });
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { colors(); kick(); });
  }
  colors(); size(); setArc(0); dress({hair:"short"});

  return {
    // pose : clé de POSES · frac : progression vers le niveau suivant (0 à 1) · level : niveau · fit : tenue choisie
    set({pose, frac, level, fit, label}){
      restPose = POSES[pose] ? pose : "stand";
      scripted = false;
      const goal = queue.length ? queue[queue.length - 1][0] : seg ? seg.name : here;
      if (!party && goal !== restPose) { const fromName = seg ? seg.name : here; queue = route(fromName, restPose); seg = null; }
      setArc(frac || 0);
      scale = 0.9 + Math.min(10, (level || 1) - 1) * 0.012;                   // le personnage grandit légèrement avec le niveau
      dress(fit); if (label && DOM) canvas.setAttribute("aria-label", label);
      colors(); kick();
    },
    // joue la célébration dès que le personnage est à l'écran
    celebrate(){ const r = host.getBoundingClientRect(); if (visible && r.width && r.bottom > 0 && r.top < innerHeight && !document.hidden) startParty(); else pending = true; },
    poses: Object.keys(POSES).filter(k => !VIA[k] && !/^(hs_cw|hs_splitM|hs_split2|hs_tuck90|hs_headin|hs_7headin|hs_flagM|hs_flagLo|hs_mex|hs_hspu|hs_shift|hs_finger|hs_oa|hs_spress|hs_stal|lsit|sit|pk1|pk2|sp2|hs_wsplit|hs_oafullM|hs_tflag|pl_halfL|pl_tuckDn|pl_strN|sitP|sitSL|lsitT|tuckRise|lv_|c2w_|pu_)/.test(k)),
    // capture image par image (génération des animations des nœuds de l'arbre)
    step(dt){ clock += dt; dirty = true; core(dt, clock * 1000); },
    jump(pose){ camD = -1; lastC = {}; queue = []; seg = null; holdT = 0; wob = null; pulse = null; here = restPose = POSES[pose] ? pose : "stand"; cur = flat(here); clock = 0; dirty = true; },
    busy(){ return !!(seg || queue.length || wob); },
    moving(){ return !!(seg || queue.length || holdT > 0); },
    // joue un script : [[posture, durée, maintien], …] ; back : revient debout par le mouvement inverse
    play(steps, back){ scripted = true; holdT = 0; seg = null; queue = steps.map(s => s.slice()); if (back) { const last = steps[steps.length - 1][0]; route(last, "stand").forEach(r => queue.push([r[0], r[1], 0])); } restPose = "stand"; dirty = true; },
    at(){ return seg ? seg.name : here; },
    holding(){ return !seg && holdT > 0; },
    view(y){ yaw = y; dirty = true; },
    wall(side){ bars.visible = side === "bars"; wall.visible = typeof side === "number" && !!side; wall.position.z = side > 0 ? 0.42 : -0.42; },
    canvas,
    png(){ return canvas.toDataURL("image/png"); },
  };
}
