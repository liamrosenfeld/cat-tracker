use axum::{Router, Server};
use dotenv::dotenv;
use std::net::SocketAddr;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod auth;
mod db;
mod errors;
mod frontend;
mod routes;

#[tokio::main]
async fn main() {
    // load .env into enviroment variables
    dotenv().ok();

    // better panic handling
    color_eyre::install().ok();

    // setup tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "backend=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // migrate database
    let db = db::connect().await;
    sqlx::migrate!("./migrations")
        .run(&db)
        .await
        .expect("Could not run server migrations");

    // routing
    let app = Router::new()
        .merge(routes::docs())
        .nest("/api", routes::routes())
        .fallback_service(frontend::service())
        .layer(TraceLayer::new_for_http())
        .with_state(db);

    // get address dependant on if running locally or in docker
    #[cfg(debug_assertions)]
    let addr = SocketAddr::from(([127, 0, 0, 1], 8000));
    #[cfg(not(debug_assertions))]
    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));

    // run it
    println!("listening on {}", &addr);
    Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
