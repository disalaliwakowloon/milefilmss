#!/bin/bash
cd /home/z/my-project
while true; do
  rm -f .next/dev/lock 2>/dev/null
  node node_modules/.bin/next dev -p 3000 > /home/z/my-project/dev.log 2>&1
  echo "[$(date)] Next dev exited, restarting in 2s..." >> /home/z/my-project/dev.log
  sleep 2
done
