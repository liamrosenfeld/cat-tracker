use axum::{
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use sqlx::PgPool;

use crate::auth::AuthUser;

pub fn routes() -> Router<PgPool> {
    Router::inherit_state()
        .route("/reports/new", post(new))
        .route("/reports/list", get(list))
}

async fn new(auth: AuthUser) -> StatusCode {
    tracing::debug!("report from user {}", auth.user_id);
    StatusCode::ACCEPTED
}

#[derive(serde::Serialize)]
struct Report();

async fn list() -> Json<Vec<Report>> {
    Json(vec![])
}
