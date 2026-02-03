#!/usr/bin/env bash
# Helper script to create a GitHub repo and push the current workspace.
# Usage: ./push_to_github.sh <github-username> <repo-name>

USER=${1:-fatimazahraeelmharzi-lang}
REPO=${2:-flowtrack-ensa2}

set -e

if command -v gh >/dev/null 2>&1; then
    echo "gh CLI found — creating repo ${USER}/${REPO} and pushing..."
    gh auth status || echo "If not authenticated, run: gh auth login"
    gh repo create "${USER}/${REPO}" --public --source=. --remote=origin --push --confirm
    echo "Done. Repository created and pushed to https://github.com/${USER}/${REPO}"
else
    echo "gh CLI not found. I'll only show the manual commands to run.\n"
    echo "1) Create the repo on GitHub (via website) named: ${REPO} under user: ${USER}"
    echo "2) Then run these commands locally to add the remote and push:" 
    echo "\n   git remote add origin git@github.com:${USER}/${REPO}.git  # or https://github.com/${USER}/${REPO}.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo "\nIf you prefer the script to push using HTTPS and a token, replace the remote URL with the HTTPS URL and use a Personal Access Token for auth."
fi
