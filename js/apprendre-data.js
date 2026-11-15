// Apprendre : le contenu des formations, voie par voie. Chaque leçon tient en 1 à 5 minutes :
// ["c", titre, texte] une carte (une idée, 35 mots au plus) · ["q", question, [choix], bonne réponse (index), pourquoi] · ["p", pratique] guidée
// Une pratique : {name, dur, why, src, steps:[["txt", secondes, consigne] ou ["in"/"out", secondes, consigne]]}, ou l’id d’une pratique de la Voie (PRATIQUES).
// Les livres reçus plus tard s’ajoutent ici, en leçons du même format.
"use strict";
const tx = (...a) => a.map(([s, t]) => ["txt", s, t]);
const LEARN = [
 {cat:"Le yoga", voies:[
  {id:"membres", name:"Les 8 membres", sub:"La carte du yoga de Patañjali", ic:"tree", units:[
   {name:"La carte", lessons:[
    {id:"m1", name:"Le yoga en une phrase", steps:[
     ["c","Un texte fondateur","Les Yoga Sūtra de Patañjali, compilés il y a 1 600 à 2 000 ans : 195 ou 196 aphorismes selon les éditions. Le deuxième résume tout : le yoga, l’arrêt des agitations du mental."],
     ["c","Huit membres","Aṣṭāṅga : « huit membres ». Des étapes, mais aussi huit branches d’un même arbre, qui se nourrissent entre elles."],
     ["q","Que veut dire aṣṭāṅga ?",["Huit membres","Huit postures","Huit souffles"],0,"Aṣṭa = huit, aṅga = membre."],
     ["q","Selon Patañjali, le yoga, c’est d’abord…",["Apaiser les agitations du mental","Unir le corps et le souffle","Maîtriser les postures avancées"],0,"Sūtra I.2 : citta-vṛtti-nirodhaḥ."],
     ["p",{name:"Six souffles lents", dur:"1 min", why:"Ralentir le souffle, c’est déjà ralentir le mental. La version longue est dans la Voie.", src:"respiration lente, vers 6 souffles par minute", steps:breath([["in",4,"Inspire par le nez"],["out",6,"Expire lentement"]], 6)}]]},
    {id:"m2", name:"Les yamas : avec les autres", steps:[
     ["c","Cinq attitudes","Ahiṃsā, ne pas nuire. Satya, être vrai. Asteya, ne pas prendre ce qui n’est pas à soi. Brahmacarya, la continence (souvent comprise aujourd’hui comme la juste mesure). Aparigraha, ne pas s’accrocher."],
     ["c","Sur le tapis aussi","Forcer un étirement qui fait mal, c’est manquer d’ahiṃsā envers soi. Dire « j’ai tenu 30 s » quand c’était 20, c’est manquer de satya."],
     ["q","Ahiṃsā veut dire…",["Ne pas nuire","Être patient","Respirer lentement"],0,"Le premier yama, la base de tous les autres."],
     ["q","Ne pas s’accrocher, c’est…",["Aparigraha","Ahiṃsā","Satya"],0,"Aparigraha : ne pas accumuler, ne pas s’agripper à un résultat."],
     ["q","Tu forces sur une douleur au poignet pour finir ta série. Quel yama oublies-tu ?",["Ahiṃsā","Asteya","Brahmacarya"],0,"Ne pas nuire, à soi compris."]]},
    {id:"m3", name:"Les niyamas : avec soi", steps:[
     ["c","Cinq disciplines","Śauca, la propreté. Santoṣa, le contentement. Tapas, l’effort qui transforme. Svādhyāya, l’étude des textes et de soi. Īśvara-praṇidhāna, s’en remettre à plus grand que soi."],
     ["c","Tapas et santoṣa","L’un pousse, l’autre apaise. Tapas : revenir chaque jour au tapis. Santoṣa : être content de la séance d’aujourd’hui, même imparfaite."],
     ["q","Revenir chaque jour, même sans envie, c’est…",["Tapas","Santoṣa","Śauca"],0,"Tapas : la chaleur de l’effort régulier."],
     ["q","Svādhyāya, c’est…",["L’étude des textes et de soi","La purification du corps","Le contentement"],0,"Lire, observer, tenir son carnet : la Voie en est pleine."],
     ["p",{name:"Une minute de contentement", dur:"1 min", why:"Santoṣa se pratique : remarquer ce qui va bien, sans rien ajouter.", src:"inspiré des niyamas", steps:tx([20,"Assieds-toi, ferme les yeux."],[20,"Pense à une chose de ta journée qui s’est bien passée."],[20,"Reste avec elle, sans chercher plus."])}]]}]},
   {name:"Vers l’intérieur", lessons:[
    {id:"m4", name:"Āsana et prāṇāyāma", steps:[
     ["c","Stable et confortable","Patañjali ne décrit aucune posture. Il en donne une seule règle : sthira sukham āsanam, la posture est stable et confortable."],
     ["c","Le souffle","Prāṇāyāma : étendre le souffle. Ralentir la respiration, c’est déjà ralentir le mental. Le souffle est le pont entre le corps et l’esprit."],
     ["q","La règle de Patañjali pour la posture ?",["Stable et confortable","Le plus loin possible","Toujours sur les mains"],0,"Sūtra II.46 : sthira sukham āsanam."],
     ["q","Prāṇāyāma veut dire…",["Étendre le souffle","Retenir sa colère","Tenir une posture"],0,"Prāṇa, l’énergie vitale ; āyāma, l’extension."],
     ["p",{name:"Six souffles lents", dur:"1 min", why:"Ralentir le souffle, c’est déjà ralentir le mental. La version longue est dans la Voie.", src:"respiration lente, vers 6 souffles par minute", steps:breath([["in",4,"Inspire par le nez"],["out",6,"Expire lentement"]], 6)}]]},
    {id:"m5", name:"Pratyāhāra et dhāraṇā", steps:[
     ["c","Retirer les sens","Pratyāhāra : ramener l’attention vers l’intérieur, comme une tortue rentre ses pattes. Ce n’est pas fuir le monde, c’est ne plus être tiré par lui."],
     ["c","Concentrer","Dhāraṇā : poser l’attention sur un seul point, le souffle, une flamme, un son. Elle part ? On la ramène, sans se juger. Ce retour, c’est l’exercice."],
     ["q","L’image classique de pratyāhāra ?",["La tortue qui rentre ses pattes","La lampe à l’abri du vent","Le lotus qui sort de la boue"],0,"Bhagavad-Gītā II.58."],
     ["q","Ton attention s’échappe pendant la concentration. C’est…",["Normal : la ramener, c’est l’exercice","Le signe que tu es fatigué","Le signe qu’il faut changer d’objet"],0,"Chaque retour muscle l’attention."],
     ["p",{name:"Un point d’attention", dur:"2 min", why:"Dhāraṇā : un seul objet, et le retour patient quand l’esprit s’en va.", src:"tradition du yoga", steps:tx([20,"Assieds-toi, le dos long."],[40,"Pose l’attention sur l’air qui entre et sort des narines."],[40,"L’esprit part ? Remarque-le, et reviens aux narines."],[20,"Ouvre doucement les yeux."])}]]},
    {id:"m6", name:"Dhyāna et samādhi", steps:[
     ["c","Méditer","Dhyāna : quand la concentration devient continue, sans effort, comme de l’huile versée en un filet régulier. On ne la fabrique pas, on la laisse venir."],
     ["c","S’absorber","Samādhi : l’absorption complète, où l’on s’oublie dans ce que l’on fait. Tu l’as peut-être frôlée dans un équilibre parfait, ces secondes où plus rien ne pense."],
     ["q","Dhāraṇā devient dhyāna quand…",["L’attention devient continue","Les yeux se ferment enfin","Le souffle s’arrête de lui-même"],0,"La concentration qui ne s’interrompt plus."],
     ["q","Les trois derniers membres ensemble s’appellent…",["Saṃyama","Kaivalya","Pratyāhāra"],0,"Saṃyama : dhāraṇā, dhyāna et samādhi réunis (Sūtra III.4)."]]}]}]},
  {id:"asana", name:"Postures", sub:"Āsana, famille par famille", ic:"body", units:[
   {name:"Les familles", lessons:[
    {id:"a1", name:"Debout", steps:[
     ["c","La base","Tāḍāsana, la montagne : pieds ancrés, sommet du crâne vers le ciel. Toutes les postures debout en partent, comme ton équilibre sur les mains part de la ligne droite."],
     ["c","Les guerriers","Vīrabhadrāsana I, II et III : force des jambes, ouverture des hanches, équilibre. Le III, sur une jambe, prépare la ligne de la planche."],
     ["q","Tāḍāsana, c’est…",["La montagne","Le guerrier","La chaise"],0,"Tāḍa : la montagne (ou le palmier, selon les écoles)."],
     ["q","Le guerrier III travaille surtout…",["L’équilibre et la ligne du corps","La souplesse du bas du dos","L’ouverture des hanches assis"],0,"Corps à l’horizontale sur une jambe."],
     ["p",{name:"La montagne", dur:"1 min", why:"Sentir sa ligne debout avant de la retrouver tête en bas.", src:"hatha yoga", steps:tx([15,"Pieds joints ou largeur de hanches, poids réparti."],[15,"Genoux déverrouillés, bassin neutre, côtes basses."],[15,"Épaules détendues, sommet du crâne vers le ciel."],[15,"Respire, et sens la ligne de la tête aux talons."])}]]},
    {id:"a2", name:"Équilibres sur les bras", steps:[
     ["c","Les cousins de ton parcours","Bakāsana, le corbeau. Adho Mukha Vṛkṣāsana, l’arbre tête en bas : ton équilibre sur les mains. Mayūrāsana, le paon, proche de la planche."],
     ["c","Une nuance","En yoga on apprend souvent à garder les épaules basses. Tête en bas, c’est l’inverse : épaules aux oreilles, on pousse le sol. Même mot, autre geste."],
     ["q","L’équilibre sur les mains en yoga s’appelle…",["Adho Mukha Vṛkṣāsana","Adho Mukha Śvānāsana","Ūrdhva Mukha Śvānāsana"],0,"L’arbre, tête en bas."],
     ["q","En équilibre sur les mains, les épaules…",["Montent vers les oreilles","Descendent loin des oreilles","Se relâchent"],0,"On pousse le sol : les épaules s’élèvent."]]},
    {id:"a3", name:"Flexions avant", steps:[
     ["c","Se plier","Paścimottānāsana, la pince assise : l’étirement de tout l’arrière du corps. Uttānāsana, la pince debout. On plie depuis les hanches, le dos reste long."],
     ["c","Sans forcer","La souplesse vient de la répétition calme, pas de la traction. Expire pour descendre, inspire pour allonger."],
     ["q","Dans une flexion avant, on plie surtout…",["Depuis les hanches","Depuis le haut du dos","Depuis les genoux"],0,"Le dos reste long, ce sont les hanches qui basculent."],
     ["q","Pour descendre plus loin, on…",["Expire et relâche","Tire fort avec les bras","Rebondit"],0,"Pas de rebond : le muscle se défend."],
     ["p",{name:"Pince assise douce", dur:"2 min", why:"Paścimottānāsana, sans forcer : le repère de ton pliage en pike.", src:"hatha yoga", steps:tx([20,"Assis jambes tendues, une brique sous les mains si besoin."],[40,"Inspire, allonge le dos. Expire, bascule le bassin vers l’avant."],[40,"Reste là où tu respires encore calmement."],[20,"Remonte lentement, vertèbre par vertèbre."])}]]},
    {id:"a4", name:"Ouvertures et torsions", steps:[
     ["c","S’ouvrir","Bhujaṅgāsana, le cobra. Ūrdhva Dhanurāsana, la roue : ton pont. Les extensions ouvrent la poitrine et les épaules, utiles pour ta ligne tête en bas."],
     ["c","Tourner","Les torsions, comme Ardha Matsyendrāsana, se font en grandissant d’abord : allonger, puis tourner. Jamais l’inverse."],
     ["q","Ūrdhva Dhanurāsana, c’est…",["La roue, ou le pont","Le cobra, sur le ventre","L’arc, mains aux chevilles"],0,"Dhanu : l’arc, tendu vers le haut."],
     ["q","Dans une torsion, on…",["Grandit d’abord, puis tourne","Tourne d’abord, puis grandit","Arrondit le dos"],0,"La colonne longue tourne sans se tasser."]]},
    {id:"a5", name:"La salutation au soleil", steps:[
     ["c","Un enchaînement","Sūrya Namaskār : une suite de postures liées au souffle, pour réchauffer tout le corps. Une façon idéale de commencer, comme ta mise en route."],
     ["c","Un mouvement, un souffle","Inspire en ouvrant, expire en pliant. Le rythme du souffle donne le rythme du corps."],
     ["q","Dans la salutation, on inspire plutôt…",["En s’ouvrant, en levant les bras","En se pliant vers l’avant","En reculant en planche"],0,"Ouvrir = inspirer, plier = expirer."],
     ["p",{name:"Salutation lente", dur:"1 min 30", why:"Une salutation au soleil, au rythme du souffle.", src:"hatha yoga", steps:tx([10,"Debout, mains jointes. Inspire, lève les bras."],[10,"Expire, plie en avant."],[15,"Inspire, dos plat. Expire, recule en planche et descends, genoux au sol si besoin."],[15,"Inspire, le cobra, coudes près du corps."],[20,"Expire, le chien tête en bas. Trois souffles."],[10,"Inspire, avance les pieds. Expire, plie."],[10,"Inspire, remonte les bras. Expire, mains jointes."])}]]}]}]},
  {id:"souffle", name:"Respiration", sub:"Prāṇāyāma", ic:"wind", units:[
   {name:"Les bases", lessons:[
    {id:"r1", name:"La respiration complète", steps:[
     ["c","Trois étages","Le ventre, puis les côtes, puis le haut de la poitrine. À l’expiration, l’inverse. C’est la base de tous les prāṇāyāma."],
     ["c","Par le nez","Sauf indication contraire, on respire par le nez : l’air y est filtré, réchauffé, et le souffle ralentit tout seul."],
     ["q","Dans la respiration complète, on remplit d’abord…",["Le ventre","Le haut de la poitrine","Les épaules"],0,"Du bas vers le haut, comme on remplit un verre."],
     ["p",{name:"Respiration complète", dur:"2 min", why:"Les trois étages du souffle.", src:"hatha yoga", steps:tx([30,"Une main sur le ventre, une sur la poitrine."],[30,"Inspire : le ventre, puis les côtes, puis la poitrine."],[30,"Expire : la poitrine, les côtes, le ventre."],[30,"Continue, sans forcer, à ton rythme."])}]]},
    {id:"r2", name:"Ujjāyī, le souffle victorieux", steps:[
     ["c","Un léger son","On resserre un peu le fond de la gorge : le souffle fait un bruit doux, comme la mer. Il ralentit et devient régulier."],
     ["c","Dans les postures","Ujjāyī accompagne souvent la pratique des postures : il donne un rythme, et dit si l’on force (le son se hache)."],
     ["q","Ujjāyī se reconnaît à…",["Un son doux au fond de la gorge","Une expiration par la bouche","Une rétention longue"],0,"Le bruit de la mer."],
     ["q","Le son d’ujjāyī se hache pendant une posture. Ça veut dire…",["Que tu forces","Que c’est parfait","Qu’il faut respirer plus vite"],0,"Le souffle est un témoin honnête."]]},
    {id:"r3", name:"La respiration alternée", steps:[
     ["c","Nāḍī śodhana","Une narine puis l’autre, lentement, avec le pouce et l’annulaire. Une des respirations les plus calmes du hatha yoga."],
     ["c","Ce qu’on sait","Les études restent modestes : vois-la comme une façon douce de ralentir, pas comme un remède."],
     ["q","Nāḍī śodhana se fait…",["Une narine après l’autre","Par la bouche","En retenant longtemps"],0,"Alternée, lente, sans forcer."],
     ["p","nadi"]]}]},
   {name:"Avec prudence", lessons:[
    {id:"r4", name:"Kapālabhāti et les souffles forts", steps:[
     ["c","Le crâne qui brille","Kapālabhāti : des expirations courtes et actives par le nez, l’inspiration se fait seule. Tonique, à pratiquer assis, l’estomac vide."],
     ["c","Pas pour tout le monde","À éviter enceinte, en cas d’hypertension, d’épilepsie, de problème cardiaque, de hernie, de glaucome, de reflux ou de vertiges. Commence avec un enseignant : 20 expirations, puis souffle normal."],
     ["q","Dans kapālabhāti, ce qui est actif, c’est…",["L’expiration","L’inspiration","La rétention"],0,"L’inspiration se fait d’elle-même."],
     ["q","Qui doit éviter kapālabhāti ?",["Une personne hypertendue","Un débutant en bonne santé, à jeun","Un sportif bien échauffé"],0,"Les souffles forts ont des contre-indications."]]},
    {id:"r5", name:"Bhrāmarī, l’abeille", steps:[
     ["c","Un bourdonnement","On expire en bourdonnant, bouche fermée, comme une abeille. La vibration se sent dans la tête. Très apaisant le soir."],
     ["c","Simple et sûr","Aucune rétention, aucun effort : une des meilleures portes d’entrée vers le prāṇāyāma."],
     ["q","Bhrāmarī se pratique en…",["Bourdonnant à l’expiration","Retenant le souffle","Respirant par la bouche"],0,"Le son de l’abeille."],
     ["p",{name:"L’abeille", dur:"2 min", why:"Bhrāmarī : expirer en bourdonnant, pour apaiser.", src:"hatha yoga", steps:[["txt",15,"Assieds-toi, ferme les yeux, bouche fermée."],...breath([["in",4,"Inspire par le nez"],["out",8,"Expire en bourdonnant, mmmm"]], 8),["txt",10,"Reste dans le silence qui suit."]]}]]}]}]},
  {id:"medit", name:"Méditation", sub:"Dhyāna, en pratique", ic:"drop", units:[
   {name:"S’asseoir", lessons:[
    {id:"d1", name:"La posture assise", steps:[
     ["c","Stable d’abord","Assis sur un coussin, les genoux plus bas que les hanches, ou sur une chaise. Le dos long, sans raideur. Ce qui compte : pouvoir rester immobile sans douleur."],
     ["c","Les mains, le regard","Mains posées sur les cuisses. Yeux fermés, ou mi-clos posés au sol devant toi."],
     ["q","Pour méditer, il faut…",["Une posture stable, même sur une chaise","Le lotus, ou au moins le demi-lotus","Le dos contre un mur, les yeux ouverts"],0,"Sthira sukham : stable et confortable."],
     ["p","scan"]]},
    {id:"d2", name:"Revenir au souffle", steps:[
     ["c","Un ancrage","Compter les souffles de 1 à 10, puis recommencer. Perdu le compte ? Repars de 1, sans te juger."],
     ["c","Pas un vide","Méditer n’est pas faire le vide. C’est remarquer où va l’attention, et la ramener. Mille fois si besoin."],
     ["q","Méditer, c’est…",["Ramener l’attention, encore et encore","Arrêter toutes ses pensées","Se concentrer sur un problème"],0,"Le retour est la pratique."],
     ["p",{name:"Compter les souffles", dur:"3 min", why:"Un ancrage simple pour l’attention.", src:"pratique zen et vipassana", steps:tx([20,"Assieds-toi, le dos long, les yeux fermés."],[60,"Compte chaque expiration, de 1 à 10."],[60,"Perdu ? Repars de 1, avec le sourire."],[40,"Lâche le compte, garde juste le souffle."])}]]},
    {id:"d3", name:"Le mantra", steps:[
     ["c","Un son qui porte","Un mantra est un son répété, à voix haute ou intérieurement. So hum : « so » à l’inspiration, « hum » à l’expiration."],
     ["c","Om","Aum, la syllabe la plus connue : trois sons, a-u-m, et le silence qui suit."],
     ["q","Avec So hum, « so » accompagne…",["L’inspiration","L’expiration","La rétention"],0,"So à l’inspire, hum à l’expire."]]},
    {id:"d4", name:"Mettā, la bienveillance", steps:[
     ["c","Souhaiter du bien","Mettā : souhaiter du bien à soi, puis à un proche, à un inconnu, à quelqu’un de difficile, à tous. Quatre phrases simples suffisent."],
     ["c","Ce qu’on sait","L’une des méditations les plus étudiées : les études montrent un effet modeste à moyen sur les émotions positives."],
     ["q","Mettā commence souvent par…",["Soi-même","Un ennemi","Le monde entier"],0,"On ne donne bien que ce qu’on s’accorde."],
     ["p",{name:"Mettā", dur:"3 min", why:"Souhaiter du bien, cercle après cercle.", src:"tradition bouddhiste theravāda", steps:tx([40,"Pour toi : puissé-je être en paix, en bonne santé, en sécurité."],[40,"Pour un proche : puisses-tu être en paix."],[40,"Pour un inconnu croisé aujourd’hui."],[40,"Pour tous les êtres."])}]]}]}]},
  {id:"chakras", name:"Chakras", sub:"La carte subtile", ic:"sun", units:[
   {name:"Les sept", lessons:[
    {id:"k1", name:"Une carte, pas une anatomie", steps:[
     ["c","Des roues","Cakra : la roue. Le tantra et le hatha yoga décrivent des centres le long de la colonne. Une carte symbolique pour la méditation, pas des organes."],
     ["c","D’où vient le modèle","Le système à sept chakras s’est diffusé en Occident avec Arthur Avalon (The Serpent Power, 1919). Les couleurs arc-en-ciel sont un ajout moderne."],
     ["q","Les chakras sont…",["Une carte symbolique pour méditer","Des nerfs décrits par la médecine","Des points d’acupuncture chinois"],0,"Une représentation, utile pour diriger l’attention."]]},
    {id:"k2", name:"Du bas vers le cœur", steps:[
     ["c","Les quatre premiers","Mūlādhāra, la racine, à la base. Svādhiṣṭhāna, au bas-ventre. Maṇipūra, au nombril. Anāhata, au cœur."],
     ["c","Leurs sons","Chaque chakra a un son-germe : LAM, VAM, RAM, YAM. On peut les murmurer en posant l’attention à leur place."],
     ["q","Mūlādhāra se situe…",["À la base de la colonne","Au cœur","Au sommet du crâne"],0,"La racine."],
     ["q","Le chakra du cœur s’appelle…",["Anāhata","Maṇipūra","Ājñā"],0,"Anāhata : « non frappé »."]]},
    {id:"k3", name:"De la gorge au sommet", steps:[
     ["c","Les trois derniers","Viśuddha, à la gorge. Ājñā, entre les sourcils. Sahasrāra, au sommet du crâne, le lotus aux mille pétales."],
     ["c","Leurs sons","HAM pour la gorge, OM entre les sourcils. Sahasrāra se vit dans le silence."],
     ["q","Ājñā se place…",["Entre les sourcils","Au sommet du crâne","À la base de la gorge"],0,"Le « troisième œil »."],
     ["p",{name:"Voyage le long de la colonne", dur:"3 min", why:"Promener l’attention de la base au sommet, avec les sons-germes.", src:"tradition tantrique", steps:tx([25,"Base de la colonne. Murmure LAM."],[25,"Bas-ventre. VAM."],[25,"Nombril. RAM."],[25,"Cœur. YAM."],[25,"Gorge. HAM."],[25,"Entre les sourcils. OM."],[30,"Sommet du crâne. Silence."])}]]},
    {id:"k4", name:"Les mudrās", steps:[
     ["c","Des gestes","Mudrā : un sceau, un geste des mains. Jñāna mudrā : pouce et index se touchent, les autres doigts tendus. Le geste classique de la méditation assise."],
     ["c","Añjali mudrā","Les paumes jointes devant le cœur : salut, respect, recentrage. Le « namaste » du début et de la fin de séance."],
     ["q","Jñāna mudrā, c’est…",["Pouce et index qui se touchent","Paumes jointes devant le cœur","Mains en coupe, l’une dans l’autre"],0,"Le sceau de la connaissance."]]}]}]}]},
 {cat:"Énergie", voies:[
  {id:"reiki", name:"Reiki", sub:"La pratique de Mikao Usui", ic:"hand", units:[
   {name:"Comprendre", lessons:[
    {id:"e1", name:"Origine", steps:[
     ["c","Japon, 1922","Mikao Usui fonde l’Usui Reiki Ryōhō à Tokyo. Rei, l’esprit, le mystérieux (souvent traduit « universel ») ; ki, l’énergie vitale. Une pratique d’imposition des mains et de développement personnel."],
     ["c","Vers l’Occident","Chūjirō Hayashi, élève d’Usui, forme Hawayo Takata, qui l’enseigne à Hawaï dès 1937, puis sur le continent américain ; elle forme 22 maîtres entre 1970 et 1980."],
     ["q","Qui a fondé le reiki ?",["Mikao Usui","Patañjali","Hawayo Takata"],0,"Japon, 1922."],
     ["q","Ki veut dire…",["L’énergie vitale","La lumière","Le souffle sacré"],0,"Le même mot que le qi chinois."]]},
    {id:"e2", name:"Les cinq principes", steps:[
     ["c","Gokai","Juste pour aujourd’hui : ne te mets pas en colère, ne t’inquiète pas, sois reconnaissant, applique-toi à ta pratique, sois bienveillant envers les autres."],
     ["c","Juste pour aujourd’hui","Pas pour toujours : pour aujourd’hui. Le même esprit que revenir au tapis chaque jour, sans promesse impossible."],
     ["q","Les principes du reiki commencent par…",["Juste pour aujourd’hui","Chaque matin, au réveil","Avec gratitude, toujours"],0,"Kyō dake wa : rien que pour aujourd’hui."],
     ["q","Lequel n’est PAS un des cinq principes ?",["Sois toujours fort","Sois reconnaissant","Ne t’inquiète pas"],0,"Les cinq : colère, inquiétude, gratitude, pratique, bienveillance."],
     ["p",{name:"Gokai, le matin", dur:"1 min", why:"Réciter les cinq principes, mains jointes, matin et soir, comme le faisaient les élèves d’Usui.", src:"tradition Usui Reiki Ryōhō", steps:tx([12,"Mains jointes devant le cœur. Juste pour aujourd’hui…"],[12,"Ne te mets pas en colère."],[12,"Ne t’inquiète pas."],[12,"Sois reconnaissant. Applique-toi à ta pratique."],[12,"Sois bienveillant envers les autres."])}]]},
    {id:"e3", name:"Ce qu’on sait, ce qu’on ne sait pas", steps:[
     ["c","Les études","Les revues d’études n’ont pas montré d’effet du reiki au-delà de l’effet placebo. Beaucoup y trouvent pourtant un vrai moment de calme et d’attention."],
     ["c","Les limites","Le reiki ne soigne pas une maladie et ne remplace jamais un médecin. Méfie-toi de toute promesse de guérison, ou de stages très chers."],
     ["q","Le reiki peut-il remplacer un traitement médical ?",["Non, jamais","Oui, pour les petites douleurs","Oui, s’il est bien fait"],0,"Un complément de bien-être, pas un soin."],
     ["q","Un praticien promet de guérir une maladie grave. Tu…",["T’en méfies","Demandes une séance d’essai","Lui fais confiance s’il est diplômé"],0,"Une promesse de guérison est un signal d’alarme."]]}]},
   {name:"Pratiquer", lessons:[
    {id:"e4", name:"L’autotraitement", steps:[
     ["c","Les mains posées","On pose les mains, sans pression, quelques minutes par zone : les yeux, les tempes, l’arrière de la tête, la gorge, le cœur, le ventre."],
     ["c","Comme une méditation","Le plus simple est de le vivre comme une attention douce : sentir la chaleur des mains, respirer, laisser le corps se poser."],
     ["q","Dans l’autotraitement, les mains…",["Se posent sans pression","Massent fort","Restent loin du corps"],0,"Une présence, pas un massage."],
     ["p",{name:"Autotraitement court", dur:"4 min", why:"Six positions, mains posées, attention au souffle.", src:"positions de base du reiki occidental", steps:tx([40,"Paumes sur les yeux, doigts vers le front, sans appuyer."],[40,"Mains sur les tempes."],[40,"Mains à l’arrière de la tête."],[40,"Une main sur la gorge, sans appuyer, l’autre sur le cœur."],[40,"Les deux mains sur le cœur."],[40,"Les deux mains sur le ventre."])}]]},
    {id:"e5", name:"Les degrés", steps:[
     ["c","Trois niveaux","Shoden, le premier degré : pratiquer sur soi et sur les autres. Okuden, le deuxième : les symboles. Shinpiden : l’enseignement."],
     ["c","Choisir sa formation","En France, rien n’encadre le titre. Cherche un enseignant qui parle de limites, ne promet rien, et ne te demande pas d’arrêter un traitement."],
     ["q","Le premier degré s’appelle…",["Shoden","Shinpiden","Okuden"],0,"Sho : le début."],
     ["q","Un bon enseignant de reiki…",["Parle des limites, ne promet rien","Garantit un résultat en trois séances","Te demande de croire avant de pratiquer"],0,"L’honnêteté avant tout : aucune promesse de guérison."]]}]}]}]},
 {cat:"Formations", voies:[
  {id:"prof", name:"Professeur de yoga", sub:"Ce qu’apprend une formation", ic:"book", units:[
   {name:"Le métier", lessons:[
    {id:"p1", name:"Le parcours", steps:[
     ["c","200 heures","Le standard le plus répandu est privé : Yoga Alliance (registre américain), RYT-200, puis RYT-500 avec 300 heures de plus."],
     ["c","En France","Le titre de professeur de yoga n’est pas réglementé. Une formation sérieuse couvre techniques, anatomie, philosophie, pédagogie et éthique, avec de la pratique encadrée."],
     ["q","Le premier niveau international, c’est…",["200 heures","50 heures","1 000 heures"],0,"RYT-200."],
     ["q","Une bonne formation couvre…",["Techniques, anatomie, philosophie, pédagogie, éthique","Postures, souplesse, force, endurance, équilibre","Méditation, chant, mantras, mudrās, rituels"],0,"Les cinq piliers d’une formation complète."]]},
    {id:"p2", name:"Construire un cours", steps:[
     ["c","Un arc","Arrivée et souffle, échauffement, postures debout, la posture-sommet, retour au calme, relaxation. Un cours monte puis redescend."],
     ["c","Un fil","Choisis une intention ou une posture-sommet, et fais que tout y prépare. Comme ton parcours prépare la full planche."],
     ["q","Dans quel ordre ?",["Échauffement, postures, sommet, retour au calme","Sommet, échauffement, postures, retour au calme","Échauffement, sommet, retour au calme, postures"],0,"Préparer, culminer, redescendre."],
     ["q","La relaxation finale (śavāsana) se place…",["À la fin","Au début","Après l’échauffement"],0,"Le temps de laisser le corps intégrer."]]},
    {id:"p3", name:"Toucher et ajuster", steps:[
     ["c","Le consentement","Avant tout ajustement, demander. Beaucoup de studios utilisent une carte ou un geste pour dire oui ou non, renouvelable à chaque cours."],
     ["c","Les mots d’abord","Une consigne verbale ou une démonstration suffit souvent. Le toucher guide, il ne force jamais une amplitude."],
     ["q","Avant d’ajuster un élève, on…",["Demande son accord","Ajuste directement","Pousse plus loin"],0,"Le consentement se demande, et peut changer."],
     ["q","Un ajustement…",["Guide sans forcer","Pousse au-delà de la limite","Remplace l’échauffement"],0,"Ahiṃsā, encore."]]},
    {id:"p4", name:"Sécurité et contre-indications", steps:[
     ["c","Les questions","Au premier cours : blessures, grossesse, tension artérielle, opérations récentes. Puis proposer des variantes."],
     ["c","Les inversions","Tension mal contrôlée, glaucome, rétine fragile, nuque fragile, problème cardiaque, chirurgie de l’œil récente, vertiges, grossesse sans pratique établie : pas d’inversion sans avis médical. Les règles de ta Voie valent pour tes élèves."],
     ["q","Une élève enceinte. Tu…",["Proposes des variantes adaptées","Lui demandes de ne pas venir","La laisses faire comme les autres"],0,"Pas de souffles forts, pas de compression du ventre."],
     ["q","Glaucome : l’équilibre sur les mains…",["Seulement avec avis médical","Possible contre un mur","Possible s’il est court"],0,"La pression dans les yeux monte tête en bas."]]},
    {id:"p5", name:"L’éthique", steps:[
     ["c","Rester à sa place","Un professeur n’est ni médecin, ni psychologue. Il oriente vers un professionnel quand il le faut."],
     ["c","Les yamas du prof","Ahiṃsā : ne pas blesser. Satya : ne pas promettre. Brahmacarya : la juste distance avec les élèves."],
     ["q","Un élève parle de douleurs persistantes. Tu…",["L’orientes vers un professionnel de santé","Lui proposes des étirements ciblés","Lui conseilles de s’échauffer plus"],0,"Rester dans son rôle."]]}]}]},
  {id:"coach", name:"Coach d’équilibre", sub:"Enseigner le handstand", ic:"hs", units:[
   {name:"Les bases du coach", lessons:[
    {id:"c1", name:"Les piliers de l’équilibre", steps:[
     ["c","Sept piliers","Force spécifique, endurance, alignement, régularité, forme du corps, équilibre, mobilité. Un élève bloqué manque presque toujours d’un pilier, pas de courage."],
     ["c","Trouver le pilier","Ne tient pas 30 s au mur ? Endurance. Banane ? Alignement ou épaules fermées. Tient au mur mais pas libre ? Équilibre."],
     ["q","Un élève tient 60 s au mur mais rien en libre. Il manque…",["D’équilibre","De force","De souplesse"],0,"La force est là, il faut des essais d’équilibre."],
     ["q","Un dos en banane vient souvent…",["D’épaules qui ne s’ouvrent pas","De trop de force","D’un mauvais regard seulement"],0,"Les épaules fermées se compensent par le dos."]]},
    {id:"c2", name:"Parer", steps:[
     ["c","Pourquoi parer","Une parade bien faite donne confiance et permet de sentir la bonne ligne. Mal faite, elle déséquilibre ou blesse."],
     ["c","Comment","Se placer de côté, tout près, saisir les hanches ou les cuisses, jamais les chevilles seules. Aider le moins possible. Apprends-la en club, avec un entraîneur, avant de parer qui que ce soit."],
     ["q","Pour parer un équilibre, on tient plutôt…",["Les hanches ou les cuisses","Les chevilles seules","Les mains"],0,"Près du centre de gravité."],
     ["q","Une bonne parade…",["Aide le moins possible","Porte tout le poids","Pousse vers l’avant"],0,"L’élève doit travailler."]]},
    {id:"c3", name:"Les mains et les épaules", steps:[
     ["c","Les mains","Doigts écartés, le poids sur toute la main, les index vers l’avant, jamais tournés vers l’intérieur. Les doigts corrigent comme les orteils debout."],
     ["c","Les épaules","Pousser le sol, épaules vers les oreilles, bras verrouillés. C’est l’épaule qui porte, pas le dos."],
     ["q","En équilibre, les épaules…",["Poussent vers les oreilles","S’éloignent des oreilles","Se relâchent"],0,"Élévation des omoplates : la poussée vers le haut."],
     ["q","Si on part vers le dos, on corrige avec…",["Les doigts","Le talon de la main","Les coudes"],0,"Appuyer dans les doigts ramène."]]},
    {id:"c4", name:"Le cadre légal", steps:[
     ["c","En France","Encadrer contre rémunération une activité physique demande un diplôme reconnu (Code du sport, article L212-1) : BPJEPS, CQP ou STAPS selon l’activité."],
     ["c","Les premiers pas","Le PSC (prévention et secours civiques), une assurance responsabilité civile, la carte professionnelle (L212-11), et des cours gratuits pour apprendre. La mission « Premier élève » de ta Voie t’y mène."],
     ["q","Pour être payé comme coach en France, il faut…",["Un diplôme reconnu","Une assurance seulement","Une certification en ligne"],0,"Code du sport, L212-1."],
     ["q","Le PSC, c’est…",["Une formation aux premiers secours","Un diplôme d’éducateur sportif","Une assurance professionnelle"],0,"Une journée, à faire avant d’encadrer qui que ce soit."]]}]}]}]}
];
