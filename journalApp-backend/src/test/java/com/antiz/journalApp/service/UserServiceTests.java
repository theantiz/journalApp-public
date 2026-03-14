package com.antiz.journalApp.service;
import com.antiz.journalApp.entity.User;
import com.antiz.journalApp.service.UserService;
import com.antiz.journalApp.repository.UserRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ArgumentsSource;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class UserServiceTests {
    //writing multiple test cases for UserService

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Test //sample test case
    public void testAdd() {
        assertEquals(4, 2 + 2);
    }

    @Test
    public void testFindByUserName() {
        assertNotNull(userRepository.findByUserName("ram")); //make sure the username from the repo is not null or making assumption that userName repo is not null
    }

    @ParameterizedTest
    @CsvSource({ //also use valueSource to provide multiple inputs using Datatype like String, Integer etc.
            // also using enum to provide multiple inputs

            "jay",
            "ram",
            "shyam"
    })
// Tests addition operation with multiple input combinations from CSV data
    public void testParameterized(String name) {
        assertNotNull(userRepository.findByUserName(name));
    }


    // using ArgumentSource to provide multiple inputs from a custom class
    @ParameterizedTest
    @ArgumentsSource(UserArugmentProvider.class)
    public void argumentSourceTest(User user) {
        assertTrue(userService.saveNewUser(user));
    }



}
