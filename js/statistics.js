/* ===========================
   GESTION DES STATISTIQUES
   =========================== */

// Variable globale pour le graphique
let attendanceChart = null;

/**
 * Initialiser le graphique au chargement de la page
 */
function initChart() {
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;

    attendanceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Présents', 'Absents'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    '#27AE60', // Vert pour présents
                    '#E74C3C'  // Rouge pour absents
                ],
                borderColor: ['#FFFFFF', '#FFFFFF'],
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 14, weight: 'bold' },
                        padding: 20,
                        color: '#2C3E50'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Mettre à jour les statistiques
 */
function updateStatistics() {
    const filiereSelect = document.getElementById('filiereSelect');
    const semaineSelect = document.getElementById('semaineSelect');
    const statisticsContainer = document.getElementById('statisticsContainer');
    const tableContainer = document.getElementById('tableContainer');

    // Vérifier si une filière et une semaine sont sélectionnées
    if (!filiereSelect.value || !semaineSelect.value) {
        statisticsContainer.style.display = 'none';
        return;
    }

    // Récupérer les données
    const filiere = filiereSelect.value;
    const semaine = semaineSelect.value;

    // Calculer les statistiques
    const stats = calculateStatistics(filiere, semaine, {});

    // Vérifier que le tableau a des données
    const tableBody = document.getElementById('tableBody');
    const hasData = tableBody && tableBody.children.length > 0;

    if (!hasData) {
        statisticsContainer.style.display = 'none';
        return;
    }

    // Afficher la section statistiques
    statisticsContainer.style.display = 'block';

    // Mettre à jour les cartes
    updateStatisticsCards(stats);

    // Mettre à jour le graphique
    updateChart(stats);
}

/**
 * Calculer les statistiques pour une filière et une semaine
 */
function calculateStatistics(filiere, semaine, absenceData) {
    let totalStudents = 0;
    let presentCount = 0;
    let absentCount = 0;

    // Récupérer les données depuis sessionStorage
    const donnees = JSON.parse(sessionStorage.getItem('donnees') || '{"absences":{}}');
    
    console.log('Données récupérées:', donnees);
    console.log('Filière:', filiere, 'Semaine:', semaine);
    
    // Parcourir toutes les absences pour la filière et semaine sélectionnées
    for (const key in donnees.absences) {
        // Format de la clé: filiere_semaine_num
        const parts = key.split('_');
        const keyFiliere = parts[0];
        const keySemaine = parts[1];
        
        if (keyFiliere === filiere && keySemaine === semaine) {
            totalStudents++;
            const rawStatus = donnees.absences[key];
            const status = (rawStatus && typeof rawStatus === 'string') ? rawStatus : (rawStatus && rawStatus.statut ? rawStatus.statut : rawStatus);
            console.log(`${key}: ${status}`);
            
            if (status === 'present') {
                presentCount++;
            } else if (status === 'absent') {
                absentCount++;
            }
        }
    }

    console.log('Résultat:', { totalStudents, presentCount, absentCount });

    // Calculer le pourcentage de présence
    const percentagePresent = totalStudents > 0 
        ? ((presentCount / totalStudents) * 100).toFixed(1)
        : 0;

    return {
        totalStudents,
        presentCount,
        absentCount,
        percentagePresent
    };
}

/**
 * Mettre à jour les cartes de statistiques
 */
function updateStatisticsCards(stats) {
    const totalStudentsEl = document.getElementById('totalStudents');
    const totalPresentEl = document.getElementById('totalPresent');
    const totalAbsentEl = document.getElementById('totalAbsent');
    const percentagePresentEl = document.getElementById('percentagePresent');

    // Mettre à jour directement sans animation
    totalStudentsEl.textContent = stats.totalStudents;
    totalPresentEl.textContent = stats.presentCount;
    totalAbsentEl.textContent = stats.absentCount;
    percentagePresentEl.textContent = stats.percentagePresent + '%';
}

/**
 * Animer les nombres (effet de comptage)
 */
function animateNumbers() {
    const cards = document.querySelectorAll('.stat-value');
    cards.forEach(card => {
        const finalValue = parseInt(card.textContent);
        let currentValue = 0;
        const increment = Math.ceil(finalValue / 20);

        const interval = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                card.textContent = finalValue;
                clearInterval(interval);
            } else {
                card.textContent = currentValue;
            }
        }, 30);
    });
}

/**
 * Mettre à jour le graphique
 */
function updateChart(stats) {
    if (!attendanceChart) return;

    attendanceChart.data.datasets[0].data = [
        stats.presentCount,
        stats.absentCount
    ];

    attendanceChart.update('active');
}

/**
 * Initialiser les événements
 */
function initStatisticsEvents() {
    const filiereSelect = document.getElementById('filiereSelect');

    // Mettre à jour les statistiques lors du changement de filière
    if (filiereSelect) {
        filiereSelect.addEventListener('change', function() {
            if (this.value && document.getElementById('semaineSelect').value) {
                updateStatistics();
            }
        });
    }
}

// Initialiser au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    initChart();
    initStatisticsEvents();
});
