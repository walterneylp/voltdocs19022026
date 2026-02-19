#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROFILE="${1:-}"

if [[ -z "$PROFILE" ]]; then
  echo "Uso: ./scripts/use-env.sh [local|remote]"
  exit 1
fi

if [[ "$PROFILE" != "local" && "$PROFILE" != "remote" ]]; then
  echo "Perfil invalido: $PROFILE"
  echo "Use: local ou remote"
  exit 1
fi

if [[ -f "$ROOT_DIR/backend/.env" ]]; then
  cp "$ROOT_DIR/backend/.env" "$ROOT_DIR/backend/.env.backup"
fi
if [[ -f "$ROOT_DIR/frontend/.env" ]]; then
  cp "$ROOT_DIR/frontend/.env" "$ROOT_DIR/frontend/.env.backup"
fi

cp "$ROOT_DIR/backend/.env.$PROFILE" "$ROOT_DIR/backend/.env"
cp "$ROOT_DIR/frontend/.env.$PROFILE" "$ROOT_DIR/frontend/.env"

echo "Ambiente aplicado: $PROFILE"
echo "Arquivos atualizados:"
echo "- backend/.env"
echo "- frontend/.env"
echo "Backups gerados (se havia arquivo anterior):"
echo "- backend/.env.backup"
echo "- frontend/.env.backup"
