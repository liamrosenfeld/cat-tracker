use crate::db;
use axum::Router;
use sqlx::PgPool;

mod accounts;
mod reports;

pub async fn routes() -> Router<PgPool> {
    // uses merge until the inherit state supports nesting
    Router::with_state(db::connect().await)
        .merge(accounts::routes())
        .merge(reports::routes())
}
