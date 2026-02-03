# Script PowerShell pour surveiller l'insertion de clé USB et traiter les fichiers .dat

# Fonction pour traiter un fichier .dat
function Process-DatFile {
    param([string]$filePath, [string]$filiere)

    $lines = Get-Content $filePath
    $importedCount = 0
    $invalidCount = 0

    # Charger les données existantes
    $dataFile = "C:\Users\aya-e\OneDrive\Documents\APP2\DONNEES.json"
    if (Test-Path $dataFile) {
        $donnees = Get-Content $dataFile -Raw | ConvertFrom-Json
    } else {
        $donnees = @{
            absences = @{}
        }
    }

    # Étudiants par filière (copié du script.js)
    $etudiants = @{
        isdia = @(
            @{ num = 1; nom = "IBRAHIM"; prenom = "Ahmed" },
            @{ num = 2; nom = "HASSAN"; prenom = "Sara" },
            @{ num = 3; nom = "KHAN"; prenom = "Youssef" },
            @{ num = 4; nom = "FARRAH"; prenom = "Imane" },
            @{ num = 5; nom = "MALIK"; prenom = "Omar" }
        )
        ilia = @(
            @{ num = 1; nom = "BEN ALI"; prenom = "Aya" },
            @{ num = 2; nom = "HAMZA"; prenom = "Hamza" },
            @{ num = 3; nom = "NOUR"; prenom = "Nour" },
            @{ num = 4; nom = "REDA"; prenom = "Reda" },
            @{ num = 5; nom = "SALME"; prenom = "Salma" }
        )
        info = @(
            @{ num = 1; nom = "ANAS"; prenom = "Anas" },
            @{ num = 2; nom = "KHADIJA"; prenom = "Khadija" },
            @{ num = 3; nom = "BILAL"; prenom = "Bilal" },
            @{ num = 4; nom = "MERYEM"; prenom = "Meryem" },
            @{ num = 5; nom = "HICHAM"; prenom = "Hicham" }
        )
        logiciel = @(
            @{ num = 1; nom = "RANIA"; prenom = "Rania" },
            @{ num = 2; nom = "YASSINE"; prenom = "Yassine" },
            @{ num = 3; nom = "AMINE"; prenom = "Amine" },
            @{ num = 4; nom = "HAJAR"; prenom = "Hajar" },
            @{ num = 5; nom = "SOUFIANE"; prenom = "Soufiane" }
        )
        cyber = @(
            @{ num = 1; nom = "ZINEB"; prenom = "Zineb" },
            @{ num = 2; nom = "MEHDI"; prenom = "Mehdi" },
            @{ num = 3; nom = "IKRAM"; prenom = "Ikram" },
            @{ num = 4; nom = "FOUAD"; prenom = "Fouad" },
            @{ num = 5; nom = "LINA"; prenom = "Lina" }
        )
    }

    foreach ($line in $lines) {
        $line = $line.Trim()
        if ($line -eq "") { continue }

        $parts = $line -split ','
        if ($parts.Length -lt 4) {
            $invalidCount++
            continue
        }

        $userId = $parts[0].Trim()
        $dateStr = $parts[1].Trim()
        $timeStr = $parts[2].Trim()
        $punchType = $parts[3].Trim()

        # Vérifier si c'est un check-in
        if ($punchType -ne '1') { continue }

        # Vérifier si l'utilisateur existe
        $student = $etudiants[$filiere] | Where-Object { $_.num -eq [int]$userId }
        if (-not $student) {
            $invalidCount++
            continue
        }

        # Calculer la semaine
        $date = [DateTime]::Parse("$dateStr $timeStr")
        $weekOfYear = Get-WeekOfYear $date

        # Marquer comme présent
        $key = "${filiere}_${weekOfYear}_$($student.num)"
        $donnees.absences[$key] = "present"
        $importedCount++
    }

    # Sauvegarder
    $donnees | ConvertTo-Json | Set-Content $dataFile -Encoding UTF8

    Write-Host "Traitement terminé: $importedCount présences importées, $invalidCount enregistrements invalides ignorés."
}

# Fonction pour obtenir le numéro de semaine
function Get-WeekOfYear {
    param([DateTime]$date)

    $start = New-Object DateTime $date.Year, 1, 1
    $diff = ($date - $start).TotalDays
    $dayOfYear = [Math]::Floor($diff)
    return [Math]::Floor($dayOfYear / 7) + 1
}

# Fonction pour traiter les fichiers .dat sur une clé USB
function Process-USBDrive {
    param([string]$driveLetter)

    $datFiles = Get-ChildItem "$driveLetter\*.dat" -Recurse
    if ($datFiles.Count -eq 0) {
        Write-Host "Aucun fichier .dat trouvé sur $driveLetter"
        return
    }

    # Pour chaque filière, traiter si des fichiers existent
    $filieres = @("isdia", "ilia", "info", "logiciel", "cyber")

    foreach ($filiere in $filieres) {
        $filiereFiles = $datFiles | Where-Object { $_.Name -like "*$filiere*" }
        if ($filiereFiles) {
            foreach ($file in $filiereFiles) {
                Write-Host "Traitement du fichier: $($file.FullName) pour filière $filiere"
                Process-DatFile $file.FullName $filiere
            }
        }
    }
}

# Surveiller l'insertion de clé USB
$query = "SELECT * FROM Win32_VolumeChangeEvent WHERE EventType = 2"  # 2 = insertion

Register-WmiEvent -Query $query -Action {
    $driveLetter = $Event.SourceEventArgs.NewEvent.DriveName
    if ($driveLetter) {
        Write-Host "Clé USB insérée: $driveLetter"
        Start-Job -ScriptBlock ${function:Process-USBDrive} -ArgumentList $driveLetter
    }
}

Write-Host "Surveillance des clés USB démarrée. Appuyez sur Ctrl+C pour arrêter."

# Garder le script en cours
while ($true) {
    Start-Sleep -Seconds 1
}