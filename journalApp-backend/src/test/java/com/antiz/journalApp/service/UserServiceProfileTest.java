package com.antiz.journalApp.service;

import com.antiz.journalApp.entity.JournalEntry;
import com.antiz.journalApp.entity.User;
import com.antiz.journalApp.repository.JournalEntryRepository;
import com.antiz.journalApp.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceProfileTest {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Mock
    private UserRepository userRepository;

    @Mock
    private JournalEntryRepository journalEntryRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void updateUserProfilePreservesExistingSecurityFields() {
        User existingUser = new User();
        existingUser.setUserName("alex");
        existingUser.setPassword("encoded-password");
        existingUser.setRoles(Collections.singletonList("USER"));
        existingUser.setSentimentAnalysis(false);

        JournalEntry journalEntry = new JournalEntry();
        existingUser.getJournalEntries().add(journalEntry);

        when(userRepository.findByUserName("alex")).thenReturn(existingUser);
        when(userRepository.save(existingUser)).thenReturn(existingUser);

        User updatedUser = userService.updateUserProfile("alex", "alex@example.com", true);

        assertEquals("alex@example.com", updatedUser.getEmail());
        assertTrue(updatedUser.isSentimentAnalysis());
        assertEquals("encoded-password", updatedUser.getPassword());
        assertEquals(Collections.singletonList("USER"), updatedUser.getRoles());
        assertEquals(1, updatedUser.getJournalEntries().size());
    }

    @Test
    void updateUserPasswordEncodesPasswordAndPreservesOtherFields() {
        User existingUser = new User();
        existingUser.setUserName("alex");
        existingUser.setPassword("encoded-password");
        existingUser.setEmail("alex@example.com");
        existingUser.setRoles(Collections.singletonList("USER"));
        existingUser.setSentimentAnalysis(true);

        JournalEntry journalEntry = new JournalEntry();
        existingUser.getJournalEntries().add(journalEntry);

        when(userRepository.findByUserName("alex")).thenReturn(existingUser);
        when(userRepository.save(existingUser)).thenReturn(existingUser);

        assertTrue(userService.updateUserPassword("alex", "NewPassword123"));
        assertTrue(passwordEncoder.matches("NewPassword123", existingUser.getPassword()));
        assertEquals("alex@example.com", existingUser.getEmail());
        assertTrue(existingUser.isSentimentAnalysis());
        assertEquals(Collections.singletonList("USER"), existingUser.getRoles());
        assertEquals(1, existingUser.getJournalEntries().size());
    }

    @Test
    void updateUserPasswordReturnsFalseWhenUserMissing() {
        when(userRepository.findByUserName("alex")).thenReturn(null);

        assertFalse(userService.updateUserPassword("alex", "NewPassword123"));
        verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any(User.class));
    }

    @Test
    void updateUserProfileReturnsNullWhenUserMissing() {
        when(userRepository.findByUserName("alex")).thenReturn(null);

        assertNull(userService.updateUserProfile("alex", "alex@example.com", true));
        verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any(User.class));
    }

    @Test
    void deleteUserWithEntriesRemovesEntriesBeforeDeletingUser() {
        User existingUser = new User();
        existingUser.setUserName("alex");
        existingUser.setPassword("encoded-password");

        JournalEntry journalEntry = new JournalEntry();
        existingUser.getJournalEntries().add(journalEntry);

        when(userRepository.findByUserName("alex")).thenReturn(existingUser);

        assertTrue(userService.deleteUserWithEntries("alex"));

        verify(journalEntryRepository).deleteAll(existingUser.getJournalEntries());
        verify(userRepository).delete(existingUser);
    }

    @Test
    void deleteUserWithEntriesReturnsFalseWhenUserMissing() {
        when(userRepository.findByUserName("alex")).thenReturn(null);

        assertFalse(userService.deleteUserWithEntries("alex"));
        verify(userRepository, never()).delete(org.mockito.ArgumentMatchers.any(User.class));
        verify(journalEntryRepository, never()).deleteAll(org.mockito.ArgumentMatchers.anyIterable());
    }
}
