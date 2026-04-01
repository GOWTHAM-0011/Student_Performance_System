package com.spbs.service;

import com.spbs.dto.UserDto;
import com.spbs.entity.*;
import com.spbs.exception.*;
import com.spbs.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository           userRepo;
    private final StudentProfileRepository studentRepo;
    private final FacultyProfileRepository facultyRepo;
    private final PasswordEncoder          encoder;

    public UserService(UserRepository u, StudentProfileRepository s,
                       FacultyProfileRepository f, PasswordEncoder e) {
        this.userRepo    = u;
        this.studentRepo = s;
        this.facultyRepo = f;
        this.encoder     = e;
    }

    public List<UserDto.Response> getAll() {
        return userRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<UserDto.Response> getByRole(User.Role role) {
        return userRepo.findByRole(role).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public UserDto.Response getById(Long id) {
        return toResponse(userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id)));
    }

    public UserDto.Response getByUsername(String username) {
        return toResponse(userRepo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username)));
    }

    @Transactional
    public UserDto.Response create(UserDto.CreateRequest req) {
        if (userRepo.existsByUsername(req.getUsername()))
            throw new DuplicateResourceException("Username already taken: " + req.getUsername());
        if (userRepo.existsByEmail(req.getEmail()))
            throw new DuplicateResourceException("Email already in use: " + req.getEmail());

        User u = new User();
        u.setUsername(req.getUsername());
        u.setEmail(req.getEmail());
        u.setPassword(encoder.encode(req.getPassword()));
        u.setFullName(req.getFullName());
        u.setRole(req.getRole());
        u.setActive(true);
        userRepo.save(u);

        if (req.getRole() == User.Role.STUDENT) {
            StudentProfile sp = new StudentProfile();
            sp.setUser(u);
            // Convert empty string to null to avoid unique constraint conflicts
            String roll = req.getRollNumber();
            sp.setRollNumber((roll != null && !roll.isBlank()) ? roll.trim() : null);
            sp.setDepartment(req.getDepartment());
            sp.setSemester(req.getSemester());
            sp.setSection(req.getSection());
            if (req.getDateOfBirth() != null && !req.getDateOfBirth().isBlank()) {
                sp.setDateOfBirth(LocalDate.parse(req.getDateOfBirth()));
            }
            studentRepo.save(sp);
        } else if (req.getRole() == User.Role.FACULTY) {
            FacultyProfile fp = new FacultyProfile();
            fp.setUser(u);
            // Convert empty string to null to avoid unique constraint conflicts
            String code = req.getEmployeeCode();
            fp.setEmployeeCode((code != null && !code.isBlank()) ? code.trim() : null);
            fp.setDepartment(req.getDepartment());
            fp.setSpecialization(req.getSpecialization());
            facultyRepo.save(fp);
        }

        return toResponse(u);
    }

    @Transactional
    public UserDto.Response update(Long id, UserDto.UpdateRequest req) {
        User u = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (req.getEmail() != null && !req.getEmail().isBlank())    u.setEmail(req.getEmail());
        if (req.getFullName() != null && !req.getFullName().isBlank()) u.setFullName(req.getFullName());
        if (req.getPassword() != null && !req.getPassword().isBlank()) u.setPassword(encoder.encode(req.getPassword()));
        if (req.getActive() != null) u.setActive(req.getActive());
        userRepo.save(u);

        if (u.getRole() == User.Role.STUDENT) {
            studentRepo.findByUserId(id).ifPresent(sp -> {
                if (req.getDepartment() != null) sp.setDepartment(req.getDepartment());
                if (req.getSemester() != null)   sp.setSemester(req.getSemester());
                if (req.getSection() != null)    sp.setSection(req.getSection());
                studentRepo.save(sp);
            });
        } else if (u.getRole() == User.Role.FACULTY) {
            facultyRepo.findByUserId(id).ifPresent(fp -> {
                if (req.getDepartment() != null)    fp.setDepartment(req.getDepartment());
                if (req.getSpecialization() != null) fp.setSpecialization(req.getSpecialization());
                facultyRepo.save(fp);
            });
        }

        return toResponse(u);
    }

    @Transactional
    public void delete(Long id) {
        User u = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        userRepo.delete(u);
    }

    // ── Mapping – profileId is the student/faculty profile row id ──────────
    public UserDto.Response toResponse(User u) {
        UserDto.Response r = new UserDto.Response();
        r.setId(u.getId());
        r.setUsername(u.getUsername());
        r.setEmail(u.getEmail());
        r.setFullName(u.getFullName());
        r.setRole(u.getRole());
        r.setActive(u.isActive());

        if (u.getRole() == User.Role.STUDENT) {
            studentRepo.findByUserId(u.getId()).ifPresent(sp -> {
                r.setProfileId(sp.getId());      // ← THIS is the profile id the API needs
                r.setRollNumber(sp.getRollNumber());
                r.setDepartment(sp.getDepartment());
                r.setSemester(sp.getSemester());
                r.setSection(sp.getSection());
            });
        } else if (u.getRole() == User.Role.FACULTY) {
            facultyRepo.findByUserId(u.getId()).ifPresent(fp -> {
                r.setProfileId(fp.getId());      // ← THIS is the profile id the API needs
                r.setEmployeeCode(fp.getEmployeeCode());
                r.setDepartment(fp.getDepartment());
                r.setSpecialization(fp.getSpecialization());
            });
        }
        return r;
    }
}
