package com.antiz.journalApp.service;


import com.antiz.journalApp.entity.User;
import com.antiz.journalApp.repository.JournalEntryRepository;
import com.antiz.journalApp.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import lombok.extern.slf4j.Slf4j;
import com.antiz.journalApp.service.EmailService;
import com.antiz.journalApp.service.RedisService;







@Service
@Slf4j
public class UserService {
    // business logic here - fixed compilation errors, added logging and validations
    //create e entry in MongoDB

    @Autowired
    private UserRepository userRepository;

@Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private RedisService redisService;

    @Autowired
    private EmailService emailService;



    @Autowired
    private PasswordEncoder passwordEncoder;







    public void saveUser(User user) {

        userRepository.save(user);

    }

    public boolean saveNewUser(User user) {
        log.info("Attempting to create new user: {}", user.getUserName());
        try {
            if (userRepository.findByUserName(user.getUserName()) != null) {
                log.warn("Attempt to create existing user: {}", user.getUserName());
                return false;
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setRoles(Arrays.asList("USER"));
            userRepository.save(user);
            log.info("User {} created successfully", user.getUserName());
            return true;
        } catch (Exception e) {
            log.error("Failed to create user {}: {}", user.getUserName(), e.getMessage(), e);
            return false;
        }
    }

    public User updateUserProfile(String username, String email, boolean sentimentAnalysis) {
        User existingUser = userRepository.findByUserName(username);
        if (existingUser == null) {
            return null;
        }

        String normalizedEmail = email != null ? email.trim() : null;
        existingUser.setEmail(normalizedEmail != null && !normalizedEmail.isEmpty() ? normalizedEmail : null);
        existingUser.setSentimentAnalysis(sentimentAnalysis);
        return userRepository.save(existingUser);
    }

    public boolean updateUserPassword(String username, String rawPassword) {
        User existingUser = userRepository.findByUserName(username);
        if (existingUser == null) {
            return false;
        }

        existingUser.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.save(existingUser);
        return true;
    }

    @Transactional
    public boolean deleteUserWithEntries(String username) {
        User existingUser = userRepository.findByUserName(username);
        if (existingUser == null) {
            return false;
        }

        if (existingUser.getJournalEntries() != null && !existingUser.getJournalEntries().isEmpty()) {
            journalEntryRepository.deleteAll(existingUser.getJournalEntries());
        }

        userRepository.delete(existingUser);
        return true;
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public boolean existsByUserName(String username) {
        return userRepository.findByUserName(username) != null;
    }

    public Optional<User> findByID(ObjectId myId) {
        return userRepository.findById(myId);
    }

    public void deleteByID(ObjectId myId) {
        userRepository.deleteById(myId);
    }

    public void deleteByUserName(String userName) {
        log.info("Deleting user by name: {}", userName);
        userRepository.deleteByUserName(userName);
    }

    public User findByUserName(String username) {
        log.info("Finding user by name: {}", username);
        return userRepository.findByUserName(username);
    }
}


