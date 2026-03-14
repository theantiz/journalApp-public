package com.antiz.journalApp.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class EmailServiceTest {
    @Autowired
    private EmailService emailService;

    @Test
    void testSendEmail() {
    emailService.sendEmail("kingcoc.jay@gmail.com", "Test Email", "This is a test email");

}
}
