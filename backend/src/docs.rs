use crate::{auth, routes};
use utoipa::{
    openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme},
    Modify, OpenApi,
};

#[derive(OpenApi)]
#[openapi(
    paths(
        routes::accounts::new,
        routes::accounts::login,
        routes::reports::new,
        routes::reports::recent,
        routes::reports::full_by_id,
        routes::reports::update,
        routes::reports::remove,
        routes::reports::spot,
    ),
    components(
        schemas(
            routes::accounts::NewAccount,
            routes::accounts::Login,
            routes::reports::NewReport,
            routes::reports::RecentQuery,
            routes::reports::ReportLocation,
            routes::reports::Report,
            auth::AuthBody,
        )
    ),
    modifiers(&SecurityAddon)
)]
pub struct ApiDoc;

struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "jwt",
                SecurityScheme::Http(
                    HttpBuilder::new()
                        .scheme(HttpAuthScheme::Bearer)
                        .bearer_format("JWT")
                        .build(),
                ),
            )
        }
    }
}
