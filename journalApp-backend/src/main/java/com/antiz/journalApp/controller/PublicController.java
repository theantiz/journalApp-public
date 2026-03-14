package com.antiz.journalApp.controller;

import com.antiz.journalApp.dto.UserDTO;
import com.antiz.journalApp.entity.User;
import com.antiz.journalApp.service.UserDetailsServiceImpl;
import com.antiz.journalApp.service.UserService;
import com.antiz.journalApp.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public")
@Tag(name = "Public APIs", description = "Public endpoints - No authentication required")
@Slf4j
public class PublicController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/health-check")
    @Operation(summary = "Health check", description = "Application health status")
    public ResponseEntity<String> healthCheck() {
        log.info("Health check - OK!");
        return ResponseEntity.ok("OK");
    }

    @PostMapping("/signup")
    @Operation(summary = "Register new user", description = "Creates new user account")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid user data or user already exists")
    })
    public ResponseEntity<?> signup(@RequestBody UserDTO userDTO) {
        try {
            User newUser = new User();
            newUser.setUserName(userDTO.getUserName());
            newUser.setEmail(userDTO.getEmail());
            newUser.setPassword(userDTO.getPassword());  // Password will be encoded in service
            newUser.setSentimentAnalysis(userDTO.isSentimentAnalysis());

            userService.saveNewUser(newUser);
            log.info("User {} registered successfully", userDTO.getUserName());
            return new ResponseEntity<>("User created successfully", HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Signup failed for user: {}", userDTO.getUserName(), e);
            return new ResponseEntity<>("Registration failed", HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful - returns JWT token"),
            @ApiResponse(responseCode = "401", description = "Invalid username or password")
    })
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            // Authenticate user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUserName(), user.getPassword())
            );

            // Generate JWT token
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUserName());
            String jwt = jwtUtil.generateToken(userDetails.getUsername());

            log.info("User {} logged in successfully", user.getUserName());
            return ResponseEntity.ok(jwt);

        } catch (Exception e) {
            log.error("Login failed for user: {}", user.getUserName(), e);
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid Username or Password");
        }
    }
}
