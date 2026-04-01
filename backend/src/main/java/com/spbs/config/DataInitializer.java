package com.spbs.config;

import com.spbs.entity.*;
import com.spbs.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Seeds the database with sample data on first startup.
 * Skips entirely if any users already exist.
 * Default password for every account: password123
 */
@Component
@Order(1)
public class DataInitializer implements CommandLineRunner {

    private final UserRepository           userRepo;
    private final FacultyProfileRepository facultyRepo;
    private final StudentProfileRepository studentRepo;
    private final AssignmentRepository     assignmentRepo;
    private final PerformanceRepository    perfRepo;
    private final PasswordEncoder          encoder;

    public DataInitializer(UserRepository u, FacultyProfileRepository f,
                           StudentProfileRepository s, AssignmentRepository a,
                           PerformanceRepository p, PasswordEncoder enc) {
        this.userRepo       = u;
        this.facultyRepo    = f;
        this.studentRepo    = s;
        this.assignmentRepo = a;
        this.perfRepo       = p;
        this.encoder        = enc;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepo.count() > 0) {
            System.out.println("[DataInitializer] Data already present – skipping seed.");
            return;
        }
        System.out.println("[DataInitializer] Seeding initial data…");

        final String pass = encoder.encode("password123");

        // ── Admin ───────────────────────────────────────────────
        User admin = makeUser("admin", "admin@spbs.edu", pass, "System Administrator", User.Role.ADMIN);
        userRepo.save(admin);

        // ── Faculty 1 ───────────────────────────────────────────
        User fu1 = makeUser("faculty1", "arjun@spbs.edu", pass, "Dr. Arjun Kumar", User.Role.FACULTY);
        userRepo.save(fu1);
        FacultyProfile fp1 = makeFaculty(fu1, "EMP001", "Computer Science", "Data Structures & Algorithms");
        facultyRepo.save(fp1);

        // ── Faculty 2 ───────────────────────────────────────────
        User fu2 = makeUser("faculty2", "priya@spbs.edu", pass, "Prof. Priya Nair", User.Role.FACULTY);
        userRepo.save(fu2);
        FacultyProfile fp2 = makeFaculty(fu2, "EMP002", "Mathematics", "Calculus & Statistics");
        facultyRepo.save(fp2);

        // ── Students ────────────────────────────────────────────
        Object[][] sd = {
            {"student1","alice@spbs.edu","Alice Sharma", "CS001","A","2003-04-10"},
            {"student2","bob@spbs.edu",  "Bob Mehta",    "CS002","A","2003-07-22"},
            {"student3","carol@spbs.edu","Carol Singh",  "CS003","B","2002-12-05"},
            {"student4","david@spbs.edu","David Rao",    "CS004","B","2003-01-18"},
            {"student5","eva@spbs.edu",  "Eva Pillai",   "CS005","A","2002-09-30"},
        };

        StudentProfile[] sp = new StudentProfile[sd.length];
        for (int i = 0; i < sd.length; i++) {
            User u = makeUser((String)sd[i][0], (String)sd[i][1], pass, (String)sd[i][2], User.Role.STUDENT);
            userRepo.save(u);
            StudentProfile s = new StudentProfile();
            s.setUser(u);
            s.setRollNumber((String)sd[i][3]);
            s.setDepartment("Computer Science");
            s.setSemester(3);
            s.setSection((String)sd[i][4]);
            s.setDateOfBirth(LocalDate.parse((String)sd[i][5]));
            studentRepo.save(s);
            sp[i] = s;
        }

        // ── Assignments ─────────────────────────────────────────
        // faculty1 → students 0,1,2   |   faculty2 → students 2,3,4
        int[][] asgn = {{0,0},{0,1},{0,2},{1,2},{1,3},{1,4}};
        FacultyProfile[] fps = {fp1, fp2};
        for (int[] pair : asgn) {
            FacultyProfile fac = fps[pair[0]];
            StudentProfile stu = sp[pair[1]];
            if (!assignmentRepo.existsByFacultyIdAndStudentId(fac.getId(), stu.getId())) {
                Assignment a = new Assignment();
                a.setFaculty(fac);
                a.setStudent(stu);
                assignmentRepo.save(a);
            }
        }

        // ── Performance records ──────────────────────────────────
        String[] subjects = {"Data Structures","Mathematics","Operating Systems","DBMS","Networks"};
        String[] codes    = {"CS301","MA301","CS302","CS303","CS304"};
        // rows = students, cols = subjects
        double[][] marks  = {
            {88, 75, 91, 80, 70},   // Alice
            {72, 65, 55, 74, 63},   // Bob
            {95, 92, 88, 93, 85},   // Carol
            {60, 55, 65, 58, 70},   // David
            {83, 86, 79, 88, 81},   // Eva
        };

        for (int si = 0; si < sp.length; si++) {
            for (int sj = 0; sj < subjects.length; sj++) {
                double m = marks[si][sj];
                Performance p = new Performance();
                p.setStudent(sp[si]);
                p.setSubject(subjects[sj]);
                p.setSubjectCode(codes[sj]);
                p.setMarksObtained(m);
                p.setMaxMarks(100.0);
                p.setExamType(Performance.ExamType.MID_TERM);
                p.setExamDate(LocalDate.of(2024, 9, 15 + sj));
                p.setSemester(3);
                p.setGrade(gradeFor(m));
                p.setRemarks(m >= 75 ? "Good" : m >= 50 ? "Average" : "Below Average");
                perfRepo.save(p);
            }
        }

        System.out.println("[DataInitializer] ✓ Seeded: 1 admin, 2 faculty, 5 students, 25 performance records.");
    }

    // ── Helpers ─────────────────────────────────────────────────
    private User makeUser(String username, String email, String password,
                          String fullName, User.Role role) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword(password);
        u.setFullName(fullName);
        u.setRole(role);
        u.setActive(true);
        return u;
    }

    private FacultyProfile makeFaculty(User user, String code, String dept, String spec) {
        FacultyProfile fp = new FacultyProfile();
        fp.setUser(user);
        fp.setEmployeeCode(code);
        fp.setDepartment(dept);
        fp.setSpecialization(spec);
        return fp;
    }

    private String gradeFor(double m) {
        if (m >= 90) return "A+";
        if (m >= 80) return "A";
        if (m >= 70) return "B+";
        if (m >= 60) return "B";
        if (m >= 50) return "C";
        return "F";
    }
}
