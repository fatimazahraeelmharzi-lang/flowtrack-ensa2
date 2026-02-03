# 🎓 Comment Lancer l'Application ENSA Fès

## Option 1 : Serveur Local Python (Recommandé)

### macOS / Linux
```bash
cd "/Users/fati/Documents/dev web/app2"
python3 -m http.server 8000
```

### Windows
```bash
cd "Documents\dev web\app2"
python -m http.server 8000
```

Puis ouvrir : **http://localhost:8000**

---

## Option 2 : Serveur Local Node.js

```bash
# Si Node.js est installé
npm install -g http-server
http-server
```

Puis ouvrir : **http://localhost:8080**

---

## Option 3 : Ouvrir Directement

Double-cliquer sur **index.html** pour ouvrir dans le navigateur.
⚠️ Note : L'export PDF pourrait ne pas fonctionner en mode fichier local.

---

## 📍 Accès à l'Application

Une fois le serveur démarré :

| Page | URL |
|------|-----|
| 🏠 Accueil | http://localhost:8000 |
| 📖 Documentation | http://localhost:8000/index-doc.html |
| 🔐 Connexion | http://localhost:8000/login.html |
| 📊 Gestion | http://localhost:8000/gestion.html |

---

## 🔑 Identifiants de Test

**Email :** `professeur@ensa.ma` (ou tout email @ensa.ma)  
**Mot de passe :** `1234`

---

## 📁 Structure des Fichiers

```
app2/
├── index.html              ← Page d'accueil
├── login.html              ← Connexion enseignant
├── gestion.html            ← Gestion des absences
├── index-doc.html          ← Documentation
├── README.md               ← Guide complet
├── css/
│   └── style.css           ← Tous les styles
└── js/
    └── script.js           ← Logique JavaScript
```

---

## ✨ Fonctionnalités

✅ **Page Accueil**
- Titre "GESTION D'ABSENCE"
- Bouton "Connexion Professeur"
- Messages défilants animés
- Design académique moderne

✅ **Connexion**
- Email académique (@ensa.ma)
- Mot de passe sécurisé
- Validation côté client

✅ **Gestion des Absences**
- Sélection filière (5 options)
- Sélection semaine (1-12)
- Tableau étudiants avec statuts
- Boutons Présent (vert) / Absent (rouge)
- Export PDF A4
- Réinitialisation des données

---

## 🎨 Design

- Thème ENSA : Bleu foncé (#0B3C5D)
- Animations fluides
- Interface responsive
- Compatible mobile/tablet/desktop

---

## 🐛 Dépannage

### L'export PDF ne fonctionne pas
→ Vérifier la connexion internet  
→ Désactiver les bloqueurs de pop-ups

### Le tableau n'apparaît pas
→ Sélectionner filière ET semaine  
→ Ouvrir la console (F12) pour voir les erreurs

### Connexion refusée
→ Email doit terminer par `@ensa.ma`  
→ Mot de passe minimum 4 caractères

---

## 💡 Astuce

Pour faciliter le lancement, créer un alias bash :

```bash
# macOS / Linux
echo "alias ensa='cd \"/Users/fati/Documents/dev web/app2\" && python3 -m http.server 8000'" >> ~/.zshrc
source ~/.zshrc

# Puis simplement taper :
ensa
```

---

**Bon travail ! 🎉**
