CREATE TABLE districts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    access_code TEXT NOT NULL UNIQUE
);

CREATE TABLE schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    district_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

CREATE TABLE buses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER NOT NULL,
    bus_number TEXT NOT NULL,
    FOREIGN KEY (school_id) REFERENCES schools(id)
);

CREATE TABLE bus_stops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bus_id INTEGER NOT NULL,
    stop_name TEXT NOT NULL,
    address TEXT,
    latitude REAL,
    longitude REAL,
    pickup_time TEXT,
    FOREIGN KEY (bus_id) REFERENCES buses(id)
);

CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    name TEXT NOT NULL,
    school_id INTEGER NOT NULL,
    bus_id INTEGER,
    home_address TEXT,
    latitude REAL,
    longitude REAL,
    FOREIGN KEY (school_id) REFERENCES schools(id),
    FOREIGN KEY (bus_id) REFERENCES buses(id)
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student','parent','admin','sysadmin'))
);

CREATE TABLE student_user_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    approved INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE admin_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    school_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (school_id) REFERENCES schools(id)
);

CREATE TABLE bus_locations (
    bus_id INTEGER PRIMARY KEY,
    latitude REAL,
    longitude REAL,
    updated_at TEXT
);


CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
