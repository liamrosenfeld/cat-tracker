use axum::routing::{get_service, MethodRouter};
use std::io;
use tower_http::services::{ServeDir, ServeFile};

use crate::errors::Error;

// debug mode -> grab from frontend build folder
#[cfg(debug_assertions)]
const FRONTEND_DIR: &str = "../frontend/build";

// running in container -> get from where it is in the docker container
#[cfg(not(debug_assertions))]
const FRONTEND_DIR: &str = "/static/";

/// service that returns a file if it is found and index.html if it is not
pub fn service() -> MethodRouter {
    let fallback_file = ServeFile::new(format!("{}/index.html", FRONTEND_DIR));
    let serve_dir = ServeDir::new(FRONTEND_DIR).not_found_service(fallback_file);
    get_service(serve_dir).handle_error(handle_error)
}

async fn handle_error(_err: io::Error) -> Error {
    Error::Internal("Unable to access file for frontend".to_string())
}
