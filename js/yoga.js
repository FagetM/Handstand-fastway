// Les figures racontées : leur nom en yoga quand il existe (sanskrit translittéré, traduit), une petite histoire,
// et les figures maîtresses, celles qui couronnent un chemin. Ton doux, faits vérifiés, pas de légende présentée comme un fait.
"use strict";
const ARBRE = ["Adho Mukha Vṛkṣāsana", "l’arbre tourné vers le bas"];
// [nom en yoga, ce qu’il veut dire, nuance éventuelle]
const YOGA = {
  fd_plank:["Phalakāsana", "la planche (du yoga)"],
  fd_push:["Caturaṅga Daṇḍāsana", "le bâton sur quatre appuis", "la descente de la pompe"],
  fd_c2w:[ARBRE[0], ARBRE[1], "ici, face au mur"],
  st_split:[ARBRE[0], ARBRE[1], "jambes en ciseaux, au mur"],
  b1_free5:[ARBRE[0], ARBRE[1], "jambes en ciseaux"],
  b2_str15:ARBRE, in_str40:ARBRE, in_str60:ARBRE, in_tuck:[ARBRE[0], ARBRE[1], "groupé"],
  oa_strad30:[ARBRE[0], ARBRE[1], "jambes écartées"],
  in_mexican:["Vṛścikāsana", "le scorpion", "une cousine : en yoga, le scorpion se fait souvent sur les avant-bras"],
  oa_oahs:["Eka Hasta Vṛkṣāsana", "l’arbre sur une main", "un nom moderne, pas un texte ancien"],
  oa_oahsw:["Eka Hasta Vṛkṣāsana", "l’arbre sur une main", "un nom moderne"],
  oa_oahs10:["Eka Hasta Vṛkṣāsana", "l’arbre sur une main", "un nom moderne"],
  lo_frog:["Kākāsana et Bakāsana", "le corbeau (bras fléchis) et l’échassier (bras tendus)"],
  lo_elbow:["Mayūrāsana", "le paon", "le paon se tient sur les deux coudes, sous le ventre"],
  lo_croc:["Mayūrāsana", "le paon", "un proche cousin : la même idée, les coudes contre les hanches"],
  pr_lsit:["Daṇḍāsana", "le bâton", "mais soulevé du sol, sur les mains"],
  pr_stradL:["Upaviṣṭa Koṇāsana", "l’angle ouvert assis", "mais soulevé du sol, sur les mains"],
  pr_vsitC:["Nāvāsana", "le bateau", "une cousine : le bateau se tient sans les mains"],
  pr_extSup:["Pūrvottānāsana", "l’étirement intense de l’est", "l’est, c’est le devant du corps"],
  pl_tuck:["Lolāsana", "le pendentif", "une petite sœur : le pendentif se fait jambes croisées"],
  pl_full:["Mayūrāsana", "le paon, mais sans l’appui des coudes", "pas de nom classique : c’est sa plus proche cousine"],
  pr_straddle:["d’Upaviṣṭa Koṇāsana à Adho Mukha Vṛkṣāsana", "de l’angle ouvert à l’arbre tourné vers le bas"],
  pr_pike:["de Paścimottānāsana à Adho Mukha Vṛkṣāsana", "de la pince à l’arbre tourné vers le bas"],
};
// figures maîtresses : le sommet de chaque chemin
const MAITRES = new Set(["in_str60", "oa_oahs10", "pl_full", "pr_stalder", "pr_manna", "ul_full"]);
const HIST = {
  in_str60:"En France, les gymnastes l’appellent l’ATR, l’appui tendu renversé. Une minute de calme tête en bas : c’est la base de tout ce qui suit, et un vrai sommet en soi.",
  b2_str15:"Au gymnase, on dit ATR : appui tendu renversé. Le corps entier en une seule ligne, comme un fil à plomb.",
  oa_oahs:"Longtemps, l’équilibre sur un bras a été le numéro des équilibristes de cirque. Il se construit lentement, souvent sur des années : la patience fait partie de la figure.",
  oa_oahs10:"Le sommet du chemin un bras : dix secondes de chaque côté, le côté faible compris. Les équilibristes de cirque en ont fait un art. Ici, on y vient pas à pas.",
  pl_full:"Le mot est français : la planche, en anglais comme ailleurs, a gardé son nom d’origine. Aux anneaux et au sol, c’est l’un des éléments de force les plus admirés de la gymnastique.",
  pr_stalder:"Elle emprunte son nom au « stalder » de la barre fixe, l’élément du gymnaste suisse Josef Stalder, champion olympique à la barre fixe en 1948. Ici, la même ouverture des jambes, mais au sol, vers l’équilibre.",
  pr_manna:"L’une des figures de force les plus rares : les mains devant, le bassin loin derrière, les jambes qui montent vers le visage. Peu de gens la tiennent, et c’est ce qui la rend précieuse.",
  ul_full:"Ton propre enchaînement : l’équerre, l’équilibre, un bras de chaque côté, la planche. Tout ce que tu as construit, posé bout à bout, sans toucher le sol.",
  lo_elbow:"La Haṭha Yoga Pradīpikā, un texte du XVᵉ siècle, décrit déjà le paon, Mayūrāsana : le corps à l’horizontale, en appui sur les coudes.",
  lo_frog:"En sanskrit, kāka veut dire corbeau, et baka désigne un échassier. Le premier envol de beaucoup de pratiquants, sur les tapis de yoga comme au gymnase.",
  pr_lsit:"« Équerre », comme l’outil du menuisier : un angle droit net entre le buste et les jambes, porté par les bras.",
  pl_tuck:"La première planche, celle qui fait décoller les pieds. Tout le corps se ramasse au-dessus des mains, prêt à s’allonger.",
  in_mexican:"Le dos se cambre, les pieds descendent vers la tête : une figure qu’on retrouve chez les contorsionnistes et les équilibristes.",
  pr_vsitC:"Nāvāsana, le bateau du yoga, en version gymnaste : sur les mains, les jambes hautes, comme une coque qui fend l’eau.",
};
const yogaOf = id => YOGA[id] || null;
