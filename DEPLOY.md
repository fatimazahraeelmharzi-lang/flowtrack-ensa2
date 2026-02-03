# Déploiement (Guide rapide) 🚀

Ce document explique comment rendre votre application publique pour travailler avec le backend.

## Option recommandée : Déployer l'ensemble (frontend + backend) sur Render ✅

1. Poussez votre repo sur GitHub si ce n'est pas déjà fait.
2. Créez un compte sur https://render.com et connectez-le à votre dépôt GitHub.
3. **Créer un Web Service** :
   - Branch: `main` (ou la branche de votre choix)
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node` (Render détecte la version via `package.json`)
4. Configurez les variables d'environnement dans Render (Dashboard → Environment):
   - `DATABASE_URL` = URL PostgreSQL (optionnel ; si absent, le serveur utilisera les fichiers JSON dans `data/`)
   - `TEACHER_USERNAME` (optionnel)
   - `TEACHER_PASSWORD` (optionnel)
5. Déployez. Le serveur écoute maintenant sur le port fourni par Render grâce à `process.env.PORT`.
6. Dans le fichier `js/config.js` (ou via votre frontend), définissez `window.API_BASE_URL` sur l'URL publique de votre service (ex: `https://your-service.onrender.com`).

### Ajouter une base de données PostgreSQL
- Vous pouvez utiliser le service PostgreSQL de Render (ou Supabase / Railway / ElephantSQL) et coller la `DATABASE_URL` dans les variables d'environnement.
- Au premier démarrage, le serveur va tenter d'appliquer `db/schema.sql` et créer des colonnes minimales.

---

## Option alternative : Frontend statique (Netlify/Vercel/GitHub Pages) + Backend (Render/Railway) ⚖️

1. Déployez le backend sur Render/Railway/Fly.
2. Déployez seulement la partie statique (tous les `.html`, `css/`, `js/`) sur Netlify / Vercel / GitHub Pages.
3. Dans `js/config.js`, mettez `window.API_BASE_URL = "https://votre-backend.example.com"`.
4. Assurez-vous que le backend accepte le CORS (le serveur actuel renvoie `Access-Control-Allow-Origin: *`).

---

## Notes pratiques et conseils 🔧
- Le script `npm start` lance `node server.js`. Le port utilisé est `process.env.PORT || 3005`.
- `bcrypt` et `pg` sont présents dans `package.json`. Certains environnements cloud construisent automatiquement les dépendances natales.
- Pour le développement local sans Postgres : ne définissez pas `DATABASE_URL` et le serveur utilisera `data/*.json`.
- Pour des déploiements de production : utilisez HTTPS, configurez un vrai serveur de base de données, et protégez les identifiants.

---

## Besoin d'aide pour automatiser le déploiement ?
Si tu veux, je peux :
- Créer un fichier `Procfile` ou `render.yaml` pour faciliter la configuration, ou
- Ajouter un petit guide pour déployer sur **Railway**, **Supabase** ou **Vercel**, ou
- Mettre en place une Action GitHub pour déploiement automatique.

Dis-moi quelle option tu préfères et je te fournis les étapes précises (ou j'ajoute les fichiers nécessaires). ✅

---

## Fichiers ajoutés pour Render 🔧
- `render.yaml` — configuration (Web Service + base PostgreSQL) pour faciliter le déploiement avec Infrastructure-as-Code.
- `.env.example` — exemple de variables d'environnement à copier et compléter (`DATABASE_URL`, `TEACHER_USERNAME`, `TEACHER_PASSWORD`).

Étapes rapides :
1. Modifie `.env.example` avec ta `DATABASE_URL` et sauvegarde localement comme `.env` si tu veux tester avec un outil local.
2. Pousse le repo sur GitHub, connecte Render au dépôt, et Render importera `render.yaml` (ou configure le service via l'interface).
3. Dans Render, vérifie que `DATABASE_URL` est bien défini (ou attache la DB créée par Render) et que le service déploie automatiquement.

Si tu veux, je peux créer un `render.yaml` plus précis (région, plan, backups) ou préparer un fichier `render-secrets.md` avec les commandes exactes pour provisionner la DB. 🚀

---

## Besoin d'un lien public tout de suite ? (méthode express ⚡)
Si tu veux un **lien public immédiat** pour montrer l'application pendant que nous finalisons le déploiement sur Render, utilise ngrok :

1. Assure-toi d'avoir **ngrok** installé et ton authtoken configuré : https://ngrok.com/download
2. Depuis le dépôt, rends le script exécutable :

   ```bash
   chmod +x scripts/start-with-ngrok.sh
   ./scripts/start-with-ngrok.sh
   ```

3. Le script démarre ton serveur (`npm start`) et crée un tunnel ngrok, puis affiche l'URL publique à utiliser.

Notes :
- Cette URL est **temporaire** (utile pour démonstrations rapides). Pour une URL permanente, complète le déploiement sur Render (voir plus haut).
- Si tu veux, je peux **démarrer** ngrok pour toi **si tu me fournis** le tunnel public (ou si tu veux, je te guide pas à pas via le terminal).