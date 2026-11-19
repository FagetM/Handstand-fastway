# Gymnastic Yoga

App perso pour suivre ma progression en équilibre sur les mains, jalon par jalon, jusqu'au but final.

- **Parcours** : l'arbre de compétences (Starter → Beginner → Intermediate → One Arm, plus Press, Low Balances et Planche), avec la prochaine étape mise en avant.
- **Séance** : la séance du jour d'un programme importé depuis un fichier (séries, cibles calculées sur le record, repos automatique). Le contenu des programmes n'est pas dans ce dépôt.
- **Chrono** : compte à rebours, bip à l'objectif, record enregistré et jalon validé automatiquement.
- **Journal** : historique des essais, jours d'affilée, séances sur 7 jours.
- **Hors ligne** : les données restent sur l'appareil (export / import dans Réglages).

## Application installable (PWA)

L'app s'installe depuis Chrome (« Installer l'application ») : plein écran, icône, raccourcis, ouverture immédiate et utilisation hors connexion.
Le service worker (`sw.js`) garde les fichiers sur l'appareil ; changer la constante `CACHE` à chaque version déclenche la proposition de mise à jour.

## Utilisation

Aucune installation : c'est une page statique. Ouvrir `index.html`, ou la publier avec GitHub Pages
(Settings → Pages → branche du dépôt, dossier racine) puis « Ajouter à l'écran d'accueil » sur le téléphone.

L'arbre est décrit dans `js/data.js` (`TREE` et `GOALS`) : c'est là qu'on ajuste jalons et objectifs.

Organisation du code (scripts classiques chargés dans l'ordre, sans étape de build) :

Les scripts se chargent dans cet ordre et partagent un même espace global ; rien ne s’exécute au chargement avant `main.js`, qui lance l’app.

| Fichier | Rôle |
|---|---|
| `index.html` | la page : structure des cinq onglets et des fenêtres |
| `css/app.css` | l'apparence |
| `js/data.js` | arbre des figures (`TREE`), objectifs (`GOALS`), fiches détaillées, schémas de posture |
| `js/state.js` | sauvegarde sur l'appareil, migrations, outils (`el`, `chipRow`), **le journal** (`idOfLog`, `logsOf`, `daysWhere`), validation, niveaux, badges |
| `js/yoga.js` | noms yoga des figures, figures maîtresses, carte « Prochaine victoire » |
| `js/parcours.js` | plan par figure (`planFor`), dates (`planCalc`), douleur, plateau, matériel (`EQ_NOTE`, `PARA_ALT`), fiche plein écran |
| `js/sprites.js` | personnage 3D et animations des figures et des exercices ; `figSp(anim, taille)` crée un personnage animé, `blockSp(bloc, taille)` celui d’un bloc de séance |
| `js/scene.js` | le décor aquarelle qui grandit avec le rang |
| `js/cycle.js` | cycles de 4 semaines : semaine légère, jour de test, bilan, records, carnet vidéo |
| `js/souple.js` | souplesse : repères mesurés, fin de séance active, séance douce |
| `js/cerveau.js` | **la micro-intelligence** : capacité estimée, forme du jour, pente de progression, raison de chaque charge |
| `js/views.js` | vestiaire, rendu des onglets, fiche chrono d'une figure |
| `js/voice.js` | voix de la séance : choix de la voix française la plus naturelle, annonces |
| `js/drills.js` | exercices d'accompagnement : bibliothèque, choix par figure, bloc prêt à jouer |
| `js/seance.js` | programmes, séance du jour (`builtinBlocks`), séance guidée, fin de séance |
| `js/bilan.js` | bilan de départ et profil : sécurité, objectif, matériel, âge, poids, fragilités, vérifications |
| `js/zen.js` | Postures : échelles tenues qui s'allongent, souplesse douce, récup, météo du corps |
| `js/voie.js` | la Voie : pensées, respirations, écoute du corps, carnet, transmettre |
| `js/apprendre-data.js` | le contenu des formations (voies, unités, leçons : cartes, quiz, pratiques) ; les livres s'y ajoutent |
| `js/ciel.js` | le ciel : moteur de carte d’étoiles partagé (Apprendre, Parcours) et le Parcours lui-même, une montée de nuit en lignes de progression |
| `js/apprendre.js` | l'onglet Apprendre : catalogue des voies, chemin de leçons, lecteur de leçon, série et points |
| `js/main.js` | navigation, réglages, code d'accès, app installable (seul fichier qui lance l'app) |

À chaque nouvelle version, changer `CACHE` dans `sw.js` (et `SPV` dans `js/sprites.js` si une animation change).

L'app ne contient aucun contenu du programme d'origine (vidéos, textes) : uniquement des noms de jalons pour le suivi personnel.

## Images à générer

Les prompts Gemini des photos manquantes et des aquarelles du décor sont dans [tools/prompts-images.md](tools/prompts-images.md).
