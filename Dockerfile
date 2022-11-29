# ---- Build the Backend ---- 
FROM rust:1.65 as backend

WORKDIR /backend
COPY backend .

RUN cargo build --release

# ---- Build the Frontend ---- 
FROM node:18 as frontend

WORKDIR /frontend
COPY frontend .

RUN npm install && npm run build

# ---- Run ---- 
FROM debian:buster-slim as run

COPY --from=backend /backend/target/release/backend /usr/local/bin/backend
COPY --from=frontend /frontend/build/ /static

EXPOSE 8000
CMD backend
