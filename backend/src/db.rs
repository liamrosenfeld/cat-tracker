use sqlx::{postgres::PgPoolOptions, PgPool};

pub async fn connect() -> PgPool {
    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL not provided");
    PgPoolOptions::new()
        .max_connections(50)
        .connect(&db_url)
        .await
        .expect("can't connect to the database")
}
