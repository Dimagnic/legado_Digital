#!/usr/bin/env bash
# Prueba la migración en un Postgres local desechable que imita Supabase.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
DATA="$(mktemp -d)"
chown postgres "$DATA" 2>/dev/null || true
run() { if [ "$(id -u)" = 0 ]; then su postgres -c "$*"; else bash -c "$*"; fi; }
run "$PGBIN/initdb -D $DATA -U postgres >/dev/null"
run "$PGBIN/pg_ctl -D $DATA -o '-p 54329 -k /tmp' -l $DATA/log start >/dev/null"
trap 'run "$PGBIN/pg_ctl -D $DATA stop -m fast >/dev/null"' EXIT
P="psql -h /tmp -p 54329 -U postgres -v ON_ERROR_STOP=1 -q"
$P -f "$DIR/_simular_supabase.sql"
for f in "$DIR"/../migrations/*.sql; do $P -f "$f"; done
$P -f "$DIR/rls_test.sql"
