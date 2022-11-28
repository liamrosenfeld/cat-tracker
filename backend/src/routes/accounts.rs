use argon2::{
    password_hash::{PasswordHash, SaltString},
    Argon2, PasswordHasher, PasswordVerifier,
};
use axum::{extract::State, routing::post, Form, Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use utoipa::ToSchema;

use crate::auth::AuthBody;
use crate::errors::Error;

pub fn routes() -> Router<PgPool> {
    Router::new()
        .route("/new", post(new))
        .route("/login", post(login))
}

/* ----------------------------------- new ---------------------------------- */
#[derive(Serialize, Deserialize, ToSchema)]
pub struct NewAccount {
    #[schema(example = "example@ufl.edu")]
    email: String,
    #[schema(example = "John Appleseed")]
    username: String,
    #[schema(example = "hunter2")]
    password: String,
}

#[utoipa::path(
    post,
    path = "/api/accounts/new",
    request_body(content=NewAccount, content_type="application/x-www-form-urlencoded"),
    responses(
        (status = 200, description = "Create account and return JWT", body = AuthBody),
        (status = 409, description = "Email already taken")
    )
)]
pub async fn new(
    State(db): State<PgPool>,
    Form(req): Form<NewAccount>,
) -> Result<Json<AuthBody>, Error> {
    let pw_hash = hash_password(req.password).await?;

    let user_id = sqlx::query_scalar!(
        r#"INSERT INTO account (username, email, pw_hash)
        VALUES ($1, $2, $3) RETURNING id"#,
        req.username,
        req.email,
        pw_hash
    )
    .fetch_one(&db)
    .await?;

    Ok(Json(AuthBody::for_id(user_id)?))
}

/* ---------------------------------- login --------------------------------- */

#[derive(Deserialize, ToSchema)]
pub struct Login {
    #[schema(example = "example@ufl.edu")]
    email: String,
    #[schema(example = "hunter2")]
    password: String,
}

#[utoipa::path(
    post,
    path = "/api/accounts/login",
    request_body(content=Login, content_type="application/x-www-form-urlencoded"),
    responses(
        (status = 200, description = "JWT for account", body = AuthBody),
        (status = 401, description = "Invalid credentials"),
    )
)]
pub async fn login(
    State(db): State<PgPool>,
    Form(req): Form<Login>,
) -> Result<Json<AuthBody>, Error> {
    let user = sqlx::query!(
        "SELECT id, pw_hash FROM account WHERE email = $1",
        req.email
    )
    .fetch_one(&db)
    .await
    .map_err(|_| Error::Unauthorized)?; // do not tell when email was valid

    verify_password(req.password, user.pw_hash).await?;

    Ok(Json(AuthBody::for_id(user.id)?))
}

/* --------------------------------- hashing -------------------------------- */

async fn hash_password(password: String) -> Result<String, Error> {
    // Argon2 hashing is designed to be computationally intensive,
    // so we need to do this on a blocking thread.
    let task = tokio::task::spawn_blocking(move || -> Result<String, Error> {
        let salt = SaltString::generate(rand::thread_rng());
        let hash = Argon2::default().hash_password(password.as_bytes(), &salt);
        match hash {
            Ok(hash) => Ok(hash.to_string()),
            Err(err) => Err(Error::Internal(format!(
                "failed to generate password hash: {err}"
            ))),
        }
    })
    .await;

    match task {
        Ok(result) => result,
        Err(_) => Err(Error::Internal(
            "failed to generate password hash".to_string(),
        )),
    }
}

async fn verify_password(password: String, password_hash: String) -> Result<(), Error> {
    let task = tokio::task::spawn_blocking(move || -> Result<(), Error> {
        let hash = PasswordHash::new(&password_hash)
            .map_err(|e| Error::Internal(format!("invalid password hash: {}", e)))?;
        Argon2::default()
            .verify_password(password.as_bytes(), &hash)
            .map_err(|e| match e {
                argon2::password_hash::Error::Password => Error::Unauthorized,
                _ => Error::Internal(format!("failed to verify password hash: {}", e)),
            })
    })
    .await;

    match task {
        Ok(result) => result,
        Err(_) => Err(Error::Internal(
            "failed to verify password hash".to_string(),
        )),
    }
}
