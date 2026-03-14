package com.antiz.journalApp.service;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;

@SpringBootTest
public class RedisTest {
    @Autowired
    private RedisTemplate redisTemplate;

    @Disabled
    @Test
    void test() {
        redisTemplate.opsForValue().set("email", "jay@gmail.com"); // opsForValue is used to perform operations on values
        Object email = redisTemplate.opsForValue().get("salary");
        int a = 1;
    }
}
