package com.antiz.journalApp.service;

import com.antiz.journalApp.entity.User;
import com.antiz.journalApp.scheduler.UserScheduler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class UserSchedulersTest {

@Autowired
    private UserScheduler userScheduler;
@Test
    public void testFetchUsersAndSendMail(){
    userScheduler.fetchUsersAndSendSaMail();
}
}
