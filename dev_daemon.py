#!/usr/bin/env python3
"""Daemon script to keep Next.js dev server alive via double-fork."""
import os
import sys
import time
import subprocess
import signal

PROJECT_DIR = "/home/z/my-project"
LOG_FILE = "/home/z/my-project/dev.log"
PID_FILE = "/home/z/my-project/.zscripts/dev.pid"

def daemonize():
    """Double-fork to detach from terminal."""
    # First fork
    try:
        pid = os.fork()
        if pid > 0:
            sys.exit(0)
    except OSError as e:
        sys.exit(1)

    os.setsid()
    os.umask(0)

    # Second fork
    try:
        pid = os.fork()
        if pid > 0:
            sys.exit(0)
    except OSError as e:
        sys.exit(1)

    # Redirect stdio
    sys.stdout.flush()
    sys.stderr.flush()
    with open(os.devnull, 'r') as f:
        os.dup2(f.fileno(), 0)
    with open(LOG_FILE, 'a') as f:
        os.dup2(f.fileno(), 1)
        os.dup2(f.fileno(), 2)

def main():
    daemonize()
    # Write PID
    os.makedirs(os.path.dirname(PID_FILE), exist_ok=True)
    with open(PID_FILE, 'w') as f:
        f.write(str(os.getpid()))

    # Setup signal handlers
    def cleanup(signum, frame):
        try:
            os.remove(PID_FILE)
        except OSError:
            pass
        sys.exit(0)
    signal.signal(signal.SIGTERM, cleanup)
    signal.signal(signal.SIGINT, cleanup)

    # Keepalive loop
    while True:
        try:
            # Clear dev lock
            lockfile = os.path.join(PROJECT_DIR, ".next/dev/lock")
            if os.path.exists(lockfile):
                try:
                    os.remove(lockfile)
                except OSError:
                    pass

            proc = subprocess.Popen(
                ["node", "node_modules/.bin/next", "dev", "-p", "3000"],
                cwd=PROJECT_DIR,
                stdout=open(LOG_FILE, 'w'),
                stderr=subprocess.STDOUT,
                stdin=subprocess.DEVNULL,
            )
            proc.wait()
            with open(LOG_FILE, 'a') as f:
                f.write(f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] Next dev exited (code {proc.returncode}), restarting in 2s...\n")
        except Exception as e:
            with open(LOG_FILE, 'a') as f:
                f.write(f"\n[ERROR] {e}\n")
        time.sleep(2)

if __name__ == "__main__":
    main()
