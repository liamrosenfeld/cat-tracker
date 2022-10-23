use axum::{routing::get, Router};
use sqlx::PgPool;

pub fn routes() -> Router<PgPool> {
    Router::inherit_state().route("/keys/map", get(map))
}

async fn map() -> String {
    std::env::var("GOOGLE_MAP_KEY").expect("GOOGLE_MAP_KEY must be set")
}
