package com.smartcampus.security;

import com.smartcampus.model.User;
import com.smartcampus.model.enums.UserRole;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2UserService.class);
    private final UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Value("${app.security.admin-emails}")
    private List<String> adminEmails;

    @org.springframework.beans.factory.annotation.Value("${app.security.technician-emails}")
    private List<String> technicianEmails;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        logger.debug("Loading user from OAuth2 provider...");
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);
        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (Exception ex) {
            logger.error("Error processing OAuth2 user: ", ex);
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String googleId = (String) attributes.get("sub");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        Set<UserRole> roles = new HashSet<>();
        if (adminEmails.contains(email)) {
            roles.add(UserRole.ADMIN);
            logger.info("Email {} is whitelisted for ADMIN", email);
        } else if (technicianEmails.contains(email)) {
            roles.add(UserRole.TECHNICIAN);
            logger.info("Email {} is whitelisted for TECHNICIAN", email);
        } else {
            roles.add(UserRole.USER);
        }

        if (userOptional.isPresent()) {
            user = userOptional.get();
            user.setName(name);
            user.setPicture(picture);
            user.setGoogleId(googleId);
            user.setRoles(roles); // Overwrite roles based on current whitelist
            logger.debug("Updating existing user: {}", email);
        } else {
            user = User.builder()
                    .email(email)
                    .googleId(googleId)
                    .name(name)
                    .picture(picture)
                    .roles(roles)
                    .build();
        }
        user = userRepository.save(user);

        return new CustomUserDetails(user, attributes);
    }
}
