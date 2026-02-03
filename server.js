const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Optional: use PG if DATABASE_URL is provided
let pgClient = null;
if (process.env.DATABASE_URL) {
    try {
        const { Client } = require('pg');
        const bcrypt = require('bcrypt');
        pgClient = new Client({ connectionString: process.env.DATABASE_URL });
        pgClient.connect()
            .then(async () => {
                console.log('Connected to Postgres');
                // Ensure minimal schema adjustments (columns / tables / roles)
                try {
                    // Apply main schema file if present (db/schema.sql)
                    try {
                        const schemaSql = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
                        // split statements by semicolon and run sequentially
                        const stmts = schemaSql.split(/;\s*\n/);
                        for (const s of stmts) {
                            const stmt = s.trim();
                            if (!stmt) continue;
                            try { await pgClient.query(stmt); } catch (e) { /* ignore individual statement failures */ }
                        }
                        console.log('Applied DB schema file (best-effort)');
                    } catch (e) { console.warn('No schema file applied:', e.message); }

                    // add username/password_hash if missing
                    await pgClient.query("ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE");
                    await pgClient.query("ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS password_hash TEXT");

                    // ensure roles exist
                    await pgClient.query("INSERT INTO roles(libelle) VALUES($1) ON CONFLICT (libelle) DO NOTHING", ['student']);
                    await pgClient.query("INSERT INTO roles(libelle) VALUES($1) ON CONFLICT (libelle) DO NOTHING", ['teacher']);

                    // Create default teacher account if not exists
                    const res = await pgClient.query("SELECT id_user FROM utilisateurs WHERE username=$1", ['professeur']);
                    if (res.rowCount === 0) {
                        const hash = await bcrypt.hash('ensa2024', 10);
                        // get teacher role id
                        const r = await pgClient.query("SELECT id_role FROM roles WHERE libelle=$1", ['teacher']);
                        const roleId = r.rows[0] ? r.rows[0].id_role : null;
                        await pgClient.query(`INSERT INTO utilisateurs(username, password_hash, nom, prenom, email_academique, id_role) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`, ['professeur', hash, 'Ahmed', 'Aberqi', 'professeur@usmba.ac.ma', roleId]);
                        console.log('Default teacher account ensured (username: professeur / password: ensa2024)');
                    }
                } catch (e) { console.error('Error during PG setup:', e); }
            })
            .catch(err => console.error('PG connect error', err));
    } catch (err) {
        console.warn('pg module not available or failed to initialize:', err.message);
    }
}

// Ensure data folder exists for fallback storage
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const studentsFile = path.join(dataDir, 'students.json');
if (!fs.existsSync(studentsFile)) fs.writeFileSync(studentsFile, JSON.stringify([]));

function serveStatic(filePath, res) {
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    switch (ext) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpeg'; break;
        case '.svg': contentType = 'image/svg+xml'; break;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

async function handleApiSignup(req, res) {
    try {
        let body = '';
        for await (const chunk of req) body += chunk;
        const payload = JSON.parse(body || '{}');

        // Basic validation
        const { nom, prenom, email_academique, num, filiere, deviceId } = payload;
        if (!nom || !prenom || !email_academique) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing fields' }));
            return;
        }
        if (!email_academique.endsWith('@usmba.ac.ma')) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Email must be an academic address (usmba.ac.ma)' }));
            return;
        }

        // If Postgres is available, insert there
        if (pgClient) {
            await pgClient.query('BEGIN');
            try {
                // Ensure student role exists
                const roleRes = await pgClient.query("INSERT INTO roles(libelle) VALUES($1) ON CONFLICT (libelle) DO UPDATE SET libelle=EXCLUDED.libelle RETURNING id_role", ['student']);
                const roleId = roleRes.rows[0].id_role;

                let groupId = null;
                if (filiere) {
                    const grpRes = await pgClient.query("INSERT INTO groupes(nom_groupe) VALUES($1) ON CONFLICT (nom_groupe) DO UPDATE SET nom_groupe=EXCLUDED.nom_groupe RETURNING id_groupe", [filiere]);
                    groupId = grpRes.rows[0].id_groupe;
                }

                // Prevent duplicates by email or device id
                const dup = await pgClient.query('SELECT id_user FROM utilisateurs WHERE email_academique=$1 OR zk_user_id=$2', [email_academique, deviceId || null]);
                if (dup.rowCount) {
                    await pgClient.query('COMMIT');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true, message: 'Account already exists' }));
                    return;
                }

                const insertUser = await pgClient.query(
                    `INSERT INTO utilisateurs(zk_user_id, nom, prenom, email_academique, id_role, id_groupe)
                     VALUES($1,$2,$3,$4,$5,$6) RETURNING id_user, nom, prenom, email_academique, zk_user_id`,
                    [num || deviceId || null, nom, prenom, email_academique, roleId, groupId]
                );
                await pgClient.query('COMMIT');

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, student: insertUser.rows[0] }));
                return;
            } catch (e) {
                await pgClient.query('ROLLBACK');
                throw e;
            }
        }

        // Fallback: save to local JSON file
        const students = JSON.parse(fs.readFileSync(studentsFile));
        const exists = students.find(s => s.email_academique === email_academique || (deviceId && s.deviceId === deviceId));
        if (exists) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, message: 'Account already exists' }));
            return;
        }
        const newStudent = { id: Date.now(), nom, prenom, email_academique, num: num || null, filiere: filiere || null, deviceId: deviceId || null };
        students.push(newStudent);
        fs.writeFileSync(studentsFile, JSON.stringify(students, null, 2));

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, student: newStudent }));
    } catch (err) {
        console.error('Signup error', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal error' }));
    }
}

function handleApiGetStudent(req, res, query) {
    const email = query.email;
    if (!email) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'email query param required' }));
        return;
    }

    if (pgClient) {
        pgClient.query('SELECT id_user, nom, prenom, email_academique, zk_user_id AS num FROM utilisateurs WHERE email_academique=$1', [email])
            .then(r => {
                if (r.rows.length === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Not found' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(r.rows[0]));
                }
            }).catch(err => {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'DB error' }));
            });
        return;
    }

    const students = JSON.parse(fs.readFileSync(studentsFile));
    const s = students.find(x => x.email_academique === email);
    if (!s) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(s));
}

// API handlers
async function handleApiLogin(req, res) {
    try {
        let body = '';
        for await (const chunk of req) body += chunk;
        const payload = JSON.parse(body || '{}');
        const { username, password } = payload;
        if (!username || !password) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'username and password required' }));
            return;
        }
        // If Postgres available, verify
        if (pgClient) {
            const bcrypt = require('bcrypt');
            const r = await pgClient.query('SELECT id_user, username, password_hash, nom, prenom, id_role FROM utilisateurs WHERE username=$1', [username]);
            if (r.rowCount === 0) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid credentials' }));
                return;
            }
            const u = r.rows[0];
            const ok = await bcrypt.compare(password, u.password_hash || '');
            if (!ok) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid credentials' }));
                return;
            }
            // Build a minimal modules mapping (store teacher modules in a simple object if you want)
            let modules = {};
            // For simplicity send back a module mapping placeholder; adapt later to load actual modules
            modules = { isdia: ['Analyse', 'Algèbre'], info: ['Algèbre'] };
            sessionSafeResponse(res, 200, { ok: true, id_user: u.id_user, username: u.username, name: (u.nom + ' ' + u.prenom).trim(), modules });
            return;
        }
        // Fallback: accept local hardcoded user 'professeur' with password 'ensa2024'
        if (username === 'professeur' && password === 'ensa2024') {
            sessionSafeResponse(res, 200, { ok: true, username: 'professeur', name: 'Ahmed Aberqi', modules: { isdia: ['Analyse', 'Algèbre'] } });
            return;
        }
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
    } catch (e) {
        console.error('Login error', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
    }
}

async function handleApiGetStudents(req, res, query) {
    try {
        const filiere = query.filiere;
        if (pgClient) {
            const q = `SELECT u.id_user AS id, u.nom, u.prenom, u.email_academique, u.zk_user_id AS num, g.nom_groupe AS filiere
                       FROM utilisateurs u LEFT JOIN groupes g ON u.id_groupe = g.id_groupe
                       WHERE u.id_role = (SELECT id_role FROM roles WHERE libelle = 'student')` + (filiere ? ' AND g.nom_groupe=$1' : '');
            const params = filiere ? [filiere] : [];
            const r = await pgClient.query(q, params);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(r.rows));
            return;
        }
        const students = JSON.parse(fs.readFileSync(studentsFile));
        const out = filiere ? students.filter(s => s.filiere === filiere) : students;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(out));
    } catch (e) {
        console.error('Get students error', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
    }
}

async function handleApiPostPresence(req, res) {
    try {
        let body = '';
        for await (const chunk of req) body += chunk;
        const payload = JSON.parse(body || '{}');
        const { etudiant_id, filiere, semaine, statut, module, teacher } = payload;
        if (!etudiant_id || !filiere || !semaine || !statut) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing fields' }));
            return;
        }
        if (pgClient) {
            await pgClient.query(`INSERT INTO presences (etudiant_id, filiere, semaine, statut, module, teacher, updated_at)
                                  VALUES($1,$2,$3,$4,$5,$6,NOW())
                                  ON CONFLICT (etudiant_id, filiere, semaine) DO UPDATE SET statut=EXCLUDED.statut, module=EXCLUDED.module, teacher=EXCLUDED.teacher, updated_at=NOW()`,
                                 [etudiant_id, filiere, semaine, statut, module || null, teacher || null]);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
            return;
        }
        // Fallback: write to local donnees_global.json
        const dg = path.join(dataDir, 'donnees_global.json');
        let g = { absences: {} };
        try { g = JSON.parse(fs.readFileSync(dg)); } catch (e) {}
        const key = `${filiere}_${semaine}_${etudiant_id}`;
        g.absences[key] = { statut, module: module || undefined, teacher: teacher || undefined };
        fs.writeFileSync(dg, JSON.stringify(g, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
    } catch (e) {
        console.error('Post presence error', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
    }
}

async function handleApiGetPresences(req, res, query) {
    try {
        const filiere = query.filiere;
        const semaine = query.semaine ? parseInt(query.semaine) : null;
        if (pgClient) {
            const conditions = [];
            const params = [];
            let idx = 1;
            let q = `SELECT p.etudiant_id AS id, p.filiere, p.semaine, p.statut, p.module, p.teacher, u.nom, u.prenom, u.email_academique FROM presences p JOIN utilisateurs u ON p.etudiant_id = u.id_user`;
            if (filiere) { conditions.push(`p.filiere = $${idx++}`); params.push(filiere); }
            if (semaine) { conditions.push(`p.semaine = $${idx++}`); params.push(semaine); }
            if (conditions.length) q += ' WHERE ' + conditions.join(' AND ');
            const r = await pgClient.query(q, params);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(r.rows));
            return;
        }
        // Fallback to read local donnees_global.json
        const dg = path.join(dataDir, 'donnees_global.json');
        let g = { absences: {} };
        try { g = JSON.parse(fs.readFileSync(dg)); } catch (e) {}
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(g));
    } catch (e) {
        console.error('Get presences error', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
    }
}

function sessionSafeResponse(res, status, payload) {
    // minimal wrapper to send JSON
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);
    // API routes
    if (parsed.pathname === '/api/signup' && req.method === 'POST') {
        handleApiSignup(req, res);
        return;
    }
    if (parsed.pathname === '/api/login' && req.method === 'POST') {
        handleApiLogin(req, res);
        return;
    }
    if (parsed.pathname === '/api/students' && req.method === 'GET') {
        handleApiGetStudents(req, res, parsed.query);
        return;
    }
    if (parsed.pathname === '/api/presence' && req.method === 'POST') {
        handleApiPostPresence(req, res);
        return;
    }
    if (parsed.pathname === '/api/presences' && req.method === 'GET') {
        handleApiGetPresences(req, res, parsed.query);
        return;
    }
    if (parsed.pathname === '/api/student' && req.method === 'GET') {
        handleApiGetStudent(req, res, parsed.query);
        return;
    }

    // Serve static files (existing behavior)
    let filePath = path.join(__dirname, parsed.pathname === '/' ? 'gestion.html' : parsed.pathname);
    if (parsed.pathname === '/') filePath = path.join(__dirname, 'gestion.html');
    // If the path is a directory, try index.html
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    serveStatic(filePath, res);
});

server.listen(3005, () => {
    console.log('Server running at http://localhost:3005');
});