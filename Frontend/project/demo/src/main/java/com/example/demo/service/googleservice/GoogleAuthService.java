package com.example.demo.service.googleservice;

import com.example.demo.dto.UserAdditionalInfoDTO;
import com.example.demo.entity.users.*;
//import com.example.demo.entity.UserLogin;
import com.example.demo.enums.*;
import com.example.demo.enums.users.UserRole;
import com.example.demo.repository.hotel.HotelOwnerRepository;
import com.example.demo.repository.user.UserLoginRepository;
import com.example.demo.repository.user.UserRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.rediservice.RedisService;
import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthService {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final UserLoginRepository userLoginRepository;
    private final RedisService redisService;
    private final HotelOwnerRepository hotelOwnerRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String redirectUri;

    public Map<String, Object> authenticateWithGoogle(String idToken) {
        log.info("Authenticating with Google using ID token: {}", idToken);

        ResponseEntity<Map> response = restTemplate.getForEntity(GOOGLE_TOKEN_INFO_URL + idToken, Map.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            log.error("Invalid Google ID token, status: {}", response.getStatusCode());
            throw new RuntimeException("Invalid Google ID token");
        }

        Map<String, Object> payload = response.getBody();
        log.info("Google token payload received: {}", payload);

        return processGooglePayload(payload);
    }

    public Map<String, Object> authenticateWithGoogleCode(String code) {
        log.info("Authenticating with Google using authorization code: {}", code);

        String tokenEndpoint = "https://oauth2.googleapis.com/token";

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("redirect_uri", redirectUri);
        body.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(tokenEndpoint, request, Map.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            log.error("Failed to exchange code for token, status: {}", response.getStatusCode());
            throw new RuntimeException("Failed to exchange code for token");
        }

        String idToken = (String) response.getBody().get("id_token");
        if (idToken == null) {
            log.error("No id_token returned by Google: {}", response.getBody());
            throw new RuntimeException("No id_token returned by Google");
        }

        log.info("Received ID token from Google: {}", idToken);
        return authenticateWithGoogle(idToken);
    }

    private Map<String, Object> processGooglePayload(Map<String, Object> payload) {
        log.info("Processing Google payload: {}", payload);

        String email = (String) payload.get("email");
        String fullName = (String) payload.get("name");
        String pictureUrl = (String) payload.get("picture");

        if (email == null || fullName == null) {
            log.error("Google token missing required fields: email={} name={}", email, fullName);
            throw new RuntimeException("Google token does not contain email or name");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Creating new user for email: {}", email);
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(fullName);
            newUser.setAuthProvider(AuthProvider.GOOGLE);
            newUser.setRole(UserRole.USER);
            newUser.setIsActive(true);

            newUser.setCountry(null);
            newUser.setCity(null);
            newUser.setGender(null);
            newUser.setDob(null);
            newUser.setPhoneNumber(null);

            if(pictureUrl != null){
                newUser.setProfileImage(fetchProfileImage(pictureUrl));
            }

            return userRepository.save(newUser);
        });

        log.info("Generating JWT token for user: {}", user.getEmail());
        String jwtToken = jwtUtil.generateToken(
                email,
                user.getAuthProvider(),
                user.getFullName(),
                user.getCountry(),
                user.getCity(),
                user.getGender(),
                user.getRole(),
                user.getId()
        );
        redisService.save(jwtToken, String.valueOf(user.getId()), jwtUtil.getTokenValidity());
        String refreshToken =jwtUtil.generateRefreshToken(email,user.getId(),user.getRole());

        UserLogin userLogin = userLoginRepository.findByUserId(user.getId())
                .orElse(new UserLogin());
        userLogin.setUser(user);
        userLogin.setJwtToken(jwtToken);
        userLogin.setRefreshToken(refreshToken);
        userLogin.setRefreshTokenExpiry(
                LocalDateTime.now().plusNanos(jwtUtil.getTokenValidity() * 1_000_000)
        );

        User savedUser = userRepository.save(user);

// create hotel owner for this user


        userLoginRepository.save(userLogin);

        log.info("User login saved for user: {}", user.getEmail());

        Map<String, Object> result = new HashMap<>();
        result.put("jwtToken", jwtToken);
        result.put("refreshToken", refreshToken);
        result.put("email", user.getEmail());
        result.put("fullName", user.getFullName());
        result.put("role", user.getRole().name());
        result.put("pictureUrl", pictureUrl);
        result.put("flag",user.getFlag());

        log.info("Returning result map: {}", result);
        return result;
    }

    private byte[] fetchProfileImage(String imageUrl) {
        try {
            log.info("Fetching profile image from URL: {}", imageUrl);

            URI uri = URI.create(imageUrl);        // modern recommended API
            URL url = uri.toURL();                 // safe conversion
            try (InputStream in = url.openStream()) {
                return in.readAllBytes();
            }

        } catch (Exception e) {
            log.error("Failed to fetch profile image from URL: {}", imageUrl, e);
            return null;
        }
    }


    @Transactional
    public boolean logoutUser(String accessToken) {
        return userLoginRepository.findByJwtToken(accessToken)
                .map(userLogin -> {
                    userLoginRepository.delete(userLogin); // Delete the row
                    return true;
                })
                .orElse(false);
    }



    public boolean updateExtraInfo(String email, UserAdditionalInfoDTO dto) {
        try {
            Optional<User> optionalUser = userRepository.findByEmail(email);
            if (optionalUser.isEmpty()) {
                return false; // User not found
            }

            User user = optionalUser.get(); // Get actual User object

            // Update fields from DTO
            if (dto.getFullName() != null) user.setFullName(dto.getFullName());
            if (dto.getCountry() != null) user.setCountry(dto.getCountry());
            if (dto.getCity() != null) user.setCity(dto.getCity());
            if (dto.getPhoneNumber() != null) user.setPhoneNumber(dto.getPhoneNumber());
            if (dto.getGender() != null) user.setGender(dto.getGender());
            if (dto.getDob() != null) user.setDob(dto.getDob());
            user.setFlag(Boolean.TRUE);

            userRepository.save(user); // Save the User entity
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    public String validateTokenAndGetEmail(String authHeader) {
        try {

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return null;
            }
            String token = authHeader.substring(7);

            if (!jwtUtil.isTokenValid(token)) {
                return null;
            }
            Optional<UserLogin> userLoginOpt = userLoginRepository.findByJwtToken(token);
            if (userLoginOpt.isEmpty()) {
                return null;
            }

            Claims email = jwtUtil.extractAllClaims(token);
            return email.get("sub",String.class);

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

}
