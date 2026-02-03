# 🎓 ENSA Fès - Application de Gestion des Absences

Application web moderne et responsive pour la gestion des absences des étudiants à l'ENSA Fès.

## 📁 Structure du Projet

```
app2/
├── index.html          # Page d'accueil
├── login.html          # Page de connexion
├── gestion.html        # Page de gestion des absences
├── css/
│   └── style.css       # Styles CSS
├── js/
│   └── script.js       # Logique JavaScript
└── README.md           # Documentation
```

## 🎯 Fonctionnalités

### 1️⃣ Page d'Accueil (index.html)
- Titre principal "GESTION D'ABSENCE"
- Sous-titre descriptif
- Bouton "Connexion Professeur" 
- Messages défilants en bas :
  - ✓ Bonne gestion de présence
  - ✓ Meilleure accessibilité
  - ✓ Gestion efficace du temps
  - ✓ Suivi académique intelligent
- Design académique avec gradient bleu
- Animations fluides

### 2️⃣ Page de Connexion (login.html)
- Email académique (@ensa.ma)
- Champ mot de passe
- Validation côté client
- Session stockée dans le navigateur
- Design cohérent avec l'accueil
- Messages d'erreur clairs

### 3️⃣ Gestion des Absences (gestion.html)
- **Sélection de la filière :**
  - ISDIA
  - ILIA
  - Génie Informatique
  - Génie Logiciel
  - Cybersécurité

- **Sélection de la semaine :** 1 à 12

- **Tableau des étudiants avec :**
  - Numéro
  - Nom
  - Prénom
  - Boutons de statut (Présent/Absent)

- **Gestion des statuts :**
  - Bouton "✓ Présent" → Vert
  - Bouton "✗ Absent" → Rouge
  - Mise à jour en temps réel

- **Export PDF :**
  - Bouton "🖨️ Imprimer PDF"
  - Génère un PDF formaté A4
  - Inclut : filière, semaine, date, tableau
  - Prêt à imprimer

- **Réinitialisation :**
  - Bouton "↺ Réinitialiser"
  - Efface les statuts de la semaine

## 🚀 Comment Utiliser

### 1. Ouvrir l'Application
```bash
# Ouvrir directement le fichier index.html dans le navigateur
# OU
# Serveur local Python (recommandé)
python -m http.server 8000
# Puis accéder à http://localhost:8000
```

### 2. Authentification
- Email : `any@ensa.ma` (doit finir par @ensa.ma)
- Mot de passe : au moins 4 caractères
- Cliquer sur "Se connecter"

### 3. Gérer les Absences
1. Sélectionner une **filière**
2. Sélectionner une **semaine** (1-12)
3. Pour chaque étudiant :
   - Cliquer "✓ Présent" (bouton devient vert)
   - Cliquer "✗ Absent" (bouton devient rouge)
4. Les données sont sauvegardées automatiquement

### 4. Exporter en PDF
1. Sélectionner filière + semaine
2. Cliquer sur "🖨️ Imprimer PDF"
3. Le fichier PDF se télécharge automatiquement

## 🎨 Design et Style

### Couleurs (Thème ENSA)
- **Bleu foncé** : `#0B3C5D` (primaire)
- **Bleu** : `#1F5F8B` (secondaire)
- **Bleu clair** : `#4A90E2` (accents)
- **Vert** : `#27AE60` (Présent)
- **Rouge** : `#E74C3C` (Absent)
- **Gris clair** : `#F2F3F5` (fond)

### Features CSS
- Flexbox et Grid pour la responsivité
- Animations fluides (fadeIn, scroll)
- Design moderne avec ombres subtiles
- Boutons avec hover effects
- Media queries pour mobile/tablet/desktop

## 📱 Responsivité

- ✅ Desktop (1200px+)
- ✅ Tablette (768px - 1199px)
- ✅ Mobile (< 768px)
- ✅ Petit écran (< 480px)

## 🔒 Sécurité

**Note:** Cette application est une démonstration. Pour une utilisation en production :

- [ ] Implémenter une authentification serveur
- [ ] Hasher les mots de passe
- [ ] Utiliser HTTPS
- [ ] Implémenter des permissions d'accès
- [ ] Ajouter une base de données

## 📦 Dépendances

### Externe
- **html2pdf.js** : Pour l'export PDF
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  ```

### Interne
- HTML5 sémantique
- CSS3 moderne
- JavaScript vanilla (pas de frameworks)

## 💾 Stockage des Données

- Par défaut l'application utilisait **localStorage/sessionStorage** locale (non partagé entre machines).
- J'ai ajouté une **API serveur** (Node.js) et une **table PostgreSQL** (`utilisateurs`, `presences`) pour stocker **inscriptions** et **présences** de façon centralisée.
- Les inscriptions `POST /api/signup` et les présences `POST /api/presence` sont maintenant persistées dans la base de données PostgreSQL si `DATABASE_URL` est configurée.

### Lancer en local (Node.js)
1. Installer les dépendances :

```bash
npm install
```

2. Démarrer le serveur (écoute sur le port 3005) :

```bash
npm start
```

3. Accéder à l'interface :

- Frontend statique : `http://localhost:8000` (ou ouvrez `index.html`) 
- API serveur (backend) : `http://localhost:3005`

> Si vous déployez, assurez-vous de définir `DATABASE_URL` pour que le serveur écrive dans PostgreSQL.


## 🐛 Dépannage

### Le formulaire ne se soumet pas
- Vérifier que l'email finit par `@ensa.ma`
- Vérifier que le mot de passe a au moins 4 caractères

### Le tableau n'apparaît pas
- Sélectionner une filière ET une semaine
- Vérifier la console du navigateur (F12)

### L'export PDF ne fonctionne pas
- Vérifier la connexion internet (html2pdf.js en CDN)
- Désactiver les bloqueurs de pop-ups

## 📞 Support

Pour toute question ou problème, consultez :
- Console du navigateur (F12 > Console)
- Fichier de code correspondant
- Documentation du code commentée

## 📄 Licence

Développé pour ENSA Fès.

---

**Version :** 1.0  
**Dernière mise à jour :** Janvier 2026
