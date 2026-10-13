#!/bin/sh
set -e
npx prisma migrate deploy
if [ "${SEED_ON_START:-false}" = "true" ]; then
  npx prisma db seed
fi
exec node server.js
