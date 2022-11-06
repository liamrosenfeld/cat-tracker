CREATE TABLE IF NOT EXISTS account(
    id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
    email     TEXT NOT NULL UNIQUE,
    username  TEXT NOT NULL,
    pw_hash   TEXT NOT NULL,
    disabled  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS report(
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    loc_x       FLOAT NOT NULL,
    loc_y       FLOAT NOT NULL,
    created_by  INT NOT NULL REFERENCES account(id),
    created_at  TIMESTAMPTZ NOT NULL,
    last_seen   TIMESTAMPTZ NOT NULL,
    cat_name    VARCHAR NOT NULL,
    notes       VARCHAR NOT NULL
);
