# Cat Tracker

A web application to crowd-source the location of UF campus cats so more people can visit them

## Local Development

### Frontend

(all must be run in the `frontend` directory)

1. `npm install`
2. Build
   - Production: `npm run build`
   - Development: `npm start`
     - Note: will not connect to backend

### Backend

1. Create the `.env` file in `backend/`
2. Run `npm run build` in the `frontend` directory
3. Run `cargo run` in the `backend` backend

### Database

1. [Install Postgres](https://www.postgresql.org/download/) then start with `pg_ctl -D /usr/local/var/postgresql@14 start`
2. Install SQLx CLI `cargo install sqlx-cli`
3. Add `DATABASE_URL` to `.env`
4. Create database `sqlx database create`

## Docker Development

1. [Install Docker](https://docs.docker.com/get-docker/)
2. Create `.env` with everything except `DATABASE_URL`
3. Run: `docker compose up`

## Environment Variables

### Values

- `DATABASE_URL`
  - URL to the postgres database
  - in the form `postgres://USERNAME:PASSWORD@localhost/cat-tracker`
- `JWT_SECRET`
  - The key used for auth
  - Generate with `openssl rand -base64 32`
- `GOOGLE_MAP_KEY`
  - Key used to connect to google maps api
  - Get it from Chung
- `RUST_LOG` (optional)
  - How much you want the backend to log
  - `backend=LEVEL,tower_http=LEVEL`

### Location

- Local: `/backend/.env`
- Docker: `/.env`
- Deployment: Managed by heroku

## Database Commands

- After Changing a `query!`: `cargo sqlx prepare`
- New Migration: `sqlx migrate add <name>`

Migrations are automatically applied to the database when the backend is run
