package com.antiz.journalApp.controller;

import com.antiz.journalApp.dto.UserProfileResponse;
import com.antiz.journalApp.dto.UserProfileUpdateRequest;
import com.antiz.journalApp.entity.User;
import com.antiz.journalApp.service.UserService;
import com.antiz.journalApp.service.WeatherService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private WeatherService weatherService;

    @InjectMocks
    private UserController userController;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void returnsCurrentUserProfileForAuthenticatedUser() {
        User user = new User();
        user.setUserName("alex");
        user.setEmail("alex@example.com");
        user.setSentimentAnalysis(true);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("alex", null)
        );
        when(userService.findByname("alex")).thenReturn(user);

        ResponseEntity<UserProfileResponse> response = userController.getCurrentUserProfile();
        UserProfileResponse responseBody = response.getBody();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(responseBody);
        assertEquals("alex", responseBody.getUserName());
        assertEquals("alex@example.com", responseBody.getEmail());
        assertTrue(responseBody.isSentimentAnalysis());
    }

    @Test
    void updatesCurrentUserProfile() {
        User updatedUser = new User();
        updatedUser.setUserName("alex");
        updatedUser.setEmail("next@example.com");
        updatedUser.setSentimentAnalysis(false);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("alex", null)
        );
        when(userService.updateUserProfile("alex", "next@example.com", false)).thenReturn(updatedUser);

        UserProfileUpdateRequest request = new UserProfileUpdateRequest("next@example.com", false);
        ResponseEntity<UserProfileResponse> response = userController.updateUser(request);
        UserProfileResponse responseBody = response.getBody();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(responseBody);
        assertEquals("alex", responseBody.getUserName());
        assertEquals("next@example.com", responseBody.getEmail());
        assertEquals(false, responseBody.isSentimentAnalysis());
    }

    @Test
    void deletesCurrentUserAndReturnsNoContent() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("alex", null)
        );
        when(userService.deleteUserWithEntries("alex")).thenReturn(true);

        assertEquals(HttpStatus.NO_CONTENT, userController.deleteUser().getStatusCode());
        verify(userService).deleteUserWithEntries("alex");
    }
}
