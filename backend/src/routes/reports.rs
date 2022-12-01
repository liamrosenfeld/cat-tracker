use axum::{
    extract::{Path, Query, State},
    routing::{delete, get, post, put},
    Form, Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use time::{Duration, OffsetDateTime};
use utoipa::{IntoParams, OpenApi, ToSchema};

use crate::auth::{AuthUser, JWTDocAddon};
use crate::errors::Error;

pub fn routes() -> Router<PgPool> {
    Router::new()
        .route("/new", post(new))
        .route("/recent", get(recent))
        .route("/mine", get(all_mine))
        .route("/:id", get(full_by_id))
        .route("/:id", put(update))
        .route("/:id", delete(remove))
        .route("/:id/spot", post(spot))
}

#[derive(OpenApi)]
#[openapi(
    paths(
        new,
        recent,
        full_by_id,
        update,
        remove,
        spot,
        all_mine,
    ),
    components(
        schemas(
            NewReport,
            RecentQuery,
            ReportLocation,
            ReportAndAuthor,
            Report,
        )
    ),
    modifiers(&JWTDocAddon)
)]
pub struct Docs;

/* ----------------------------------- new ---------------------------------- */

#[derive(Deserialize, ToSchema)]
struct NewReport {
    #[schema(example = 29.6)]
    loc_x: f64,
    #[schema(example = -82.35)]
    loc_y: f64,
    #[schema(example = "tenders")]
    cat_name: String,
    #[schema(example = "outside gator corner front door")]
    notes: String,
}

#[utoipa::path(
    post,
    path = "/api/reports/new",
    request_body(content=NewReport, content_type="application/x-www-form-urlencoded"),
    responses(
        (status = 200, description = "Create report and return ID", body = String)
    ),
    security(("jwt" = []))
)]
async fn new(
    auth: AuthUser,
    State(db): State<PgPool>,
    Form(req): Form<NewReport>,
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

#[derive(Deserialize, IntoParams, ToSchema)]
struct RecentQuery {
    hours_back: i32,
}

#[derive(Serialize, IntoParams, ToSchema)]
struct ReportLocation {
    id: i32,
    loc_x: f64,
    loc_y: f64,
}

#[utoipa::path(
    get,
    path = "/api/reports/recent",
    params(RecentQuery),
    responses(
        (status = 200, description = "All reports for the past n hours", body = [ReportLocation])
    ),
)]
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

#[derive(Serialize, ToSchema)]
struct ReportAndAuthor {
    id: i32,
    loc_x: f64,
    loc_y: f64,
    created_by: String,
    #[serde(with = "time::serde::rfc3339")]
    created_at: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    last_seen: OffsetDateTime,
    cat_name: String,
    notes: String,
}

#[derive(Deserialize, ToSchema, IntoParams)]
#[into_params(names("id"))]
struct ReportID(i32);

#[utoipa::path(
    get,
    path = "/api/reports/{id}",
    params(ReportID),
    responses(
        (status = 200, description = "Full information for a single report and its author", body = Report),
        (status = 404, description = "No report with ID"),
    ),
)]
async fn full_by_id(
    State(db): State<PgPool>,
    Path(id): Path<ReportID>,
) -> Result<Json<ReportAndAuthor>, Error> {
    // join with accounts to replace the raw user ID with the username
    // if profile pictures/karma is added, we could project with those too
    let locs = sqlx::query_as!(
        ReportAndAuthor,
        r#"SELECT report.id, loc_x, loc_y, username created_by, created_at, last_seen, cat_name, notes
        FROM report JOIN account ON report.created_by=account.id
        WHERE report.id = $1"#,
        id.0
    )
    .fetch_one(&db)
    .await?;
    Ok(Json(locs))
}

/* ------------------------------- all of mine ------------------------------ */

#[derive(Serialize, ToSchema)]
struct Report {
    id: i32,
    loc_x: f64,
    loc_y: f64,
    #[serde(with = "time::serde::rfc3339")]
    created_at: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    last_seen: OffsetDateTime,
    cat_name: String,
    notes: String,
}

#[utoipa::path(
    get,
    path = "/api/reports/mine",
    responses(
        (status = 200, description = "All reports made by the current user", body = [Report]),
    ),
    security(("jwt" = []))
)]
async fn all_mine(auth: AuthUser, State(db): State<PgPool>) -> Result<Json<Vec<Report>>, Error> {
    let locs = sqlx::query_as!(
        Report,
        r#"SELECT report.id, loc_x, loc_y, created_at, last_seen, cat_name, notes
        FROM report
        WHERE report.created_by = $1"#,
        auth.user_id
    )
    .fetch_all(&db)
    .await?;
    Ok(Json(locs))
}

/* --------------------------------- update --------------------------------- */

#[utoipa::path(
    put,
    path = "/api/reports/{id}",
    params(ReportID),
    request_body(content=NewReport, content_type="application/x-www-form-urlencoded"),
    responses(
        (status = 200, description = "Report was updated"),
        (status = 403, description = "Current user not creator of report"),
        (status = 404, description = "No report with ID"),
    ),
    security(("jwt" = []))
)]
async fn update(
    auth: AuthUser,
    State(db): State<PgPool>,
    Path(id): Path<ReportID>,
    Form(req): Form<NewReport>,
) -> Result<(), Error> {
    // ensure is updating own report
    let author_id = sqlx::query!("SELECT created_by FROM report WHERE id = $1", id.0)
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
        id.0
    )
    .execute(&db)
    .await?;

    Ok(())
}

#[utoipa::path(
    delete,
    path = "/api/reports/{id}",
    params(ReportID),
    responses(
        (status = 200, description = "Report was deleted"),
        (status = 403, description = "Current user not creator of report"),
        (status = 404, description = "No report with ID"),
    ),
    security(("jwt" = []))
)]
async fn remove(
    auth: AuthUser,
    State(db): State<PgPool>,
    Path(id): Path<ReportID>,
) -> Result<(), Error> {
    // ensure is deleting own report
    let author_id = sqlx::query!("SELECT created_by FROM report WHERE id = $1", id.0)
        .fetch_one(&db)
        .await?
        .created_by;

    if author_id != auth.user_id {
        return Err(Error::Forbidden);
    }

    // delete
    sqlx::query!("DELETE FROM report WHERE id = $1", id.0)
        .execute(&db)
        .await?;

    Ok(())
}

#[utoipa::path(
    post,
    path = "/api/reports/{id}/spot",
    params(ReportID),
    responses(
        (status = 200, description = "Report last seen was updated"),
        (status = 404, description = "No report with ID"),
    ),
    security(("jwt" = []))
)]
async fn spot(
    _auth: AuthUser,
    State(db): State<PgPool>,
    Path(id): Path<ReportID>,
) -> Result<(), Error> {
    // the returning id is so it gives a 404 error if not found
    sqlx::query!(
        "UPDATE report SET last_seen=$1 WHERE id = $2 RETURNING id",
        OffsetDateTime::now_utc(),
        id.0
    )
    .fetch_one(&db)
    .await?;

    Ok(())
}
