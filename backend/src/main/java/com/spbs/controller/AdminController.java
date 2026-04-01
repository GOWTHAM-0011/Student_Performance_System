package com.spbs.controller;
import com.spbs.dto.*;
import com.spbs.entity.User;
import com.spbs.service.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserService userService;
    private final PerformanceService perfService;
    private final AssignmentService assignService;
    public AdminController(UserService u, PerformanceService p, AssignmentService a){userService=u; perfService=p; assignService=a;}

    @GetMapping("/dashboard") public ResponseEntity<ApiResponse<PerformanceDto.DashboardStats>> dashboard(){ return ResponseEntity.ok(ApiResponse.ok(perfService.getDashboardStats())); }
    @GetMapping("/users") public ResponseEntity<ApiResponse<List<UserDto.Response>>> allUsers(){ return ResponseEntity.ok(ApiResponse.ok(userService.getAll())); }
    @GetMapping("/users/{id}") public ResponseEntity<ApiResponse<UserDto.Response>> getUser(@PathVariable Long id){ return ResponseEntity.ok(ApiResponse.ok(userService.getById(id))); }
    @PostMapping("/users") public ResponseEntity<ApiResponse<UserDto.Response>> createUser(@Valid @RequestBody UserDto.CreateRequest req){ return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Created",userService.create(req))); }
    @PutMapping("/users/{id}") public ResponseEntity<ApiResponse<UserDto.Response>> updateUser(@PathVariable Long id,@RequestBody UserDto.UpdateRequest req){ return ResponseEntity.ok(ApiResponse.ok("Updated",userService.update(id,req))); }
    @DeleteMapping("/users/{id}") public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id){ userService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted",null)); }
    @GetMapping("/students") public ResponseEntity<ApiResponse<List<UserDto.Response>>> students(){ return ResponseEntity.ok(ApiResponse.ok(userService.getByRole(User.Role.STUDENT))); }
    @GetMapping("/students/{id}/analytics") public ResponseEntity<ApiResponse<PerformanceDto.Analytics>> analytics(@PathVariable Long id){ return ResponseEntity.ok(ApiResponse.ok(perfService.getAnalytics(id))); }
    @GetMapping("/faculty") public ResponseEntity<ApiResponse<List<UserDto.Response>>> faculty(){ return ResponseEntity.ok(ApiResponse.ok(userService.getByRole(User.Role.FACULTY))); }
    @GetMapping("/performance") public ResponseEntity<ApiResponse<List<PerformanceDto.Response>>> allPerf(){ return ResponseEntity.ok(ApiResponse.ok(perfService.getAll())); }
    @GetMapping("/performance/student/{sid}") public ResponseEntity<ApiResponse<List<PerformanceDto.Response>>> perfByStudent(@PathVariable Long sid){ return ResponseEntity.ok(ApiResponse.ok(perfService.getByStudent(sid))); }
    @PostMapping("/performance") public ResponseEntity<ApiResponse<PerformanceDto.Response>> addPerf(@Valid @RequestBody PerformanceDto.Request req){ return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Added",perfService.add(req))); }
    @PutMapping("/performance/{id}") public ResponseEntity<ApiResponse<PerformanceDto.Response>> updatePerf(@PathVariable Long id,@RequestBody PerformanceDto.Request req){ return ResponseEntity.ok(ApiResponse.ok("Updated",perfService.update(id,req))); }
    @DeleteMapping("/performance/{id}") public ResponseEntity<ApiResponse<Void>> deletePerf(@PathVariable Long id){ perfService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted",null)); }
    @GetMapping("/assignments") public ResponseEntity<ApiResponse<List<AssignmentDto.Response>>> assignments(){ return ResponseEntity.ok(ApiResponse.ok(assignService.getAll())); }
    @PostMapping("/assignments") public ResponseEntity<ApiResponse<AssignmentDto.Response>> assign(@Valid @RequestBody AssignmentDto.Request req){ return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Assigned",assignService.assign(req))); }
    @DeleteMapping("/assignments/{id}") public ResponseEntity<ApiResponse<Void>> removeAssign(@PathVariable Long id){ assignService.remove(id); return ResponseEntity.ok(ApiResponse.ok("Removed",null)); }
}
