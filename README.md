# Student Performance Benchmarking System (SPBS)

A full-stack role-based web application built with:
- **Backend**: Java 21, Spring Boot 3.2.3, Spring Security (session-based), Spring Data JPA
- **Frontend**: React 18, Vite 5, Axios, Chart.js
- **Database**: PostgreSQL 14+
- **No JWT · No Lombok** — explicit, beginner-friendly code

---

## Default Login Credentials

| Role    | Username  | Password     |
|---------|-----------|--------------|
| Admin   | admin     | password123  |
| Faculty | faculty1  | password123  |
| Faculty | faculty2  | password123  |
| Student | student1  | password123  |
| Student | student2  | password123  |
| Student | student3  | password123  |
| Student | student4  | password123  |
| Student | student5  | password123  |

---

## Step 1 – PostgreSQL Setup

### Install PostgreSQL (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Install PostgreSQL (macOS with Homebrew)
```bash
brew install postgresql@16
brew services start postgresql@16
```

### Install PostgreSQL (Windows)
Download the installer from https://www.postgresql.org/download/windows/

### Create the database
```bash
# Connect as the postgres superuser
sudo -u postgres psql        # Linux
psql -U postgres             # macOS / Windows

-- Run inside psql:
CREATE DATABASE spbs_db;
-- If your system user differs from "postgres", also run:
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE spbs_db TO postgres;
\q
```

---

## Step 2 – Backend Setup & Run

### Prerequisites
- Java 21 (JDK) – verify: `java -version`
- Maven 3.9.x  – verify: `mvn -version`

### Configure (if needed)
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/spbs_db
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### Run
```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

Backend starts at **http://localhost:8080**

On first startup the app:
1. Runs `schema.sql` to create all tables (IF NOT EXISTS – safe to re-run)
2. `DataInitializer` inserts all sample users, profiles, assignments and performance data
   using live BCrypt encoding (no hardcoded hashes)

---

## Step 3 – Frontend Setup & Run

### Prerequisites
- Node.js 18+ – verify: `node -v`
- npm 9+      – verify: `npm -v`

### Run
```bash
cd frontend
npm install
npm run dev
```

Frontend starts at **http://localhost:5173**

The Vite dev proxy forwards all `/api/*` requests to `http://localhost:8080`.

---

## Project Structure

```
spbs/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/spbs/
│       │   ├── SpbsApplication.java
│       │   ├── config/
│       │   │   ├── DataInitializer.java      ← seeds DB on startup
│       │   │   ├── CustomUserDetailsService.java
│       │   │   └── SecurityConfig.java       ← session-based, no JWT
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── AdminController.java
│       │   │   ├── FacultyController.java
│       │   │   └── StudentController.java
│       │   ├── dto/
│       │   │   ├── ApiResponse.java
│       │   │   ├── UserDto.java
│       │   │   ├── PerformanceDto.java
│       │   │   └── AssignmentDto.java
│       │   ├── entity/
│       │   │   ├── User.java
│       │   │   ├── FacultyProfile.java
│       │   │   ├── StudentProfile.java
│       │   │   ├── Assignment.java
│       │   │   └── Performance.java
│       │   ├── exception/
│       │   │   ├── GlobalExceptionHandler.java
│       │   │   ├── ResourceNotFoundException.java
│       │   │   └── DuplicateResourceException.java
│       │   ├── repository/          (5 JPA repositories)
│       │   └── service/
│       │       ├── UserService.java
│       │       ├── PerformanceService.java
│       │       └── AssignmentService.java
│       └── resources/
│           ├── application.properties
│           └── schema.sql
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                  ← routing + AuthContext
│       ├── index.css                ← full design system
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   ├── Modal.jsx
│       │   └── Charts.jsx           ← Bar, Doughnut, Line
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── FacultyDashboard.jsx
│       │   └── StudentDashboard.jsx
│       ├── services/
│       │   └── api.js               ← Axios, withCredentials
│       └── utils/
│           └── helpers.js
│
├── .gitignore
└── README.md
```

---

## API Reference

### Auth  (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login`  | Login – returns session cookie |
| POST | `/api/auth/logout` | Logout – invalidates session   |
| GET  | `/api/auth/me`     | Get current user               |

### Admin  (`/api/admin` – ADMIN only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/admin/dashboard`              | System-wide stats & charts |
| GET  | `/api/admin/users`                  | All users |
| POST | `/api/admin/users`                  | Create user (any role) |
| PUT  | `/api/admin/users/{id}`             | Update user |
| DELETE | `/api/admin/users/{id}`           | Delete user |
| GET  | `/api/admin/students`               | All students |
| GET  | `/api/admin/students/{id}/analytics`| Student analytics |
| GET  | `/api/admin/faculty`                | All faculty |
| GET  | `/api/admin/performance`            | All records |
| POST | `/api/admin/performance`            | Add record |
| PUT  | `/api/admin/performance/{id}`       | Update record |
| DELETE | `/api/admin/performance/{id}`     | Delete record |
| GET  | `/api/admin/assignments`            | All assignments |
| POST | `/api/admin/assignments`            | Create assignment |
| DELETE | `/api/admin/assignments/{id}`     | Remove assignment |

### Faculty  (`/api/faculty` – ADMIN + FACULTY)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/faculty/dashboard`                        | Stats |
| GET | `/api/faculty/my-students`                      | Assigned students |
| GET | `/api/faculty/students/{id}/analytics`           | Student analytics |
| GET | `/api/faculty/students/{id}/performance`         | Student records |
| GET | `/api/faculty/assignments`                      | My assignments |

### Student  (`/api/student` – all roles)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/analytics`  | Own analytics |
| GET | `/api/student/performance`| Own records |
| GET | `/api/student/class-stats`| Class-wide stats |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 8080 in use | Change `server.port` in `application.properties` and update `vite.config.js` proxy |
| DB connection refused | Ensure PostgreSQL is running: `sudo systemctl status postgresql` |
| data re-inserted on restart | DataInitializer checks `userRepo.count() > 0` – safe to restart |
| CORS error | Ensure `app.cors.allowed-origin=http://localhost:5173` matches Vite port |
| 401 after backend restart | Session is in-memory – just log in again |
