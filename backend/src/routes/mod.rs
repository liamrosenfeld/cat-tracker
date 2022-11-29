use axum::Router;
use sqlx::PgPool;
use utoipa::OpenApi;
use utoipa_swagger_ui::{SwaggerUi, Url};

mod accounts;
mod keys;
mod reports;

pub fn routes() -> Router<PgPool> {
    Router::new()
        .nest("/accounts", accounts::routes())
        .nest("/reports", reports::routes())
        .nest("/keys", keys::routes())
}

pub fn docs() -> SwaggerUi {
    SwaggerUi::new("/api/docs")
        .url(
            Url::new("Accounts", "/api-doc/accounts.json"),
            accounts::Docs::openapi(),
        )
        .url(
            Url::new("Reports", "/api-doc/reports.json"),
            reports::Docs::openapi(),
        )
}
