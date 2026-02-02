// Lire les paramètres d'URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        filiere: params.get('filiere'),
        num: params.get('num') ? parseInt(params.get('num')) : null
    };
}

function initDetail() {
    const { filiere, num } = getQueryParams();
    const errorEl = document.getElementById('errorMsg');

    if (!filiere || !num || !window.etudiants || !window.donnees) {
        errorEl.style.display = 'block';
        return;
    }

    const students = etudiants[filiere];
    if (!students) { errorEl.style.display = 'block'; return; }

    const student = students.find(s => s.num === num);
    if (!student) { errorEl.style.display = 'block'; return; }

    document.getElementById('studentName').textContent = `${student.prenom} ${student.nom}`;

    // Statistiques sur 12 semaines
    const totalWeeks = 12;
    let presences = 0;
    let absences = 0;
    const labels = [];
    const statusData = [];

    for (let w = 1; w <= totalWeeks; w++) {
        const key = `${filiere}_${w}_${num}`;
        const val = donnees.absences[key];
        labels.push(`S${w}`);
        if (val === 'present') { presences++; statusData.push(1); }
        else { absences++; statusData.push(0); }

        // Ajouter au tableau détaillé
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>Semaine ${w}</td><td>${val === 'present' ? '<span class="badge present">Présent</span>' : '<span class="badge absent">Absent</span>'}</td>`;
        document.querySelector('#detailTable tbody').appendChild(tr);
    }

    const total = presences + absences;
    const taux = total > 0 ? Math.round((presences / total) * 100) : 0;

    document.getElementById('totalSeances').textContent = total;
    document.getElementById('presences').textContent = presences;
    document.getElementById('absences').textContent = absences;
    document.getElementById('taux').textContent = taux + '%';

    // Charts
    const ctx = document.getElementById('presenceChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Présences', 'Absences'], datasets: [{ data: [presences, absences], backgroundColor: ['#28a745','#dc3545'] }] },
        options: { responsive: true }
    });

    const ctx2 = document.getElementById('evolutionChart').getContext('2d');
    new Chart(ctx2, {
        type: 'bar',
        data: { labels: labels, datasets: [{ label: 'Présence', data: statusData, backgroundColor: statusData.map(s => s ? '#28a745' : '#dc3545') }] },
        options: { responsive: true, scales: { y: { beginAtZero: true, max: 1, ticks: { stepSize: 1 } } } }
    });
}

// Attendre que script.js ait initialisé les données (loadData)
document.addEventListener('DOMContentLoaded', () => {
    // Si sessionStorage n'indique pas de connexion, rediriger vers login
    if (!sessionStorage.getItem('user_logged_in')) {
        window.location.href = 'login.html';
        return;
    }
    // loadData() est asynchrone, donc on attend un court délai puis on initialise
    setTimeout(initDetail, 200);
});