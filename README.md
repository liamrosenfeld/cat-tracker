# Cat Tracker

A web application to crowd-source the location of UF campus cats so more people can visit them

## Local Development

### Frontend

(all must be run in the `frontend` directory)

- Build once: `npm run build`
- Build, keep updating, and open in browser: `npm start`

### Backend

First run `npm run build` in the `frontend` directory. Then run `cargo run` in `backend`.

### Database

1. [Install Postgres](https://www.postgresql.org/download/) then start with `pg_ctl -D /usr/local/var/postgresql@14 start`
2. Install SQLx CLI `cargo install sqlx-cli`
3. Create a `.env` file in `backend/` that has the contents `DATABASE_URL=postgres://[YOUR USERNAME]:[YOUR PASSWORD]@localhost/cat-tracker`

## Docker Development

TODO

## Database Commands

- After Changing a `query!`: `cargo sqlx prepare`
- New Migration: `sqlx migrate add <name>`
