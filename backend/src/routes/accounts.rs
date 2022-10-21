use argon2::{
    password_hash::{PasswordHash, SaltString},
    Argon2, PasswordHasher, PasswordVerifier,
};
use axum::{extract::State, routing::post, Json, Router};
use sqlx::PgPool;

use crate::auth::AuthBody;
use crate::errors::Error;

pub fn routes() -> Router<PgPool> {
    Router::inherit_state()
        .route("/accounts/new", post(new))
        .route("/accounts/login", post(login))
}

/* ----------------------------------- new ---------------------------------- */

#[derive(serde::Deserialize)]
struct NewAccount {
    email: String,
    username: String,
    password: String,
}

async fn new(
    State(db): State<PgPool>,
    Json(req): Json<NewAccount>,
) -> Result<Json<AuthBody>, Error> {
    let pw_hash = hash_password(req.password).await?;

    let user_id = sqlx::query_scalar!(
        r#"insert into "account" (username, email, pw_hash) values ($1, $2, $3) returning id"#,
        req.username,
        req.email,
        pw_hash
    )
    .fetch_one(&db)
    .await?;

    Ok(Json(AuthBody::for_id(user_id)?))
}

/* ---------------------------------- login --------------------------------- */

#[derive(serde::Deserialize)]
struct Login {
    email: String,
    password: String,
}

async fn login(State(db): State<PgPool>, Json(req): Json<Login>) -> Result<Json<AuthBody>, Error> {
    let user = sqlx::query!(
        "select id, pw_hash from account where email = $1",
        req.email
    )
    .fetch_one(&db)
    .await?;
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
