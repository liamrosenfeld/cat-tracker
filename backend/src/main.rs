use axum::{
    http::StatusCode,
    response::IntoResponse,
    routing::{get, get_service},
    Json, Router,
};
use std::{io, net::SocketAddr};
use tower_http::services::{ServeDir, ServeFile};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    // setup tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "example_static_file_server=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // routing
    let api = api_router();
    let frontend = spa_router();

    // run it
    let addr = SocketAddr::from(([127, 0, 0, 1], 8000));
    println!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(frontend.merge(api).into_make_service())
        .await
        .unwrap();
}

fn api_router() -> Router {
    // filler for now
    Router::new().route("/api/test", get(api_test))
}

fn spa_router() -> Router {
    // return the file if it is found, index.html if not
    let dir = "../frontend/build"; // will eventually be dependent on if this is a docker build or not
    let serve_dir =
        ServeDir::new(dir).not_found_service(ServeFile::new(format!("{}/index.html", dir)));
    let service = get_service(serve_dir).handle_error(handle_error);
    Router::new().fallback(service)
}

async fn api_test() -> Json<String> {
    Json("Hello world".to_string())
}

async fn handle_error(_err: io::Error) -> impl IntoResponse {
    (StatusCode::INTERNAL_SERVER_ERROR, "Something went wrong...")
}
