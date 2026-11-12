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

L'arbre est décrit en haut du script de `index.html` (`TREE` et `GOALS`) : c'est là qu'on ajuste jalons et objectifs.

L'app ne contient aucun contenu du programme d'origine (vidéos, textes) : uniquement des noms de jalons pour le suivi personnel.
