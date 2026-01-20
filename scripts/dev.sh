#!/bin/bash
set -e

BRANCH="$(git branch --show-current)"
if [ "$BRANCH" = "main" ]; then
  echo "ERRO: você está no main. Troque para dev ou crie uma branch de tarefa."
  exit 1
fi

git status -sb

read -p 'Mensagem do commit (feat:/fix:/refactor:/chore:/docs:): ' MSG
git add -A

echo "----- DIFF (resumo) -----"
git diff --cached --stat
echo "-------------------------"

git commit -m "$MSG"
git push
echo "OK: commit + push em $BRANCH"
