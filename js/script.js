/* ===========================
   DONNÉES ÉTUDIANTS
   =========================== */

const etudiants = {
    isdia: [
        { num: 1, nom: "IBRAHIM", prenom: "Ahmed" },
        { num: 2, nom: "HASSAN", prenom: "Sara" },
        { num: 3, nom: "KHAN", prenom: "Youssef" },
        { num: 4, nom: "FARRAH", prenom: "Imane" },
        { num: 5, nom: "MALIK", prenom: "Omar" }
    ],
    ilia: [
        { num: 1, nom: "BEN ALI", prenom: "Aya" },
        { num: 2, nom: "HAMZA", prenom: "Hamza" },
        { num: 3, nom: "NOUR", prenom: "Nour" },
        { num: 4, nom: "REDA", prenom: "Reda" },
        { num: 5, nom: "SALME", prenom: "Salma" }
    ],
    info: [
        { num: 1, nom: "ANAS", prenom: "Anas" },
        { num: 2, nom: "KHADIJA", prenom: "Khadija" },
        { num: 3, nom: "BILAL", prenom: "Bilal" },
        { num: 4, nom: "MERYEM", prenom: "Meryem" },
        { num: 5, nom: "HICHAM", prenom: "Hicham" }
    ],
    logiciel: [
        { num: 1, nom: "RANIA", prenom: "Rania" },
        { num: 2, nom: "YASSINE", prenom: "Yassine" },
        { num: 3, nom: "AMINE", prenom: "Amine" },
        { num: 4, nom: "HAJAR", prenom: "Hajar" },
        { num: 5, nom: "SOUFIANE", prenom: "Soufiane" }
    ],
    cyber: [
        { num: 1, nom: "ZINEB", prenom: "Zineb" },
        { num: 2, nom: "MEHDI", prenom: "Mehdi" },
        { num: 3, nom: "IKRAM", prenom: "Ikram" },
        { num: 4, nom: "FOUAD", prenom: "Fouad" },
        { num: 5, nom: "LINA", prenom: "Lina" }
    ]
};

// ===========================
// STOCKAGE DES DONNÉES
// ===========================

const donnees = {
    absences: {} // Structure: { "filiere_semaine_num": "present|absent" }
};

// ===========================
// FONCTIONS INITIALISATION
// ===========================

/**
 * Initialiser l'application au chargement de la page
 */
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier l'authentification sur la page gestion
    if (window.location.pathname.includes('gestion.html')) {
        if (!sessionStorage.getItem('user_logged_in')) {
            window.location.href = 'login.html';
        }
        initializeWeeks();
    }

    // Initialiser le formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

/**
 * Initialiser les semaines disponibles
 */
function initializeWeeks() {
    const semaineSelect = document.getElementById('semaineSelect');
    if (semaineSelect) {
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Semaine ${i}`;
            semaineSelect.appendChild(option);
        }
    }
}

// ===========================
// AUTHENTIFICATION
// ===========================

/**
 * Gérer la connexion de l'utilisateur
 */
function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Validation simple
    if (!email.endsWith('@ensa.ma')) {
        errorMessage.textContent = '❌ L\'email doit se terminer par @ensa.ma';
        errorMessage.style.display = 'block';
        return;
    }

    if (password.length < 4) {
        errorMessage.textContent = '❌ Le mot de passe doit contenir au moins 4 caractères';
        errorMessage.style.display = 'block';
        return;
    }

    // Authentification réussie
    errorMessage.style.display = 'none';
    sessionStorage.setItem('user_logged_in', 'true');
    sessionStorage.setItem('user_email', email);

    // Redirection après 500ms
    setTimeout(() => {
        window.location.href = 'gestion.html';
    }, 500);
}

/**
 * Déconnexion
 */
function logout() {
    sessionStorage.removeItem('user_logged_in');
    sessionStorage.removeItem('user_email');
    window.location.href = 'index.html';
}

// ===========================
// GESTION DES ABSENCES
// ===========================

/**
 * Charger les étudiants de la filière sélectionnée
 */
function loadStudents() {
    const filiere = document.getElementById('filiereSelect').value;
    const semaineSelect = document.getElementById('semaineSelect');

    // Réinitialiser la semaine
    semaineSelect.value = '';

    if (!filiere) {
        document.getElementById('tableContainer').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
        return;
    }

    updateTableau();
}

/**
 * Mettre à jour le tableau des absences
 */
function updateTableau() {
    const filiere = document.getElementById('filiereSelect').value;
    const semaine = document.getElementById('semaineSelect').value;
    const tableContainer = document.getElementById('tableContainer');
    const emptyState = document.getElementById('emptyState');

    if (!filiere || !semaine) {
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    // Afficher le tableau
    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';

    // Remplir le tableau
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    const students = etudiants[filiere];
    students.forEach(student => {
        const row = document.createElement('tr');
        const key = `${filiere}_${semaine}_${student.num}`;
        const status = donnees.absences[key] || '';

        row.innerHTML = `
            <td class="numero-col">${String(student.num).padStart(2, '0')}</td>
            <td class="nom-col">${student.nom}</td>
            <td class="prenom-col">${student.prenom}</td>
            <td>
                <div class="status-buttons">
                    <button class="status-btn ${status === 'present' ? 'present' : ''}" 
                            onclick="setStatus('${filiere}', ${semaine}, ${student.num}, 'present')">
                        ✓ Présent
                    </button>
                    <button class="status-btn ${status === 'absent' ? 'absent' : ''}" 
                            onclick="setStatus('${filiere}', ${semaine}, ${student.num}, 'absent')">
                        ✗ Absent
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Appliquer les styles
    applyStatusStyles();
}

/**
 * Définir le statut d'un étudiant
 */
function setStatus(filiere, semaine, num, status) {
    const key = `${filiere}_${semaine}_${num}`;
    donnees.absences[key] = status;

    // Mettre à jour SessionStorage
    sessionStorage.setItem('donnees', JSON.stringify(donnees));

    // Mettre à jour les boutons visuels
    updateTableau();
    
    // Mettre à jour les statistiques
    if (typeof updateStatistics === 'function') {
        updateStatistics();
    }
}

/**
 * Appliquer les styles aux boutons de statut
 */
function applyStatusStyles() {
    const buttons = document.querySelectorAll('.status-btn');
    buttons.forEach(btn => {
        if (btn.classList.contains('present') || btn.classList.contains('absent')) {
            btn.style.cursor = 'pointer';
        } else {
            btn.style.cursor = 'pointer';
            btn.style.opacity = '0.7';
        }
    });
}

/**
 * Réinitialiser les données de la semaine actuelle
 */
function resetData() {
    const filiere = document.getElementById('filiereSelect').value;
    const semaine = document.getElementById('semaineSelect').value;

    if (!filiere || !semaine) {
        alert('Veuillez sélectionner une filière et une semaine');
        return;
    }

    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les statuts de cette semaine ?')) {
        const students = etudiants[filiere];
        students.forEach(student => {
            const key = `${filiere}_${semaine}_${student.num}`;
            delete donnees.absences[key];
        });
        updateTableau();
    }
}

// ===========================
// EXPORT PDF
// ===========================

/**
 * Exporter le tableau en PDF
 */
function exportToPDF() {
    const filiere = document.getElementById('filiereSelect').value;
    const semaine = document.getElementById('semaineSelect').value;

    if (!filiere || !semaine) {
        alert('Veuillez sélectionner une filière et une semaine avant d\'exporter');
        return;
    }

    // Récupérer le tableau
    const table = document.getElementById('attendanceTable');
    const filiereLabel = document.getElementById('filiereSelect').options[document.getElementById('filiereSelect').selectedIndex].text;

    // Créer un conteneur temporaire pour le PDF
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.backgroundColor = '#FFFFFF';

    // En-tête du PDF
    const header = document.createElement('div');
    header.style.marginBottom = '20px';
    header.style.borderBottom = '2px solid #0B3C5D';
    header.style.paddingBottom = '15px';

    const title = document.createElement('h1');
    title.textContent = 'ENSA Fès - Rapport de Présence';
    title.style.color = '#0B3C5D';
    title.style.marginBottom = '10px';

    const details = document.createElement('p');
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    details.innerHTML = `
        <strong>Filière :</strong> ${filiereLabel}<br>
        <strong>Semaine :</strong> ${semaine}<br>
        <strong>Date :</strong> ${dateStr}
    `;
    details.style.color = '#2C3E50';
    details.style.fontSize = '14px';

    header.appendChild(title);
    header.appendChild(details);
    element.appendChild(header);

    // Clone du tableau
    const tableClone = table.cloneNode(true);
    element.appendChild(tableClone);

    // Options pour html2pdf
    const options = {
        margin: 10,
        filename: `presence_${filiereLabel}_semaine${semaine}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    // Générer et télécharger le PDF
    html2pdf().set(options).from(element).save();
}

// ===========================
// IMPRESSION NAVIGATEUR
// ===========================

/**
 * Utiliser la fonction d'impression du navigateur
 */
function printPDF() {
    window.print();
}
