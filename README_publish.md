Instructions pour publier ce projet sur GitHub

But: le dépôt local a été initialisé et committé.

Option A — (recommandé) utiliser GitHub CLI (`gh`):

1. Installer `gh` si nécessaire: https://cli.github.com/
2. Se connecter: `gh auth login`
3. Exécuter le script fourni (adaptable):

   ./push_to_github.sh fatimazahraeelmharzi-lang flowtrack-ensa2

Cela créera le repo `fatimazahraeelmharzi-lang/flowtrack-ensa2`, l'ajoutera comme `origin` et poussera la branche `main`.

Option B — sans `gh` (manuel):

1. Créez un nouveau repository vide sur GitHub (https://github.com/new) appelé `flowtrack-ensa2` sous le compte `fatimazahraeelmharzi-lang`.
2. Dans ce dossier local, exécutez:

   git remote add origin git@github.com:fatimazahraeelmharzi-lang/flowtrack-ensa2.git
   git branch -M main
   git push -u origin main

Remarques:
- Si vous utilisez HTTPS, remplacez l'URL remote par `https://github.com/fatimazahraeelmharzi-lang/flowtrack-ensa2.git` et authentifiez-vous via votre credential manager ou token.
- Si vous souhaitez que je crée le repo directement (requiert `gh` installé et authentifié ici), dites-le et j'exécuterai le script.
