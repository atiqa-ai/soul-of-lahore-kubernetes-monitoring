# Soul of Lahore

> A cinematic, interactive journey through Lahore's greatest landmarks — 12 destinations, 7 cinematic zones each, 84 stories told through video, photography, 3D, and sound.

Built with **Next.js 14** (App Router), **Three.js**, **GSAP**, **Lenis**, **Tailwind CSS**, and **Supabase** (reviews), and shipped as a production Docker image.

![stack](https://img.shields.io/badge/Next.js-14-black) ![docker](https://img.shields.io/badge/Docker-ready-blue)

---

## Table of contents

1. [Quick start](#quick-start)
2. [Manual Docker commands](#manual-docker-commands)
3. [How auto-start works](#how-auto-start-works)
4. [Monitoring](#monitoring)
5. [Environment variables](#environment-variables)
6. [Project structure](#project-structure)
7. [Docker setup details](#docker-setup-details)
8. [Useful commands](#useful-commands)
9. [Troubleshooting](#troubleshooting)

---

## Quick start

### Prerequisites

- **Docker Desktop** for Windows (with the WSL2 backend) or a Linux Docker engine.
- **Docker Compose v2** (bundled with Docker Desktop).
- Git (to clone). Node.js is **not** required to run the container — only to develop.

### 1. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Supabase URL and anon key (see [Environment variables](#environment-variables)).

> The helper scripts auto-create `.env.local` from `.env.example` if it is missing.

### 2. Start the stack

From the project root, using Git Bash / WSL:

```bash
./start.sh
```

Or on Windows PowerShell:

```powershell
.\start.ps1
```

The first run builds the image (takes a few minutes) and then starts the containers.

### 3. Access the app

| What            | URL                                            |
|-----------------|------------------------------------------------|
| Soul of Lahore  | <http://localhost:3000>                        |
| Health check    | <http://localhost:3000/api/health>             |
| Portainer (GUI) | <http://localhost:9000> (create admin on first visit) |

---

## Manual Docker commands

If you prefer to drive Docker directly:

```bash
# Build the image
docker compose --env-file .env.local build

# Start the stack (builds on first run)
docker compose --env-file .env.local up -d

# Stop the stack (keeps volumes)
docker compose down

# View status
docker compose ps

# Tail the app logs
docker compose logs -f soul-of-lahore

# Restart a single service
docker compose restart soul-of-lahore

# Live resource usage
docker stats
```

---

## How auto-start works

The stack is configured with:

```yaml
restart: unless-stopped
```

This tells the Docker engine to automatically restart the containers whenever the
daemon comes up — with one rule: **if a container was already manually stopped
before shutdown, it is not restarted.**

So the intended workflow for a laptop is:

1. `.\start.ps1` **once** — containers are now running.
2. Just **shut down / restart the PC** whenever you're done.
3. On next boot the containers come back up **automatically**.

To make this fully hands-free on Windows:

- Docker Desktop → Settings → General → enable **"Start Docker Desktop when you sign in"**.

⚠️ Do **not** run `stop.sh` / `.\stop.ps1` if you rely on auto-start — that marks the
containers as stopped and they will no longer auto-restart until you start them again.

---

## Monitoring

Two layers are included out of the box:

### 1. Portainer (web GUI)

A lightweight GUI for container health, logs, resource usage, and image/volume
management.

- Open <http://localhost:9000>.
- On first visit, create an admin account and password.
- Connect the **local Docker** environment when prompted — Portainer uses the
  Docker Engine socket, so you'll see the `soul-of-lahore` container and its live
  CPU / memory / network graphs immediately.

> **Windows note:** Portainer connects via the Docker Desktop named pipe
> (`\\.\pipe\docker_engine`), configured with the `npipe` mount in
> `docker-compose.yml`. On native Linux, replace that mount with
> `- /var/run/docker.sock:/var/run/docker.sock`.

### 2. Built-in health checks

The app container exposes a health endpoint (`/api/health`) and a Docker
`healthcheck`. Check status with:

```bash
docker inspect --format='{{.State.Health.Status}}' soul-of-lahore
# -> healthy | starting | unhealthy
```

For quick resource monitoring in a terminal:

```bash
docker stats
```

---

## Environment variables

| Variable                       | Needed at    | Purpose                                    | Secret? |
|--------------------------------|--------------|--------------------------------------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL`     | build + run  | Supabase project URL                       | No      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| build + run  | Supabase publishable anon key              | No*     |

\* `NEXT_PUBLIC_*` values are exposed to the browser by design (Next.js inlines
them into the client bundle). **Never** put the Supabase `service_role` key in
`.env.local` or anywhere in the repo.

- Values are read from **`.env.local`** (gitignored — never committed).
- The scripts pass it to Docker Compose with `--env-file .env.local`.
- The client bundle bakes the two build-time values in at build time, and the
  API routes read `process.env` at runtime.
- ⚠️ `NEXT_PUBLIC_*` changes require a **rebuild** for the client bundle to pick
  them up:

```bash
docker compose --env-file .env.local build --no-cache
docker compose --env-file .env.local up -d
```

---

## Project structure

```
.
├─ app/                    # Next.js App Router (pages, components, API routes)
├─ data/                   # Landmark content (places, scenes)
├─ docker/
│  └─ Dockerfile           # Multi-stage production image (non-root)
├─ lib/                    # Supabase client, helpers, animations
├─ public/                 # Static assets
├─ .dockerignore           # Build context exclusions (keeps secrets out)
├─ .env.example            # Variables template (copy to .env.local)
├─ .gitignore
├─ build.sh / build.ps1    # Build the Docker image
├─ start.sh / start.ps1    # Start the Docker stack
├─ stop.sh / stop.ps1      # Stop the Docker stack
├─ docker-compose.yml      # App + Portainer monitoring
└─ next.config.js          # standalone output, image patterns, etc.
```

---

## Docker setup details

The image is built in three stages for size, speed, and security:

| Stage    | Base          | Purpose                                    |
|----------|---------------|--------------------------------------------|
| `deps`   | node:20-alpine| `npm ci` (all deps from `package-lock.json`) |
| `builder`| node:20-alpine| `next build` → `.next/standalone`          |
| `runner` | node:20-alpine| minimal runtime, runs as unprivileged user |

Highlights:

- **Standalone output** — `output: 'standalone'` in `next.config.js` produces a
  self-contained server so the runtime image needs no `node_modules`.
- **Non-root** — the app runs as user `nextjs` (uid 1001).
- **No secrets in the image** — `.dockerignore` excludes `.env*`; build args are
  passed explicitly, never copied from files.
- **Health check** — every 30s against `/api/health`.
- **Immutable dependency builds** — `npm ci` uses the committed lockfile.

---

## Useful commands

| Task                        | Command                                                          |
|-----------------------------|------------------------------------------------------------------|
| Build image                 | `./build.sh` or `.\build.ps1`                                    |
| Start stack                 | `./start.sh` or `.\start.ps1`                                    |
| Stop stack                  | `./stop.sh` or `.\stop.ps1`                                      |
| Container status            | `docker compose ps`                                              |
| App logs (follow)           | `docker compose logs -f soul-of-lahore`                          |
| Resource usage              | `docker stats`                                                   |
| Health status               | `docker inspect --format='{{.State.Health.Status}}' soul-of-lahore` |
| Rebuild from scratch        | `docker compose --env-file .env.local build --no-cache`          |
| Restart app service         | `docker compose restart soul-of-lahore`                          |
| Portainer admin reset       | `docker compose rm -sf portainer && docker compose up -d`        |
| Remove everything + volumes | `docker compose down -v`                                          |

---

## Troubleshooting

**Port 3000 already in use**
```bash
docker compose rm -sf soul-of-lahore
docker run -d --name portainer-helper -p 3000:3000 soul-of-lahore:latest
```
…or identify the process holding the port (`netstat -ano | findstr :3000`) and stop it.

**"Env file ... not found" on `docker compose`**
Run the stack via `start.sh` / `start.ps1`, or create `.env.local` first:
```bash
cp .env.example .env.local
```

**Reviews / Supabase calls fail**
`.env.local` still contains the placeholder values from `.env.example`. Put real
values in and rebuild (see [Environment variables](#environment-variables)).

**Portainer can't see the Docker environment**
On Windows the `npipe` mount must point at `\\.\pipe\docker_engine` (already
configured). On Linux, use the commented bind-mount of `/var/run/docker.sock`.

**Container shows `unhealthy`**
Check the logs — the health endpoint is `/api/health`; make sure nothing else is
occupying port 3000.

---

## License

Private project. All rights reserved.