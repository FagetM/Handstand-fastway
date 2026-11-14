// La Voie : le côté intérieur de la pratique. Une pensée par jour (sources citées), des respirations guidées,
// un carnet d’écoute du corps, et « Transmettre », le chemin vers l’enseignement du yoga et de la gym.
// Laïque, en invitation, sans promesse : les textes anciens sont cités pour ce qu’ils disent, pas comme des dogmes.
"use strict";
// [citation, source, ce que ça veut dire sur le tapis]
const PENSEES = [
  ["Le yoga est l’apaisement des fluctuations du mental.", "Patañjali, Yoga Sūtra 1.2", "Avant de chercher l’équilibre, laisse retomber le bruit intérieur."],
  ["La posture est stable et agréable.", "Patañjali, Yoga Sūtra 2.46", "Tiens ton appui tendu sans serrer la mâchoire."],
  ["Elle naît du relâchement de l’effort.", "Patañjali, Yoga Sūtra 2.47", "Cherche le muscle de trop, et lâche-le."],
  ["Par la pratique et le détachement.", "Patañjali, Yoga Sūtra 1.12", "Répète, puis laisse tomber le verdict du jour."],
  ["La pratique s’ancre quand elle dure longtemps, sans interruption, avec soin.", "Patañjali, Yoga Sūtra 1.14", "Une manna se gagne en saisons, pas en séances."],
  ["Effort ardent, étude de soi, confiance.", "Patañjali, Yoga Sūtra 2.1", "Travaille, observe-toi, puis fais confiance au temps."],
  ["La souffrance à venir peut être évitée.", "Patañjali, Yoga Sūtra 2.16", "Tes poignets parlent avant de casser : écoute-les tôt."],
  ["Face aux pensées qui abîment, cultive leur contraire.", "Patañjali, Yoga Sūtra 2.33", "« Je n’y arrive pas » devient « je n’y arrive pas encore »."],
  ["Du contentement naît un bonheur sans égal.", "Patañjali, Yoga Sūtra 2.42", "Savoure la planche d’aujourd’hui, pas celle de dans six mois."],
  ["Tu as droit à l’action, jamais à ses fruits.", "Bhagavad Gītā 2.47", "Soigne la répétition ; le chrono suivra, ou pas."],
  ["L’égalité d’âme s’appelle yoga.", "Bhagavad Gītā 2.48", "Accueille le bon jour comme le mauvais, avec la même tête."],
  ["Le yoga est l’habileté dans l’action.", "Bhagavad Gītā 2.50", "La qualité d’abord, le volume ensuite."],
  ["Pas de yoga pour qui mange ou dort trop, ni pour qui mange ou dort trop peu.", "Bhagavad Gītā 6.16", "Le sommeil et l’assiette font partie de la séance."],
  ["Dans l’esprit du débutant, les possibilités sont nombreuses ; dans celui de l’expert, elles sont rares.", "Shunryu Suzuki, Esprit zen, esprit neuf (1970)", "Ancien gymnaste ou pas, réapprends chaque figure comme la première fois."],
  ["Mon pouvoir merveilleux : puiser l’eau, porter le bois.", "le laïc Pang (P’ang Yun), Chine, VIIIᵉ–IXᵉ siècle", "L’échauffement des poignets, c’est déjà la pratique."],
  ["Si tu sais ce que tu fais, tu peux faire ce que tu veux.", "attribuée à Moshé Feldenkrais", "La conscience du geste vient avant la maîtrise."],
  ["Pour sentir une différence, diminue l’effort.", "d’après Moshé Feldenkrais, Awareness Through Movement (1972)", "Explore le stalder lentement, sans charge : tu sentiras mieux."],
  ["Certaines choses dépendent de nous, d’autres non.", "Épictète, Manuel, 1", "Ton sommeil et ton effort dépendent de toi ; la météo de tes tendons, non."],
  ["Rien de grand ne naît d’un coup, pas même une grappe de raisin ou une figue.", "Épictète, Entretiens, I, 15", "Patience pour l’équilibre sur un bras : la figue mûrit à son heure."],
  ["Ce qui fait obstacle à l’action fait avancer l’action ; ce qui barre le chemin devient le chemin.", "Marc Aurèle, Pensées, V, 20", "Un poignet au repos, c’est une saison pour les épaules."],
  ["Revendique-toi pour toi-même.", "Sénèque, Lettres à Lucilius, 1", "Ce temps sur le tapis t’appartient : protège-le."],
  ["Il n’est nulle part, celui qui est partout.", "Sénèque, Lettres à Lucilius, 2", "Un programme suivi vaut mieux que dix commencés."],
  ["Pour qui ne sait pas vers quel port il navigue, aucun vent n’est favorable.", "Sénèque, Lettres à Lucilius, 71", "Nomme l’objectif de ce cycle, un seul."],
  ["Prêter attention, délibérément, au moment présent, sans juger.", "Jon Kabat-Zinn, Où tu vas, tu es (1994)", "Observe ta chute ; ne la condamne pas."],
  ["Tu ne peux pas arrêter les vagues, mais tu peux apprendre à surfer.", "Jon Kabat-Zinn, Où tu vas, tu es (1994)", "La fatigue viendra : ajuste-toi au lieu de lutter."],
  ["Le karaté est comme l’eau qui bout : sans feu constant, elle refroidit.", "Gichin Funakoshi, vingt préceptes, 11", "Un peu chaque jour plutôt que beaucoup de temps en temps."],
  ["Le karaté commence et finit par le salut.", "Gichin Funakoshi, vingt préceptes, 1", "Ouvre et ferme ta séance par un instant de gratitude."],
  ["La forme d’abord, le volume ensuite.", "adage des salles de gym", "Une belle répétition vaut mieux que cinq tordues."],
  ["Le jour sans entraînement fait partie de l’entraînement.", "adage des entraîneurs", "Le repos est un choix actif, pas une faute."],
  ["Ne pas nuire.", "d’après Patañjali, Yoga Sūtra 2.30 (ahiṃsā)", "Ni aux autres, ni à toi : une séance qui abîme n’est pas une bonne séance."],
  ["Être vrai.", "d’après Patañjali, Yoga Sūtra 2.30 (satya)", "Dis honnêtement comment tu vas, à ton carnet comme à ton entourage."],
  ["J’inspire, je calme mon corps. J’expire, je souris.", "Thich Nhat Hanh, La paix, un art, une pratique (1991)", "À essayer aussi dans une file d’attente ou avant une conversation difficile."],
  ["Le corps ne ment pas.", "adage des danseurs, souvent prêté à Martha Graham", "Ce que tu ressens compte plus que ce que tu voulais ressentir."],
];
const dayN = () => Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
const penseeDuJour = k => PENSEES[((dayN() + (k || 0)) % PENSEES.length + PENSEES.length) % PENSEES.length];
// Pratiques guidées : phases de souffle (in, out) ou étapes de texte, avec leur durée en secondes
const breath = (pat, n) => Array.from({length:n}, () => pat).flat();
const PRATIQUES = [
  {id:"reso", name:"Respiration lente", dur:"5 min", why:"Vers 6 souffles par minute, le rythme cardiaque se met à onduler avec la respiration. Des études le relient à plus de calme ; rien de magique, juste un rythme.",
    src:"Lehrer et Gevirtz, Frontiers in Psychology, 2014", alt:[["5 s, 5 s", breath([["in",5,"Inspire par le nez"],["out",5,"Expire par le nez"]], 30)], ["4 s, 6 s", breath([["in",4,"Inspire par le nez"],["out",6,"Expire longuement"]], 30)]]},
  {id:"soupir", name:"Soupir cyclique", dur:"5 min", why:"Deux inspirations par le nez, une longue expiration par la bouche. Dans un essai de 2023, 5 minutes par jour ont amélioré l’humeur un peu plus que la méditation. Si la tête tourne, reviens à un souffle normal.",
    src:"Balban et al., Cell Reports Medicine, 2023", steps:breath([["in",3,"Inspire par le nez"],["in2",1,"Encore un peu, pour remplir"],["out",6,"Expire lentement par la bouche"]], 30)},
  {id:"scan", name:"Scan du corps", dur:"3 min", why:"Parcourir le corps sans rien changer, juste noter. L’écoute du corps se travaille comme un geste technique.",
    src:"d’après le programme MBSR de Jon Kabat-Zinn", steps:[["txt",30,"Allonge-toi, ou reste assis si tu préfères. Ferme les yeux, laisse le sol te porter."],["txt",30,"Les pieds, puis les jambes. Remarque ce qui est là, sans le changer."],["txt",40,"Le bassin, le bas du dos, le ventre qui monte et descend."],["txt",40,"Les épaules, les coudes, les poignets, les doigts : tes appuis de tous les jours."],["txt",30,"La nuque, la mâchoire, le front. Desserre ce qui serre."],["txt",10,"Le corps entier. Trouve un mot pour le dire."]]},
  {id:"nadi", name:"Respiration alternée", dur:"4 min", why:"Nāḍī śodhana, une respiration lente de la tradition du hatha yoga. Les études sur ses effets restent modestes : vois-la comme une façon de ralentir. Pas de rétention, et arrête si le nez est bouché.",
    src:"tradition du hatha yoga", steps:breath([["in",4,"Ferme à droite, inspire à gauche"],["out",6,"Ferme à gauche, expire à droite"],["in",4,"Inspire à droite"],["out",6,"Ferme à droite, expire à gauche"]], 12)},
  {id:"ecoute", name:"Écoute après la séance", dur:"4 min", why:"Un bilan de 0 à 10 sur tes articulations clés. Une gêne légère qui passe n’est pas un ordre d’arrêter ; une douleur vive, articulaire, ou pire le lendemain en est un.",
    src:"d’après le modèle de surveillance de la douleur (Silbernagel et al., 2007)", steps:[["txt",25,"Allonge-toi, et prends trois longues respirations."],["txt",45,"Les poignets. Donne une note à la gêne, de 0 à 10."],["txt",40,"Les coudes, puis les épaules. Une note pour chacun."],["txt",35,"Le bas du dos. Une note."],["txt",45,"Jusqu’à 2 : feu vert. De 3 à 5 : acceptable, si ça s’est calmé demain matin. Au-delà de 5, ou douleur vive : allège, et consulte si ça dure."],["txt",30,"Ta série la plus dure : combien de répétitions avais-tu encore en réserve ?"],["txt",20,"Un mot pour cette séance. Et merci à ce corps qui a travaillé."]], journal:true},
];
const QUESTIONS_REPOS = ["Comment ton corps se sent-il un jour sans entraînement ?", "Qu’est-ce qui t’a fait du bien aujourd’hui, en dehors du tapis ?", "À qui pourrais-tu transmettre quelque chose cette semaine ?",
  "Qu’as-tu remarqué de ta respiration aujourd’hui ?", "Quelle tension gardes-tu sans t’en rendre compte ?", "Qu’est-ce que la patience t’a appris ce mois-ci ?", "Quel moment simple as-tu savouré aujourd’hui ?"];
const QUESTIONS = ["Qu’est-ce que ton corps t’a dit aujourd’hui, que tu n’avais pas entendu hier ?", "Où as-tu forcé plus que nécessaire ?", "Quelle consigne t’a le plus aidé aujourd’hui ?", "Qu’as-tu ressenti au moment de la chute ?",
  "Qu’est-ce qui dépendait de toi dans cette séance, et qu’est-ce qui n’en dépendait pas ?", "Quel petit progrès mérite d’être remarqué ?",
  "Quelle gêne vas-tu surveiller demain ?", "Pourquoi ce chemin compte-t-il pour toi, au-delà de la figure ?"];
// Transmettre : missions débloquées par rang (index dans RANKS) ; validées sur ta parole, avec une réflexion écrite
const MISSIONS = [
  {id:"tm_mots", r:0, name:"Poser les mots", act:"Décris à voix haute ton équilibre poitrine face au mur en 3 consignes, et enregistre-toi.", q:"Quelle consigne un débutant comprendrait-il mal ?"},
  {id:"tm_oeil", r:1, name:"Œil de coach", act:"Regarde une vidéo d’équilibre et repère deux erreurs : bassin cassé, épaules fermées, coudes pliés…", q:"Comment as-tu distingué la cause de la conséquence ?"},
  {id:"tm_psc", r:1, name:"Les premiers secours", act:"Inscris-toi au PSC (prévention et secours civiques, une journée) et passe-le. C’est le prérequis de toutes les formations d’éducateur.", q:"Quel geste de secours serait le plus probable dans un cours de gym ?"},
  {id:"tm_demo", r:2, name:"Démonstration muette", act:"Montre une chandelle ou un pont sans parler, filmé de face puis de profil.", q:"Quel angle montre le mieux le point clé, et pourquoi ?"},
  {id:"tm_niv", r:2, name:"Trois niveaux", act:"Écris 3 régressions et 2 progressions pour la tuck planche.", q:"À quel signe sais-tu qu’un élève peut passer au niveau suivant ?"},
  {id:"tm_echauf", r:3, name:"Échauffement type", act:"Construis un échauffement de 12 minutes (poignets, épaules, gainage) et teste-le sur toi.", q:"Qu’est-ce qui a le mieux préparé ton premier exercice ?"},
  {id:"tm_ci", r:4, name:"Contre-indications", act:"Liste les précautions à prendre dans 5 situations : tension artérielle et inversions, grossesse, poignets fragiles, nuque, reprise après blessure.", q:"Que demanderais-tu à un élève avant son premier cours ?"},
  {id:"tm_cours", r:5, name:"Le cours de 45 minutes", act:"Écris un cours pour débutants : 10 minutes d’échauffement, 25 de cœur de séance, 10 de retour au calme.", q:"À quel moment ton cours risque-t-il de déborder ?"},
  {id:"tm_parade", r:6, name:"La parade", act:"Apprends les parades (équilibre, roulade arrière, ATR) avec un entraîneur diplômé, en club. Jamais seul.", q:"Où étaient tes mains, et pourquoi là ?"},
  {id:"tm_souffle", r:3, name:"Guider une respiration", act:"Guide à voix haute la respiration lente pour quelqu’un : 3 minutes, une voix posée, des silences.", q:"Où as-tu eu envie de remplir le silence ?"},
  {id:"tm_toucher", r:5, name:"Demander avant de toucher", act:"Avant d’aider un élève avec la main, demande-lui toujours son accord, et propose une consigne verbale d’abord.", q:"Comment formuler la question pour qu’on puisse dire non sans gêne ?"},
  {id:"tm_eleve", r:6, needs:["tm_parade","tm_ci"], name:"Premier élève", act:"Donne ton cours de 45 minutes, gratuitement, à un ami, et demande-lui un retour honnête.", q:"Quelle consigne as-tu dû reformuler en direct ?"},
  {id:"tm_cercle", r:7, name:"Ouvrir et fermer un cours", act:"Ouvre ton cours par une intention simple et ferme-le par un temps calme : une respiration, un mot de chacun.", q:"Qu’a changé ce temps d’ouverture dans l’attention du groupe ?"},
  {id:"tm_groupe", r:7, name:"Un petit groupe", act:"Anime une séance pour trois personnes ou plus, de niveaux différents.", q:"Comment as-tu occupé les plus rapides pendant que tu aidais les autres ?"},
  {id:"tm_club", r:8, name:"Bénévole en club", act:"Aide un entraîneur en club, ou passe le diplôme fédéral d’animateur FFGym (encadrement bénévole).", q:"Qu’as-tu appris de l’entraîneur titulaire ?"},
  {id:"tm_voie", r:9, name:"Choisir sa formation", act:"Compare deux voies : BPJEPS Activités gymniques, formation de yoga de 200 heures, ou CQP ALS (gym d’entretien seulement). Coût, financement CPF, dates des tests.", q:"Laquelle correspond à ton projet dans deux ans, et pourquoi ?"},
  {id:"tm_pro", r:10, name:"Prêt à enseigner", act:"Prépare ton dossier : diplôme, déclaration d’éducateur sportif (carte professionnelle), assurance responsabilité civile professionnelle, tarifs.", q:"Que te manque-t-il encore pour être en règle ?"},
];
const ROUTE = [
  ["Les bases", "PSC (une journée) et certificat médical : demandés à l’entrée de toutes les formations."],
  ["Encadrer bénévolement", "En club FFGym, avec les diplômes fédéraux d’animateur puis de moniteur. Ils permettent d’encadrer bénévolement, pas d’être payé."],
  ["Le diplôme pour être payé en gym", "BPJEPS mention Activités gymniques (souvent 10 à 18 mois en alternance, avec un test technique d’entrée), ou CQP ALS, plus court mais limité à la gym d’entretien : il ne couvre ni l’acrobatie ni les équilibres. La VAE est possible pour un ancien gymnaste."],
  ["Le yoga", "Pas de diplôme d’État : des formations de 200 heures (environ 1 900 à 3 200 €) ou des cursus fédéraux de 3 à 4 ans. Certaines sont finançables par le CPF quand elles mènent à une certification enregistrée."],
  ["Se déclarer", "Déclaration d’éducateur sportif (carte professionnelle, valable 5 ans), assurance responsabilité civile professionnelle, statut (par exemple micro-entreprise)."],
  ["Continuer d’apprendre", "DEJEPS pour entraîner, formations avancées de yoga, et toujours des élèves pour t’apprendre."],
];
// ---------- Rendu de l’onglet ----------
const vForce = () => { const ta = document.querySelector("#voie .vta"), keep = ta ? ta.value : ""; if (ta) { ta.value = ""; ta.blur(); } renderVoie(); const nt = document.querySelector("#voie .vta"); if (nt && keep) nt.value = keep; };   // redessine sans perdre la note en cours
let vpK = 0;
function renderVoie(){
  const box = $("voie"); if (!box) return;
  { const ta = box.querySelector(".vta"); if (ta && (ta.value.trim() || document.activeElement === ta)) return; }   // une note en cours d’écriture ne s’efface pas
  box.textContent = "";
  const Z = stats(), ri = Math.max(0, RANKS.indexOf(Z.rank));
  // la pensée du jour
  { const [c, src, tap] = penseeDuJour(vpK), b = el("div","block vpens"); b.append(el("div","lab","Pensée du jour"), el("blockquote",null,"« " + c + " »"), el("div","mut vsrc", src), el("p","vtap","Sur le tapis : " + lc1(tap)));
    const n = el("button","btn line","Une autre pensée"); n.onclick = () => { vpK++; vForce(); }; b.append(n); box.append(b); }
  // respirer et écouter
  { const b = el("div","block"); b.append(el("h2",null,"Respirer, écouter"), el("p","mut","Des pratiques courtes, à faire avant, après, ou à la place d’une séance."));
    const g = el("div","vprl"); PRATIQUES.forEach(p => { const x = el("button","vpr"); x.append(el("b",null,p.name), el("span","mut",p.dur)); x.onclick = () => vpOpen(p); g.append(x); }); b.append(g); box.append(b); }
  // le carnet
  { const trained = S.log.some(l => dayKey(l.t) === dayKey(Date.now())), QS = trained ? QUESTIONS : QUESTIONS_REPOS, q = QS[dayN() % QS.length], b = el("div","block"); b.append(el("h2",null,"Carnet"), el("p",null,q));
    const ta = el("textarea","vta"); ta.rows = 3; ta.placeholder = "Quelques mots suffisent."; ta.setAttribute("aria-label", q);
    const ok = el("button","btn","Garder dans le carnet"); ok.onclick = () => { const a = ta.value.trim(); if (!a) return; (S.jr || (S.jr = [])).push({t:Date.now(), q, a}); save(); ta.value = ""; ta.blur(); toast("Gardé dans ton carnet."); renderVoie(); };
    b.append(ta, ok);
    if ((S.jr || []).length || Object.keys(S.tm || {}).length) { const rl = el("button","btn line vre","Relire tout le carnet"); rl.onclick = relire; b.append(rl); }
    (S.jr || []).slice(-3).reverse().forEach(e => { const d = el("div","vjr"); d.append(el("div","mut", new Date(e.t).toLocaleDateString("fr-FR",{day:"numeric",month:"long"}) + ", " + lc1(e.q)), el("p",null,e.a));
      const x = el("button","vdel","Effacer"); x.setAttribute("aria-label","Effacer cette note"); x.onclick = () => { S.jr = S.jr.filter(o => o !== e); save(); vForce(); }; d.append(x); b.append(d); });
    box.append(b); }
  // transmettre
  { const b = el("div","block"), dn = Object.keys(S.tm || {}).length; b.append(el("h2",null,"Transmettre"), el("p","mut","Un jour, enseigner le yoga et la gym. Les missions s’ouvrent avec ton rang : " + dn + " sur " + MISSIONS.length + " faites."));
    b.append(el("p","vlaw","En France, être payé pour enseigner la gym ou l’acrobatie demande un diplôme reconnu (BPJEPS, CQP…) et la carte professionnelle d’éducateur sportif. Le yoga n’a pas de diplôme d’État."));
    let lkN = 0;
    MISSIONS.slice().sort((a, b) => a.r - b.r).forEach(m => { const need = (m.needs || []).filter(n => !(S.tm || {})[n]), on = ri >= m.r && !need.length, done = (S.tm || {})[m.id]; if (!on && !done && ++lkN > 2) return;   /* les suivantes restent cachées : pas de longue liste grise */
      const x = el("button","vmis" + (done ? " done" : on ? "" : " lk"));
      x.append(el("b",null,m.name), el("span","mut", done ? "Faite" : on ? "Ouverte" : ri >= m.r ? "Après « " + MISSIONS.find(o => o.id === need[0]).name + " »" : "Au rang " + RANKS[m.r])); x.onclick = () => tmOpen(m, on); b.append(x); });
    if (lkN > 2) b.append(el("p","mut", (lkN - 2) + " autres missions t’attendent plus loin."));
    b.append(el("h3",null,"La route, en France"));
    const ol = el("ol","vroute"); ROUTE.forEach(([t, d]) => { const li = el("li"); li.append(el("b",null,t), el("span",null,d)); ol.append(li); }); b.append(ol);
    b.append(el("p","mut vsrc","Sources : Code du sport (articles L212-1 et L212-11), FFGym, Yoga Alliance. Les durées et les coûts sont des ordres de grandeur, à vérifier auprès des organismes."));
    box.append(b); box.append(coursBlock()); }
}
function tmOpen(m, on){
  const box = $("qkBody"), done = (S.tm || {})[m.id]; box.textContent = "";
  const hd = el("div","sqhd"); hd.innerHTML = ICON.flag || ""; hd.append(el("div","lab","Transmettre"), el("h2",null,m.name)); box.append(hd);
  const ri = Math.max(0, RANKS.indexOf(stats().rank)), need = (m.needs || []).filter(n => !(S.tm || {})[n]).map(n => "« " + MISSIONS.find(o => o.id === n).name + " »");
  const blk = el("div","qkblock"); blk.append(el("b",null, on ? "La mission" : ri >= m.r && need.length ? "Après " + need.join(" et ") : "Au rang " + RANKS[m.r]), el("p",null, on ? m.act : (ri >= m.r && need.length ? "Elle s’ouvrira quand ces missions seront faites. " : "Elle s’ouvrira à ce rang. ") + "En attendant : " + lc1(m.act))); box.append(blk);
  { const le = tmLecon(m); if (le) box.append(le); }
  if (on) { const q = el("p","vq",m.q), ta = el("textarea","vta"); ta.rows = 4; ta.value = done ? done.a : ""; ta.placeholder = "Deux ou trois phrases : ce que tu as fait, ce que tu en retiens."; ta.setAttribute("aria-label", m.q);
    const ok = el("button","btn", done ? "Mettre à jour" : "Mission faite"); ok.onclick = () => { const a = ta.value.trim(); if (a.length < 40) { toast("Écris au moins deux phrases : c’est là que tu apprends."); return; } (S.tm || (S.tm = {}))[m.id] = {t:Date.now(), a}; save(); $("qkDlg").close(); vForce(); toast("Mission « " + m.name + " » faite."); };
    box.append(q, ta, ok);
    if (done) { const u = el("button","btn line vre","Retirer"); u.onclick = () => { delete S.tm[m.id]; save(); $("qkDlg").close(); vForce(); }; box.append(u); } }
  $("qkT").textContent = m.name; const qd = $("qkDlg"); qd.classList.add("sqd"); if (!qd.open) qd.showModal(); qd.scrollTop = 0; qd.onscroll = null;
}
// ---------- Lecteur de pratique guidée ----------
let vp = null;
function vpOpen(p, alt){
  const steps = p.alt ? p.alt[alt || 0][1] : p.steps, tot = steps.reduce((a, s) => a + s[1], 0), d = $("vpDlg");
  $("vpT").textContent = p.name; $("vpWhy").textContent = p.why; $("vpSrc").textContent = "Source : " + p.src;
  const alts = $("vpAlt"); alts.textContent = ""; alts.hidden = !p.alt; if (p.alt) p.alt.forEach(([lab], k) => { const b = el("button", (alt || 0) === k ? "on" : "", lab); b.setAttribute("aria-pressed", (alt || 0) === k); b.onclick = () => { vpStop(); vpOpen(p, k); }; alts.append(b); });
  clearTimeout(vpOpen.jt); vp = {p, alt:alt || 0, steps, tot, t:0, i:-1, run:false, last:0}; $("vpGo").textContent = "Commencer"; $("vpTxt").textContent = steps[0][0] === "txt" ? "Installe-toi confortablement." : "Assieds-toi, le dos long.";
  $("vpLeft").textContent = p.dur; vpRing(null, 0); if (!d.open) d.showModal();
}
function vpRing(ph, sec){ const r = $("vpRing"); r.style.transitionDuration = sec + "s"; r.dataset.ph = ph || ""; }
function vpTick(){
  if (!vp || !vp.run) return; const now = Date.now(); vp.t += (now - vp.last) / 1000; vp.last = now;
  let acc = 0, i = 0; while (i < vp.steps.length && acc + vp.steps[i][1] <= vp.t) { acc += vp.steps[i][1]; i++; }
  if (i >= vp.steps.length) { vpStop(); vp.i = i; $("vpGo").textContent = "Recommencer"; $("vpTxt").textContent = "C’est fini. Prends un instant avant de te relever."; $("vpLeft").textContent = ""; say("C’est fini.", true); vpRing(null, 1);
    if (vp.p.journal) ecouteForm(); return; }
  if (i !== vp.i) { vp.i = i; const [ph, sec, txt] = vp.steps[i]; $("vpTxt").textContent = txt; vpRing(ph, sec);
    // la voix guide les premiers cycles, puis le cercle prend le relais : un souffle ne se compte pas à voix haute pendant 5 minutes
    const cyc = vp.steps.findIndex((s, k) => k > 0 && s[2] === vp.steps[0][2]), lim = cyc > 0 ? cyc * 3 : Infinity;   // trois cycles guidés
    if (ph === "txt" || i < lim) say(txt, true); else if (i === lim) say("Continue à ce rythme, avec le cercle.", true); }
  const left = Math.max(0, Math.ceil(vp.tot - vp.t)); $("vpLeft").textContent = Math.floor(left / 60) + " min " + String(left % 60).padStart(2, "0") + " s";
}
function vpStop(){ if (vp) vp.run = false; clearInterval(vpTick.h); if (vp && vp.i < vp.steps.length) $("vpGo").textContent = "Reprendre"; }
$("vpGo").onclick = () => { if (!vp) return; if (vp.run) { vpStop(); return; } if (vp.i >= vp.steps.length) { vpOpen(vp.p, vp.alt); } if (vp.t === 0) say(vp.p.steps && vp.p.steps[0][0] === "txt" ? "On commence." : "On commence. Suis le cercle.", true); vp.run = true; vp.last = Date.now(); $("vpGo").textContent = "Pause"; clearInterval(vpTick.h); vpTick.h = setInterval(vpTick, 200); vpTick(); };
$("vpX").onclick = () => $("vpDlg").close();
$("vpDlg").addEventListener("close", () => { clearTimeout(vpOpen.jt); vpStop(); try { speechSynthesis.cancel(); } catch(e){} });
$("ecGo").onclick = () => { S.ecoute = 0; save(); $("ecoute").hidden = true; vpOpen(PRATIQUES.find(p => p.id === "ecoute")); };
$("ecNo").onclick = () => { S.ecoute = 0; save(); $("ecoute").hidden = true; };
// ---------- Transmettre : un mini-cours par mission, et des vidéos à chercher ----------
// les vidéos sont des recherches YouTube (jamais un lien qui pourrait disparaître) ; à toi de choisir la source qui te parle
const LECONS = {
  tm_mots:{c:["Une consigne = une action du corps, pas une sensation : « pousse le sol » plutôt que « sois léger ».", "Trois consignes au plus par essai : au-delà, l’élève n’en garde aucune.", "Dis ce qu’il faut faire, pas ce qu’il faut éviter : « bras tendus » plutôt que « ne plie pas »."], v:["en:handstand cues coaching", "consignes équilibre sur les mains"]},
  tm_oeil:{c:["Regarde d’abord la base (mains, poignets), puis remonte : épaules, bassin, jambes.", "Cherche la cause, pas le symptôme : un dos creusé vient souvent d’épaules fermées.", "Filme de profil : l’alignement mains, épaules, hanches se juge sur le côté."], v:["en:handstand common mistakes", "erreurs équilibre sur les mains"]},
  tm_psc:{c:["Le PSC se passe en une journée auprès d’organismes agréés (Croix-Rouge, protection civile, pompiers).", "Il est demandé à l’entrée des formations d’éducateur sportif.", "En salle, les risques probables : chute sur la tête ou le poignet, malaise, entorse."], v:["PSC premiers secours formation"]},
  tm_demo:{c:["Une démonstration se regarde avant de s’écouter : montre en silence, puis nomme un seul point.", "Choisis l’angle qui montre le point clé : de profil pour l’alignement, de face pour la symétrie.", "Montre lentement, une fois en entier, puis la partie difficile seule."], v:["en:how to demonstrate exercise teaching"]},
  tm_niv:{c:["Une régression garde le geste et retire de la charge : pieds au sol, élastique, bras de levier plus court.", "Une progression ajoute une seule variable à la fois : durée, levier ou appui.", "Le signe pour passer au niveau suivant : la cible tenue propre, deux séances de suite."], v:["en:tuck planche progression regression"]},
  tm_echauf:{c:["Du général au spécifique : réchauffer, mobiliser, puis préparer les articulations du jour.", "Pour l’appui sur les mains : poignets, épaules, gainage, dans cet ordre.", "Un bon échauffement finit par une version facile de l’exercice principal."], v:["en:wrist warm up handstand", "échauffement poignets épaules"]},
  tm_ci:{c:["Inversions (tête en bas) à éviter sans avis médical : hypertension non contrôlée, glaucome, décollement de rétine.", "Grossesse : pas de nouvelle figure risquée de chute, et des adaptations à partir du deuxième trimestre, avec avis médical.", "Poignets fragiles : appuis sur poings, parallettes ou avant-bras. Nuque fragile : aucune charge sur la tête, ni chandelle ni charrue."], v:["en:yoga contraindications inversions"]},
  tm_cours:{c:["Une structure simple : échauffement, cœur de séance, retour au calme.", "Le cœur de séance vise un seul objectif, décliné en 2 ou 3 niveaux.", "Prévois une marge de 5 minutes : les transitions prennent toujours plus de temps que prévu."], v:["en:how to plan a yoga class", "plan de cours gym débutant"]},
  tm_parade:{c:["La parade s’apprend avec un entraîneur diplômé, en club, jamais seul ni par vidéo.", "Principe : accompagner le bassin et protéger la tête, sans porter tout le poids.", "Le pareur se place du côté de la chute probable, appuis solides, genoux fléchis."], v:["parade gymnastique ATR FFGym"]},
  tm_souffle:{c:["Annonce la durée et la posture, puis laisse la voix ralentir avec le souffle.", "Donne le rythme deux ou trois fois, puis tais-toi : le silence fait partie du guidage.", "Prévois une sortie : « si la tête tourne, reviens à ton souffle normal »."], v:["guider une respiration yoga cours"]},
  tm_toucher:{c:["Le toucher se demande à chaque fois, et la réponse peut changer d’un jour à l’autre.", "Propose d’abord une consigne verbale ou une démonstration.", "Une carte ou un geste convenu permet de refuser sans avoir à parler devant le groupe."], v:["en:consent based touch yoga teaching"]},
  tm_cercle:{c:["Une intention tient en une phrase et ne se commente pas.", "Le retour au calme est une partie du cours, pas ce qui reste quand le temps manque.", "Un mot de chacun à la fin : court, sans obligation."], v:["ouverture et clôture cours de yoga"]},
  tm_eleve:{c:["Commence par demander ce que ton élève ressent ou redoute.", "Observe plus que tu ne parles : une consigne, un essai, un retour.", "À la fin, demande une seule chose à améliorer, et note-la."], v:["en:first yoga class teaching tips"]},
  tm_groupe:{c:["Donne la même figure en 3 niveaux : chacun travaille au sien, en même temps.", "Place-toi pour voir tout le monde : jamais dos au groupe.", "Prépare un défi pour les plus rapides pendant que tu aides les autres."], v:["en:teaching mixed level class"]},
  tm_club:{c:["En club, le bénévole encadre souvent aux côtés d’un entraîneur diplômé ; avec le diplôme d’animateur fédéral, il peut mener des séances bénévolement.", "Les diplômes fédéraux FFGym (animateur, puis moniteur) se passent par le club et le comité régional.", "Observe la gestion du temps, du matériel et de la sécurité : c’est le cœur du métier."], v:["FFGym animateur fédéral formation"]},
  tm_voie:{c:["Pour être payé en gym ou en acrobatie : BPJEPS Éducateur sportif, mention Activités gymniques, avec un test technique d’entrée. Le DEJEPS vient ensuite, pour entraîner.", "Pour le yoga : pas de diplôme d’État ; formations de 200 heures ou cursus fédéraux de plusieurs années.", "Vérifie le financement CPF : seulement si la formation mène à une certification enregistrée (RNCP ou répertoire spécifique)."], v:["BPJEPS activités gymniques témoignage", "formation professeur de yoga 200h"]},
  tm_pro:{c:["La carte professionnelle s’obtient par la déclaration d’éducateur sportif, sur le portail officiel, une fois le diplôme en poche.", "Une assurance responsabilité civile professionnelle te couvre pendant les cours.", "Fixe tes tarifs en comparant les cours de ta ville, et choisis un statut (par exemple micro-entreprise)."], v:["déclaration éducateur sportif carte professionnelle"]},
};
const ytSearch = q => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
function tmLecon(m){   // le mini-cours, affiché dans la fiche de la mission
  const L = LECONS[m.id]; if (!L) return null; const w = el("div","qkinfo"), sc = el("section"), ul = el("ul"); L.c.forEach(t => ul.append(el("li",null,t)));
  sc.append(el("h3",null,"Le mini-cours"), ul); w.append(sc);
  const sv = el("section"), vl = el("div","vvid"); L.v.forEach(v => { const en = v.startsWith("en:"), q = en ? v.slice(3) : v; vl.append(extLink(ytSearch(q), "Vidéos : « " + q + " »" + (en ? " (en anglais)" : ""))); });   /* « en: » : recherche en anglais */ sv.append(el("h3",null,"Voir faire"), vl, el("p","mut vsrc","Recherches YouTube : choisis des professionnels diplômés, et garde un œil critique.")); w.append(sv);
  return w;
}
// ---------- Mes cours : l’atelier du futur prof ----------
const NIVEAUX = ["Débutants", "Intermédiaires", "Avancés", "Tous niveaux"];
const PARTS = [["ech","Échauffement"],["coeur","Cœur de séance"],["calme","Retour au calme"]];
let qkGuard = null;   // atelier ouvert avec des changements : on demande avant de fermer
const MODELE = {title:"Équilibre sur les mains, débutants", pub:"Débutants", dur:45,
  ech:"Cercles de poignets et appuis sur les doigts, 3 min\nChat-vache, 2 min\nChien tête en bas actif, 3 × 20 s, 2 min\nGainage creux, 3 × 20 s, 3 min",
  coeur:"Pieds au mur en L, 3 × 20 s, 6 min\nPoitrine face au mur, 3 × 20 s, 7 min\nSortie en roue, 5 essais de chaque côté, 7 min\nPour les plus avancés : décollages du mur, 5 min",
  calme:"Posture de l’enfant, 2 min\nÉtirement des poignets et des épaules, 3 min\nRespiration lente, 5 min", notes:"Un seul objectif : un alignement mains, épaules, hanches. Trois consignes au plus.", vids:[]};
const coursTxt = c => [c.title + " (" + c.pub + ", " + c.dur + " min)", c.theme ? "Thème : " + c.theme : "", ...PARTS.map(([k, n]) => c[k] ? n + " :\n" + c[k] : ""), c.notes ? "Notes : " + c.notes : "", ...(c.vids || []).map(v => v.label + " : " + v.url)].filter(Boolean).join("\n\n");
function coursEdit(c0){
  const box = $("qkBody"), c = Object.assign({id:"c" + Date.now(), title:"", pub:NIVEAUX[0], dur:45, ech:"", coeur:"", calme:"", notes:"", vids:[]}, JSON.parse(JSON.stringify(c0 || {}))), isNew = !c0 || !c0.id; if (!c.id) c.id = "c" + Date.now();   // un modèle repart avec son propre identifiant
  box.textContent = ""; box.append(el("span","cedit"));   // repère : l’atelier est ouvert (garde-fou à la fermeture)
  const hd = el("div","sqhd"); hd.innerHTML = ICON.flag || ""; hd.append(el("div","lab","Mes cours"), el("h2",null, isNew ? "Nouveau cours" : "Modifier le cours")); box.append(hd);
  const fld = (lab, node) => { const f = el("label","cfld"); f.append(el("span","lab",lab), node); box.append(f); return node; };
  const ti = fld("Titre", el("input")); ti.value = c.title; ti.placeholder = "Par exemple : équilibre, débutants";
  const th = fld("Thème ou intention", el("input")); th.value = c.theme || ""; th.placeholder = "Par exemple : la patience";
  { const ps = el("select","cadd"); ps.setAttribute("aria-label","Prendre une pensée comme thème"); ps.append(el("option",null,"+ Une pensée de la Voie comme thème")); PENSEES.forEach((p, k) => { const o = el("option",null,p[0]); o.value = k; ps.append(o); });
    ps.onchange = () => { const p = PENSEES[+ps.value]; if (p) th.value = p[0] + " (" + p[1] + ")"; ps.selectedIndex = 0; }; box.append(ps); }
  const row = el("div","crow"); box.append(row);
  const pu = el("select"); NIVEAUX.forEach(n => { const o = el("option",null,n); o.value = n; pu.append(o); }); pu.value = c.pub;
  const du = el("select"); [30, 45, 60, 75, 90].forEach(n => { const o = el("option",null,n + " min"); o.value = n; du.append(o); }); du.value = String(c.dur);
  { const a = el("label","cfld"); a.append(el("span","lab","Pour qui"), pu); const b = el("label","cfld"); b.append(el("span","lab","Durée"), du); row.append(a, b); }
  const tas = {}; PARTS.forEach(([k, n]) => { const t = el("textarea"); t.rows = k === "coeur" ? 6 : 4; t.value = c[k]; t.placeholder = "Un exercice par ligne, avec sa durée ou ses répétitions."; tas[k] = fld(n, t);
    if (k === "coeur") addFig(); });
  // ajouter une figure de l’app au cœur de séance, juste sous lui
  function addFig(){ const s = el("select","cadd"); s.setAttribute("aria-label","Ajouter une figure de l’app au cœur de séance"); s.append(el("option",null,"+ Une figure de l’app au cœur de séance")); Object.values(MS).filter(m => !/^ul_/.test(m.id)).forEach(m => { const o = el("option",null,m.name); o.value = m.id; s.append(o); });
    s.onchange = () => { const m = MS[s.value]; if (m) { tas.coeur.value = (tas.coeur.value.trim() ? tas.coeur.value.trim() + "\n" : "") + m.name + (m.target ? ", " + goalTxt(m) : ""); } s.selectedIndex = 0; }; box.append(s); }
  const no = fld("Notes pour toi", el("textarea")); no.rows = 3; no.value = c.notes; no.placeholder = "L’objectif du cours, les consignes clés, les précautions.";
  // vidéos : des liens (YouTube, Drive…), pas de fichiers dans l’app
  box.append(el("h3","ch3","Vidéos du cours"));
  const vl = el("div","cvids"); box.append(vl);
  const drawV = () => { vl.textContent = ""; c.vids.forEach((v, k) => { const r = el("div","cvid"); r.append(/^https:\/\/[^/\s]/.test(v.url) ? extLink(v.url, v.label) : el("span","mut", v.label)); const x = el("button","vdel","Retirer"); x.setAttribute("aria-label","Retirer la vidéo " + v.label); x.onclick = () => { c.vids.splice(k, 1); drawV(); }; r.append(x); vl.append(r); }); };
  drawV();
  { const r = el("div","crow"), lb = el("input"), ur = el("input"), add = el("button","btn line","Ajouter"); lb.placeholder = "Nom"; ur.placeholder = "Lien https://…"; ur.type = "url"; lb.setAttribute("aria-label","Nom de la vidéo"); ur.setAttribute("aria-label","Lien de la vidéo");
    add.onclick = () => { const u = ur.value.trim(); let ok = false; try { const x = new URL(u); ok = x.protocol === "https:" && !!x.hostname; } catch(e){} if (!ok) { toast("Colle un lien complet qui commence par https://"); return; } c.vids.push({label:lb.value.trim() || "Vidéo", url:u}); lb.value = ur.value = ""; drawV(); };
    r.append(lb, ur); box.append(r, add); }
  box.append(el("p","mut vsrc","Tes vidéos restent là où tu les ranges (YouTube en non répertorié, Google Drive…) : l’app garde seulement le lien."));
  const read = () => { c.theme = th.value.trim(); c.title = ti.value.trim(); c.pub = pu.value; c.dur = +du.value; PARTS.forEach(([k]) => c[k] = tas[k].value.trim()); c.notes = no.value.trim(); };
  const snap = isNew && c0 ? "" : JSON.stringify(c);   // un modèle ou une copie n’existe pas encore : fermer sans enregistrer demande confirmation
  qkGuard = () => { read(); return JSON.stringify(c) === snap || confirm("Fermer sans enregistrer ce cours ?"); };
  const okb = el("button","btn","Enregistrer le cours"); okb.onclick = () => {
    read(); if (!c.title) { toast("Donne un titre à ton cours."); ti.focus(); return; } c.t = Date.now(); qkGuard = null;
    const L = S.cours || (S.cours = []), i = L.findIndex(x => x.id === c.id); if (i >= 0) L[i] = c; else L.push(c); save(); $("qkDlg").close(); vForce(); toast("Cours enregistré."); };
  box.append(okb);
  if (!isNew) { const sh = el("button","btn line vre","Partager le plan"); sh.onclick = async () => { read(); const txt = coursTxt(c); try { if (navigator.share) await navigator.share({title:c.title, text:txt}); else { await navigator.clipboard.writeText(txt); toast("Plan copié."); } } catch(e){ if (e.name !== "AbortError") toast("Partage impossible sur cet appareil."); } }; box.append(sh);
    const dup = el("button","btn line vre","Dupliquer"); dup.onclick = () => { if (!qkGuard()) return; qkGuard = null; read(); coursEdit(Object.assign({}, c, {id:"", title:c.title + " (copie)"})); }; box.append(dup);
    const del = el("button","btn warn vre","Supprimer ce cours"); del.onclick = () => { if (!confirm("Supprimer « " + c.title + " » ?")) return; S.cours = (S.cours || []).filter(x => x.id !== c.id); qkGuard = null; save(); $("qkDlg").close(); vForce(); toast("Cours supprimé."); }; box.append(del); }
  $("qkT").textContent = isNew ? "Nouveau cours" : c.title; const qd = $("qkDlg"); qd.classList.remove("sqd"); if (!qd.open) qd.showModal(); qd.scrollTop = 0; qd.onscroll = null;
}
function coursBlock(){
  const b = el("div","block"), L = S.cours || []; b.append(el("h2",null,"Mes cours"), el("p","mut","Ton atelier de prof : écris tes plans de séance et range les liens de tes vidéos, pour les donner plus tard. Ils restent sur ce téléphone : garde une copie avec Exporter, dans le Profil."));
  L.slice().sort((a, z) => (z.t || 0) - (a.t || 0)).forEach(c => { const x = el("button","vmis"); x.append(el("b",null,c.title), el("span","mut", c.pub + ", " + c.dur + " min" + (c.vids && c.vids.length ? ", " + c.vids.length + " vidéo" + (c.vids.length > 1 ? "s" : "") : ""))); x.onclick = () => coursEdit(c); b.append(x); });
  const row = el("div","btns"), nw = el("button","btn","Nouveau cours"), md = el("button","btn line","Partir d’un modèle"); nw.onclick = () => coursEdit(null); md.onclick = () => coursEdit(Object.assign({}, MODELE, {id:""})); row.append(nw, md); b.append(row);
  return b;
}
// Après l’écoute : les notes de gêne sont gardées et la séance suivante en tient compte
// jusqu’à 2 : rien ; de 3 à 5 : pas de tentatives au maximum pendant 36 h ; au-delà de 5 : traité comme une douleur (repos de la zone)
const ZONES = [["poignet","Poignets"],["coude","Coudes"],["epaule","Épaules"],["dos","Bas du dos"]];
function ecouteForm(){
  const f = el("div","ecf"), val = {}; f.append(el("p","vq","Tes notes de gêne, de 0 à 10"));
  ZONES.forEach(([z, n]) => { const r = el("label","ecr"), v = el("b",null,"0"), inp = el("input"); inp.type = "range"; inp.min = 0; inp.max = 10; inp.value = 0; inp.setAttribute("aria-label", n + ", gêne de 0 à 10");
    inp.oninput = () => { v.textContent = inp.value; val[z] = +inp.value; }; val[z] = 0; r.append(el("span",null,n), inp, v); f.append(r); });
  const ok = el("button","btn","Garder mes notes"); ok.onclick = () => {
    (S.ecl || (S.ecl = [])).push(Object.assign({t:Date.now()}, val)); if (S.ecl.length > 120) S.ecl.shift();
    const mx = Math.max(...Object.values(val)), top = Object.keys(val).find(z => val[z] === mx);
    if (mx > 5) { S.pain = Date.now(); painLog().push({t:S.pain, zone:top === "dos" ? "autre" : top}); if (S.painLog.length > 50) S.painLog.shift(); }
    else if (mx >= 3) S.caution = Date.now();
    save(); f.remove(); $("vpDlg").close(); render();
    toast(mx > 5 ? "Noté : la zone se repose, la séance s’adapte." : mx >= 3 ? "Noté : pas de tentative au maximum pendant un jour et demi." : "Noté : tout va bien. Écris un mot dans ton carnet.");
    showTab("voie"); vForce(); const ta = document.querySelector("#voie .vta"); if (ta) ta.focus(); };
  f.append(ok); const stg = $("vpDlg").querySelector(".vpstage"); stg.after(f); stg.hidden = true; $("vpLeft").hidden = true; $("vpGo").hidden = true;
}
$("vpDlg").addEventListener("close", () => { const f = $("vpDlg").querySelector(".ecf"); if (f) f.remove(); $("vpGo").hidden = false; $("vpLeft").hidden = false; $("vpDlg").querySelector(".vpstage").hidden = false; });
// Relire : tout le carnet, mois par mois, avec les réflexions des missions
function relire(){
  const box = $("qkBody"); box.textContent = ""; const hd = el("div","sqhd"); hd.innerHTML = ICON.flag || ""; hd.append(el("div","lab","Carnet"), el("h2",null,"Relire")); box.append(hd);
  const items = (S.jr || []).map(e => ({t:e.t, q:e.q, a:e.a})).concat(Object.entries(S.tm || {}).map(([id, v]) => { const m = MISSIONS.find(x => x.id === id); return {t:v.t, q:m ? "Mission « " + m.name + " » : " + lc1(m.q) : "Mission", a:v.a}; })).sort((a, b) => b.t - a.t);
  let mo = ""; items.forEach(e => { const d = new Date(e.t), k = d.toLocaleDateString("fr-FR",{month:"long", year:"numeric"}); if (k !== mo) { mo = k; box.append(el("h3","ch3", k.charAt(0).toUpperCase() + k.slice(1))); }
    const r = el("div","vjr"); r.append(el("div","mut", d.toLocaleDateString("fr-FR",{day:"numeric", month:"long"}) + ", " + lc1(e.q)), el("p",null,e.a)); box.append(r); });
  if (!items.length) box.append(el("p","mut","Ton carnet est encore vide."));
  $("qkT").textContent = "Relire le carnet"; const qd = $("qkDlg"); qd.classList.remove("sqd"); if (!qd.open) qd.showModal(); qd.scrollTop = 0; qd.onscroll = null;
}
