#!/bin/bash
# ============================================================
# ORGANIZA+ — Deploy em 2 passos
# Execute este script com seu GitHub token
# ============================================================

GITHUB_TOKEN=$1
GITHUB_USER="jessicamarianecosta-dotcom"
REPO_NAME="organiza-plus"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Uso: ./PUSH.sh SEU_GITHUB_TOKEN"
  echo ""
  echo "Gere um token em: https://github.com/settings/tokens/new"
  echo "Permissões necessárias: repo (Full control)"
  exit 1
fi

echo "1. Criando repositório no GitHub..."
curl -s -X POST https://api.github.com/user/repos \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"Organiza+ - SaaS de agendamento profissional\",\"private\":false,\"auto_init\":false}" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('✅ Repo criado:', d.get('html_url', d.get('message','')))"

echo ""
echo "2. Fazendo push do código..."
git remote set-url origin https://$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git 2>/dev/null || \
git remote add origin https://$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git

git push -u origin main

echo ""
echo "✅ Pronto! O Vercel vai detectar o push e fazer deploy automático."
echo "🔗 Acompanhe em: https://vercel.com/jessicamarianecosta-8720s-projects/$REPO_NAME"
