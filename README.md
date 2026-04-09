# aimtrainer
projet d'entrainement à la visée en P5js
Traçabilité de l'utilisation de l'IA (Gemini)
Pour ce projet, j'ai utilisé l'IA (Gemini) comme un tuteur technique pour m'aider à structurer mon code, débloquer des bugs spécifiques, et apprendre de nouvelles fonctions JavaScript. Voici comment je m'en suis servi :

1. Remplissage des fiches et structure de base
Pourquoi j'ai utilisé l'IA : J'avais du mal à définir clairement les variables et les limites du hasard pour mon jeu.

Le type de prompt utilisé : "Je dois remplir un tableau pour définir ce qui est fixe et ce qui varie dans mon jeu Aim Lab, tu peux m'aider à lister les paramètres pour les cibles et le viseur ?"

Ce que j'ai fait : L'IA m'a donné une liste d'idées. J'ai choisi de garder le système de cible aléatoire et j'ai eu l'idée d'y ajouter un slider pour gérer la sensibilité de la souris.

2. Le bug de la souris qui sort de l'écran
Pourquoi j'ai utilisé l'IA : Quand je visais trop sur la gauche, mon curseur sortait de la fenêtre web et je cliquais dans le vide.

Le type de prompt utilisé : "Comment faire pour que ma souris reste bloquée à l'intérieur de la fenêtre du jeu pour ne pas cliquer à côté ?"

Ce que j'ai fait : L'IA m'a fait découvrir la fonction requestPointerLock(). Je l'ai intégrée à mon clic de souris, et j'ai géré le fait que la souris soit relâchée (exitPointerLock()) quand le timer tombe à zéro.

3. Passage en Orienté Objet (Classes)
Pourquoi j'ai utilisé l'IA : Mon code de base fonctionnait, mais il y avait des variables partout. Je voulais le rendre plus propre et modulaire.

Le type de prompt utilisé : "Est-ce que tu peux m'aider à transformer mon code en Programmation Orientée Objet avec des classes (Cible, Viseur) ?"

Ce que j'ai fait : L'IA m'a proposé une structure avec des classes. J'ai repris cette architecture, puis j'ai ajusté moi-même la logique interne (les conditions pour obtenir le Rang S, les couleurs, et la taille random(15, 35) des cibles) pour équilibrer la difficulté de mon jeu.

4. Ajout du son de tir sans fichier externe
Pourquoi j'ai utilisé l'IA : Je voulais un son quand on touche une cible, mais je voulais éviter les bugs de chargement de fichiers .mp3 externes sur le web.

Le type de prompt utilisé : "Est-ce qu'il y a un moyen de générer un simple son de tir 'arcade' directement en code JavaScript sans importer de fichier audio ?"

Ce que j'ai fait : L'IA m'a expliqué comment utiliser la Web Audio API native. J'ai intégré ce bloc de code dans mon gestionnaire de clic pour déclencher l'oscillateur uniquement quand la collision avec la cible est validée.
