package com.spbs.controller;
import com.spbs.dto.*;
import com.spbs.entity.*;
import com.spbs.exception.ResourceNotFoundException;
import com.spbs.repository.*;
import com.spbs.service.PerformanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasAnyRole('ADMIN','FACULTY','STUDENT')")
public class StudentController {
    private final PerformanceService perfService;
    private final StudentProfileRepository studentRepo;
    private final UserRepository userRepo;
    public StudentController(PerformanceService p, StudentProfileRepository s, UserRepository u){perfService=p; studentRepo=s; userRepo=u;}

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<PerformanceDto.Analytics>> myAnalytics(Authentication auth){
        User u=userRepo.findByUsername(auth.getName()).orElseThrow(()->new ResourceNotFoundException("User not found"));
        StudentProfile sp=studentRepo.findByUserId(u.getId()).orElseThrow(()->new ResourceNotFoundException("Student profile not found"));
        return ResponseEntity.ok(ApiResponse.ok(perfService.getAnalytics(sp.getId())));
    }

    @GetMapping("/performance")
    public ResponseEntity<ApiResponse<List<PerformanceDto.Response>>> myPerformance(Authentication auth){
        User u=userRepo.findByUsername(auth.getName()).orElseThrow(()->new ResourceNotFoundException("User not found"));
        StudentProfile sp=studentRepo.findByUserId(u.getId()).orElseThrow(()->new ResourceNotFoundException("Student profile not found"));
        return ResponseEntity.ok(ApiResponse.ok(perfService.getByStudent(sp.getId())));
    }

    @GetMapping("/class-stats")
    public ResponseEntity<ApiResponse<PerformanceDto.DashboardStats>> classStats(){ return ResponseEntity.ok(ApiResponse.ok(perfService.getDashboardStats())); }
}
