# Handstand Fastway

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

| Fichier | Rôle |
|---|---|
| `index.html` | la page : structure des trois onglets et des fenêtres |
| `css/app.css` | l'apparence |
| `js/data.js` | arbre des figures, fiches détaillées, schémas de posture |
| `js/state.js` | sauvegarde sur l'appareil, outils, expérience, niveaux, badges |
| `js/parcours.js` | plan par figure, chemin du parcours, coffres, estimation, carte rapide |
| `js/sprites.js` | personnage 3D et animations des figures |
| `js/views.js` | vestiaire, rendu des onglets, fiche d'une figure avec chrono |
| `js/seance.js` | programmes, séance du jour, exercices, bilan, séance guidée |
| `js/main.js` | navigation, réglages, code d'accès, app installable (seul fichier qui lance l'app) |

À chaque nouvelle version, changer `CACHE` dans `sw.js` (et `SPV` dans `js/sprites.js` si une animation change).

L'app ne contient aucun contenu du programme d'origine (vidéos, textes) : uniquement des noms de jalons pour le suivi personnel.
