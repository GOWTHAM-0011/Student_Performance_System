-- ================================================================
-- SPBS – Student Performance Benchmarking System
-- Schema DDL  (schema.sql)
-- ================================================================

-- Users table (shared across all roles)
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100) NOT NULL,
    role        VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN','FACULTY','STUDENT')),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Faculty profiles
CREATE TABLE IF NOT EXISTS faculty_profiles (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_code   VARCHAR(20) UNIQUE,
    department      VARCHAR(100),
    specialization  VARCHAR(100)
);

-- Student profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    roll_number   VARCHAR(20) UNIQUE,
    department    VARCHAR(100),
    semester      INTEGER,
    section       VARCHAR(5),
    date_of_birth DATE
);

-- Faculty-Student assignments
CREATE TABLE IF NOT EXISTS assignments (
    id          BIGSERIAL PRIMARY KEY,
    faculty_id  BIGINT NOT NULL REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    student_id  BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT uq_faculty_student UNIQUE (faculty_id, student_id)
);

-- Performance records
CREATE TABLE IF NOT EXISTS performance (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    subject         VARCHAR(100) NOT NULL,
    subject_code    VARCHAR(20),
    marks_obtained  NUMERIC(6,2) NOT NULL,
    max_marks       NUMERIC(6,2) NOT NULL DEFAULT 100,
    exam_type       VARCHAR(20)  NOT NULL DEFAULT 'MID_TERM'
                    CHECK (exam_type IN ('MID_TERM','FINAL','QUIZ','ASSIGNMENT','PRACTICAL')),
    exam_date       DATE,
    semester        INTEGER,
    grade           VARCHAR(5),
    remarks         VARCHAR(255)
);
