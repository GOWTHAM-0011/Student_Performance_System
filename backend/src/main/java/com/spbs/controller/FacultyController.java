package com.spbs.controller;

import com.spbs.dto.*;
import com.spbs.entity.*;
import com.spbs.exception.ResourceNotFoundException;
import com.spbs.repository.*;
import com.spbs.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/faculty")
@PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
public class FacultyController {

    private final PerformanceService perfService;
    private final AssignmentService assignService;
    private final FacultyProfileRepository facultyRepo;
    private final UserRepository userRepo;

    public FacultyController(PerformanceService p, AssignmentService a,
                              FacultyProfileRepository f, UserRepository u) {
        perfService = p; assignService = a; facultyRepo = f; userRepo = u;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<PerformanceDto.DashboardStats>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(perfService.getDashboardStats()));
    }

    /** Returns list of students assigned to the logged-in faculty */
    @GetMapping("/my-students")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> myStudents(Authentication auth) {
        User user = userRepo.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        FacultyProfile fp = facultyRepo.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found"));

        List<AssignmentDto.Response> assignments = assignService.getByFaculty(fp.getId());
        List<Map<String, Object>> result = assignments.stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("assignmentId",     a.getId());
            m.put("studentProfileId", a.getStudentId());
            m.put("studentName",      a.getStudentName());
            m.put("rollNumber",       a.getRollNumber());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/students/{studentId}/analytics")
    public ResponseEntity<ApiResponse<PerformanceDto.Analytics>> analytics(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.ok(perfService.getAnalytics(studentId)));
    }

    @GetMapping("/students/{studentId}/performance")
    public ResponseEntity<ApiResponse<List<PerformanceDto.Response>>> performance(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.ok(perfService.getByStudent(studentId)));
    }

    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<List<AssignmentDto.Response>>> myAssignments(Authentication auth) {
        User user = userRepo.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        FacultyProfile fp = facultyRepo.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found"));
        return ResponseEntity.ok(ApiResponse.ok(assignService.getByFaculty(fp.getId())));
    }
}
