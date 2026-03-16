package com.antiz.journalApp.controller;

import com.antiz.journalApp.api.response.WeatherResponse;
import com.antiz.journalApp.dto.UserPasswordUpdateRequest;
import com.antiz.journalApp.dto.UserProfileResponse;
import com.antiz.journalApp.dto.UserProfileUpdateRequest;
import com.antiz.journalApp.entity.User;
import com.antiz.journalApp.service.UserService;
import com.antiz.journalApp.service.WeatherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user")
@Tag(name = "User APIs", description = "User profile management & weather info")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private WeatherService weatherService;

    @PostMapping
    @Operation(summary = "Create new user", description = "Creates a new user account (Public endpoint - move to PublicController)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid user data")
    })
    public ResponseEntity<Boolean> createUser(@RequestBody User user) {
        boolean saved = userService.saveNewUser(user);  // Fixed: Use return value
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping
    @Operation(summary = "Update current user profile", description = "Updates profile for authenticated user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User profile updated successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserProfileResponse> updateUser(@RequestBody UserProfileUpdateRequest userProfileUpdateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User updatedUser = userService.updateUserProfile(
                userName,
                userProfileUpdateRequest.getEmail(),
                userProfileUpdateRequest.isSentimentAnalysis()
        );

        if (updatedUser != null) {
            return new ResponseEntity<>(toProfileResponse(updatedUser), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/password")
    @Operation(summary = "Update current user password", description = "Updates the password for the authenticated user")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Password updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid password"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<?> updatePassword(@RequestBody UserPasswordUpdateRequest passwordUpdateRequest) {
        String nextPassword = passwordUpdateRequest != null ? passwordUpdateRequest.getNewPassword() : null;

        if (nextPassword == null || nextPassword.isBlank()) {
            return ResponseEntity.badRequest().body("Password is required.");
        }

        if (nextPassword.length() < 6) {
            return ResponseEntity.badRequest().body("Use at least 6 characters for the password.");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            log.warn("Password update attempted with missing or invalid authentication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required."));
        }

        try {
            boolean updated = userService.updateUserPassword(authentication.getName(), nextPassword);
            return new ResponseEntity<>(updated ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            log.error("Failed to update user password for {}", authentication.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to update password. Please try again later."));
        }
    }

    @DeleteMapping
    @Operation(summary = "Delete current user account", description = "Deletes authenticated user's account")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "User account deleted successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<?> deleteUser() {  // Fixed: Removed misleading "ById"
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean deleted = userService.deleteUserWithEntries(authentication.getName());
        return new ResponseEntity<>(deleted ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND);
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile", description = "Returns the current authenticated user's profile details")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User profile returned successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByname(authentication.getName());

        if (currentUser == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(toProfileResponse(currentUser), HttpStatus.OK);
    }

    @GetMapping
    @Operation(summary = "Get user greeting with weather", description = "Returns personalized greeting with Mumbai weather")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Greeting with weather info"),
            @ApiResponse(responseCode = "500", description = "Weather service unavailable")
    })
    public ResponseEntity<String> greeting() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();

        WeatherResponse weatherResponse = weatherService.getWeather("Mumbai");
        String greeting = "Hi " + userName + "!";

        if (weatherResponse != null && weatherResponse.getCurrent() != null) {
            greeting += " Weather feels like " + weatherResponse.getCurrent().getFeelslike() + "°C in Mumbai.";
        } else {
            greeting += " Weather info unavailable.";
        }

        return new ResponseEntity<>(greeting, HttpStatus.OK);
    }

    private UserProfileResponse toProfileResponse(User user) {
        return new UserProfileResponse(
                user.getUserName(),
                user.getEmail(),
                user.isSentimentAnalysis()
        );
    }
}
