use axum::{
    http::{header, StatusCode},
    response::{IntoResponse, Response},
};

#[allow(dead_code)]
#[derive(thiserror::Error, Debug)]
pub enum Error {
    /// Return `401 Unauthorized`
    #[error("authentication required")]
    Unauthorized,

    /// Return `403 Forbidden`
    #[error("user may not perform that action")]
    Forbidden,

    /// Return `404 Not Found`
    #[error("no {resource} with {property} of {value}")]
    NotFound {
        resource: &'static str,
        property: &'static str,
        value: String,
    },

    /// Return `422 Unprocessable Entity`
    #[error("error in the request body: {0}")]
    UnprocessableEntity(&'static str),

    #[error("{0}")]
    Internal(String),

    /// Either an internal server error or the constraint error
    #[error("an error occurred with the database")]
    Sqlx(#[from] sqlx::Error),
}

impl Error {
    fn status_code(&self) -> StatusCode {
        match self {
            Self::Unauthorized => StatusCode::UNAUTHORIZED,
            Self::Forbidden => StatusCode::FORBIDDEN,
            Self::NotFound { .. } => StatusCode::NOT_FOUND,
            Self::UnprocessableEntity(_) => StatusCode::UNPROCESSABLE_ENTITY,
            Self::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::Sqlx(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        match self {
            // add WWW_AUTHENTICATE to explain how to authorize
            Self::Unauthorized => (
                self.status_code(),
                [(header::WWW_AUTHENTICATE, "Needs JWT")],
                self.to_string(),
            )
                .into_response(),

            // SQLx errors can either be a condition failure or an internal error
            Self::Sqlx(err) => match err {
                sqlx::Error::RowNotFound => {
                    (StatusCode::NOT_FOUND, "resource not found").into_response()
                }
                sqlx::Error::Database(database_err) => {
                    let error_code = database_err.code().expect("No database error code");
                    if error_code == "23505" {
                        (
                            StatusCode::CONFLICT,
                            format!("Conflict: {}", database_err.message()),
                        )
                            .into_response()
                    } else {
                        tracing::error!("constraint error: {:?}", database_err);
                        (
                            StatusCode::INTERNAL_SERVER_ERROR,
                            "an error occurred with the database",
                        )
                            .into_response()
                    }
                }
                _ => {
                    tracing::error!("SQLx error: {:?}", err);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "an error occurred with the database",
                    )
                        .into_response()
                }
            },

            // Other errors get mapped normally.
            _ => (self.status_code(), self.to_string()).into_response(),
        }
    }
}
