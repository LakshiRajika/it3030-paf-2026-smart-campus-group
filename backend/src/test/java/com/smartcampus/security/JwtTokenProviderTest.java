package com.smartcampus.security;

import com.smartcampus.model.User;
import com.smartcampus.model.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "9a4f2c8d3b7a1e6f5d8c3b2a1e6f5d8c3b2a1e6f5d8c3b2a1e6f5d8c3b2a1e6f");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationInMs", 3600000);
    }

    @Test
    void testGenerateAndValidateToken() {
        User user = User.builder()
                .id("test-id")
                .email("test@example.com")
                .roles(new HashSet<>(Collections.singletonList(UserRole.USER)))
                .build();
        CustomUserDetails userDetails = new CustomUserDetails(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        String token = jwtTokenProvider.generateToken(authentication);
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("test-id", jwtTokenProvider.getUserIdFromJWT(token));
    }
}
