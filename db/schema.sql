-- Schéma de la base de données pour FlowTrack (PostgreSQL)
CREATE TABLE roles (
    id_role SERIAL PRIMARY KEY,
    libelle VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE groupes (
    id_groupe SERIAL PRIMARY KEY,
    nom_groupe VARCHAR(50) NOT NULL,
    niveau VARCHAR(20)
);

CREATE TABLE utilisateurs (
    id_user SERIAL PRIMARY KEY,
    zk_user_id INT UNIQUE,
    username VARCHAR(100) UNIQUE,
    password_hash TEXT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email_academique VARCHAR(150) UNIQUE,
    id_role INT REFERENCES roles(id_role),
    id_groupe INT REFERENCES groupes(id_groupe)
);

-- Indexes to enforce uniqueness and speed lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_utilisateurs_email ON utilisateurs(email_academique);
CREATE UNIQUE INDEX IF NOT EXISTS idx_utilisateurs_zk ON utilisateurs(zk_user_id);


CREATE TABLE matieres (
    id_matiere SERIAL PRIMARY KEY,
    nom_matiere VARCHAR(100) NOT NULL,
    semestre VARCHAR(2) CHECK (semestre IN ('S1', 'S2'))
);

CREATE TABLE seances (
    id_seance SERIAL PRIMARY KEY,
    id_matiere INT REFERENCES matieres(id_matiere),
    id_professeur INT REFERENCES utilisateurs(id_user),
    id_groupe INT REFERENCES groupes(id_groupe),
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    CHECK (date_fin > date_debut)
);

CREATE TABLE logs_pointage (
    id_log SERIAL PRIMARY KEY,
    id_user INT REFERENCES utilisateurs(id_user) ON DELETE CASCADE,
    date_heure_pointage TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour accélérer les recherches par date
CREATE INDEX idx_logs_timestamp ON logs_pointage(date_heure_pointage);

-- Table de présence (semaine + filière) : évite doublon par (etudiant, filiere, semaine)
CREATE TABLE IF NOT EXISTS presences (
    id_presence SERIAL PRIMARY KEY,
    etudiant_id INT REFERENCES utilisateurs(id_user) ON DELETE CASCADE,
    filiere VARCHAR(100) NOT NULL,
    semaine INT NOT NULL,
    statut VARCHAR(20) CHECK (statut IN ('present','absent','non_renseigne')) DEFAULT 'non_renseigne',
    module VARCHAR(200),
    teacher VARCHAR(200),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (etudiant_id, filiere, semaine)
);

CREATE INDEX IF NOT EXISTS idx_presences_filiere_semaine ON presences(filiere, semaine);
