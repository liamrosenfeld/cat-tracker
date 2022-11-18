use axum::{
    extract::{Path, Query, State},
    routing::{delete, get, post, put},
    Json, Router,
};
use sqlx::PgPool;
use time::{Duration, OffsetDateTime};

use crate::{auth::AuthUser, errors::Error};

pub fn routes() -> Router<PgPool> {
    Router::new()
        .route("/new", post(new))
        .route("/recent", get(recent))
        .route("/:id", get(full_by_id))
        .route("/:id", put(update))
        .route("/:id", delete(remove))
        .route("/:id/spot", post(spot))
}

/* ----------------------------------- new ---------------------------------- */

#[derive(serde::Deserialize)]
struct NewReport {
    loc_x: f64,
    loc_y: f64,
    cat_name: String,
    notes: String,
}

async fn new(
    auth: AuthUser,
    State(db): State<PgPool>,
    Json(req): Json<NewReport>,
) -> Result<String, Error> {
    let created_by = auth.user_id;
    let created_at = OffsetDateTime::now_utc();

    let id: i32 = sqlx::query_scalar!(
        r#"INSERT INTO report (loc_x, loc_y, created_by, created_at, last_seen, cat_name, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id"#,
        req.loc_x,
        req.loc_y,
        created_by,
        created_at,
        created_at,
        req.cat_name,
        req.notes
    )
    .fetch_one(&db)
    .await?;

    Ok(id.to_string())
}

/* --------------------------------- recent --------------------------------- */

#[derive(serde::Deserialize)]
struct RecentQuery {
    hours_back: i32,
}

#[derive(serde::Serialize)]
struct ReportLocation {
    id: i32,
    loc_x: f64,
    loc_y: f64,
}

async fn recent(
    State(db): State<PgPool>,
    Query(params): Query<RecentQuery>,
) -> Result<Json<Vec<ReportLocation>>, Error> {
    let start_time = OffsetDateTime::now_utc() - Duration::hours(params.hours_back.into());
    let locs = sqlx::query_as!(
        ReportLocation,
        "SELECT id, loc_x, loc_y FROM report WHERE last_seen >= $1",
        start_time
    )
    .fetch_all(&db)
    .await?;

    Ok(Json(locs))
}

/* -------------------------------- get full -------------------------------- */

#[derive(serde::Serialize)]
struct Report {
    id: i32,
    loc_x: f64,
    loc_y: f64,
    created_by: String,
    created_at: OffsetDateTime,
    last_seen: OffsetDateTime,
    cat_name: String,
    notes: String,
}

async fn full_by_id(State(db): State<PgPool>, Path(id): Path<i32>) -> Result<Json<Report>, Error> {
    // join with accounts to replace the raw user ID with the username
    // if profile pictures/karma is added, we could project with those too
    let locs = sqlx::query_as!(
        Report,
        r#"SELECT report.id, loc_x, loc_y, username created_by, created_at, last_seen, cat_name, notes
        FROM report JOIN account ON report.created_by=account.id
        WHERE report.id = $1"#,
        id
    )
    .fetch_one(&db)
    .await?;
    Ok(Json(locs))
}

/* --------------------------------- update --------------------------------- */

async fn update(
    auth: AuthUser,
    State(db): State<PgPool>,
    Path(id): Path<i32>,
    Json(req): Json<NewReport>,
) -> Result<(), Error> {
    // ensure is updating own report
    let author_id = sqlx::query!("SELECT created_by FROM report WHERE id = $1", id)
        .fetch_one(&db)
        .await?
        .created_by;

    if author_id != auth.user_id {
        return Err(Error::Forbidden);
    }

    // update
    sqlx::query!(
        "UPDATE report SET loc_x=$1, loc_y=$2, cat_name=$3, notes=$4 WHERE id = $5",
        req.loc_x,
        req.loc_y,
        req.cat_name,
        req.notes,
        id
    )
    .execute(&db)
    .await?;

    Ok(())
}

async fn remove(
    auth: AuthUser,
    State(db): State<PgPool>,
    Path(id): Path<i32>,
) -> Result<(), Error> {
    // ensure is deleting own report
    let author_id = sqlx::query!("SELECT created_by FROM report WHERE id = $1", id)
        .fetch_one(&db)
        .await?
        .created_by;

    if author_id != auth.user_id {
        return Err(Error::Forbidden);
    }

    // delete
    sqlx::query!("DELETE FROM report WHERE id = $1", id)
        .execute(&db)
        .await?;

    Ok(())
}

async fn spot(_auth: AuthUser, State(db): State<PgPool>, Path(id): Path<i32>) -> Result<(), Error> {
    // the returning id is so it gives a 404 error if not found
    sqlx::query!(
        "UPDATE report SET last_seen=$1 WHERE id = $2 RETURNING id",
        OffsetDateTime::now_utc(),
        id
    )
    .fetch_one(&db)
    .await?;

    Ok(())
}
