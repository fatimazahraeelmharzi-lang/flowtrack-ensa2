#!/bin/bash

# Script de démarrage - Serveur local pour l'application
# Usage: ./start.sh ou bash start.sh

echo "🎓 Démarrage du serveur ENSA Fès - Gestion des Absences"
echo "=================================================="
echo ""
echo "📍 Accéder à l'application sur :"
echo "   http://localhost:8000"
echo ""
echo "✅ Le serveur démarre..."
echo "   Appuyez sur CTRL+C pour arrêter"
echo ""

python3 -m http.server 8000
