use axum::{Router, Server};
use dotenv::dotenv;
use std::net::{IpAddr, Ipv4Addr, SocketAddr};
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

    // get ip dependant on if running locally or in docker
    let ip = if cfg!(debug_assertions) {
        IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1))
    } else {
        IpAddr::V4(Ipv4Addr::new(0, 0, 0, 0))
    };

    // get port env (for heroku docker support)
    let port = std::env::var("PORT")
        .unwrap_or("8000".to_string())
        .parse::<u16>()
        .unwrap();

    // run it
    let addr = SocketAddr::new(ip, port);
    println!("listening on {}", &addr);
    Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
