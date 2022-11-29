# Cat Tracker

A web application to crowd-source the location of UF campus cats so more people can visit them

## Local Development

### Frontend

1. Start the backend (instructions below)
2. Move to `frontend` directory
3. `npm install`
4. Build
   - Development: `npm start` (access through provided dev server)
   - Production: `npm run build` (access through the backend)

### Backend

1. Create the `.env` file in `backend/`
2. Setup database (instructions below)
3. Run `cargo run` in `backend/`

### Database

1. [Install Postgres](https://www.postgresql.org/download/) then start with `pg_ctl -D /usr/local/var/postgresql@14 start`
2. Install SQLx CLI `cargo install sqlx-cli`
3. Add `DATABASE_URL` to `.env`
4. Create database `sqlx database create`
5. Run migrations `sqlx migrate run`

## Docker Development

1. [Install Docker](https://docs.docker.com/get-docker/)
2. Create `.env` with everything except `DATABASE_URL` in `/`
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
- `SQLX_OFFLINE` (optional)
  - Skip checking if sqlx queries match the running database when compiling

### Location

- Local: `/backend/.env`
- Docker: `/.env`
- Deployment: Managed by heroku

## Database Commands

- After Changing a `query!`: `cargo sqlx prepare`
- New Migration: `sqlx migrate add <name>`

Migrations are automatically applied to the database when the backend is run

## OpenAPI Documentation

Run the backend and then view `/api/docs`
