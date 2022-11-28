use axum::Router;
use sqlx::PgPool;

pub mod accounts;
pub mod keys;
pub mod reports;

pub async fn routes() -> Router<PgPool> {
    // uses merge until the inherit state supports nesting
    Router::new()
        .nest("/accounts", accounts::routes())
        .nest("/reports", reports::routes())
        .nest("/keys", keys::routes())
}
