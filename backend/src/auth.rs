use axum::{
    async_trait,
    extract::{FromRequestParts, TypedHeader},
    headers::{authorization::Bearer, Authorization},
    http::request::Parts,
    RequestPartsExt,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use utoipa::{
    openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme},
    Modify, ToSchema,
};

use crate::errors::Error;

/* -------------------------------- response -------------------------------- */

#[derive(Debug, Serialize, ToSchema)]
pub struct AuthBody {
    access_token: String,
    token_type: String,
}

impl AuthBody {
    pub fn for_id(user_id: i32) -> Result<Self, Error> {
        let token = AuthUser::new(user_id).to_jwt()?;
        Ok(Self::new(token))
    }

    fn new(access_token: String) -> Self {
        Self {
            access_token,
            token_type: "Bearer".to_string(),
        }
    }
}

/* --------------------------------- claims --------------------------------- */

const SESSION_LENGTH: time::Duration = time::Duration::weeks(3);

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthUser {
    pub user_id: i32,
    exp: i64,
}

impl AuthUser {
    fn new(user_id: i32) -> AuthUser {
        AuthUser {
            user_id,
            exp: (OffsetDateTime::now_utc() + SESSION_LENGTH).unix_timestamp(),
        }
    }

    fn to_jwt(&self) -> Result<String, Error> {
        encode(&Header::default(), &self, &KEYS.encoding)
            .map_err(|_| Error::Internal("token creation error".to_string()))
    }
}

#[async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = Error;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // Extract the token from the authorization header
        let TypedHeader(Authorization(bearer)) = parts
            .extract::<TypedHeader<Authorization<Bearer>>>()
            .await
            .map_err(|_| Error::Unauthorized)?;

        // Decode the user data
        let token_data = decode::<AuthUser>(bearer.token(), &KEYS.decoding, &Validation::default())
            .map_err(|_| Error::Unauthorized)?;

        // Verify token is not expired
        if token_data.claims.exp < OffsetDateTime::now_utc().unix_timestamp() {
            return Err(Error::Unauthorized);
        }

        Ok(token_data.claims)
    }
}

/* ---------------------------------- keys ---------------------------------- */
static KEYS: Lazy<Keys> = Lazy::new(|| {
    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    Keys::new(secret.as_bytes())
});

struct Keys {
    encoding: EncodingKey,
    decoding: DecodingKey,
}

impl Keys {
    fn new(secret: &[u8]) -> Self {
        Self {
            encoding: EncodingKey::from_secret(secret),
            decoding: DecodingKey::from_secret(secret),
        }
    }
}

/* ---------------------------------- jwt documentation ---------------------------------- */
pub struct JWTDocAddon;

impl Modify for JWTDocAddon {
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
