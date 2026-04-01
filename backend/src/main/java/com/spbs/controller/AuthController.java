package com.spbs.controller;

import com.spbs.dto.ApiResponse;
import com.spbs.dto.UserDto;
import com.spbs.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserService userService;

    public AuthController(AuthenticationManager authManager, UserService userService) {
        this.authManager = authManager;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDto.Response>> login(
            @Valid @RequestBody UserDto.LoginRequest req,
            HttpServletRequest httpReq,
            HttpServletResponse httpRes) {

        // 1. Authenticate – throws BadCredentialsException if wrong
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );

        // 2. Store in SecurityContext
        SecurityContext sc = SecurityContextHolder.getContext();
        sc.setAuthentication(auth);

        // 3. Persist to HTTP session using Spring's own key constant
        HttpSession session = httpReq.getSession(true);
        session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                sc
        );

        // 4. Return user info
        UserDto.Response user = userService.getByUsername(req.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Login successful", user));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto.Response>> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()
                || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("Not authenticated"));
        }
        UserDto.Response user = userService.getByUsername(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(user));
    }
}
