package com.example.demo.service.googleservice;
import com.example.demo.entity.users.*;
import com.example.demo.enums.*;
import com.example.demo.enums.users.UserRole;
import com.example.demo.repository.user.UserLoginRepository;
import com.example.demo.repository.user.UserRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.rediservice.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthService {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final UserLoginRepository userLoginRepository;
    private final RedisService redisService;

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
        userLogin.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        userLogin.setRefreshTokenCreatedAt(LocalDateTime.now());
        userLogin.setRevoked(false);
        User savedUser = userRepository.save(user);

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
        result.put("userId", savedUser.getId());

        log.info("Returning result map: {}", result);
        return result;
    }

}
