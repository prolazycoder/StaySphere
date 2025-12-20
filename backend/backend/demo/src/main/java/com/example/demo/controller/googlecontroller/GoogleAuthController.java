package com.example.demo.controller.googlecontroller;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import com.example.demo.dto.UserAdditionalInfoDTO;
import com.example.demo.service.googleservice.GoogleAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Google Authentication", description = "Endpoints for Google login/signup")
public class GoogleAuthController {

    private final GoogleAuthService googleAuthService;

    private static final Logger logger = LoggerFactory.getLogger(GoogleAuthController.class);

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String redirectUri;

    @Value("${spring.security.oauth2.client.registration.google.scope}")
    private String scope;

    @GetMapping("/auth/google/login")
    public void loginWithGoogle(HttpServletResponse response) throws IOException {
        String googleScope = scope.replace(",", " ");
        String googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth" +
                "?client_id=" + clientId +
                "&redirect_uri=" + redirectUri +
                "&response_type=code" +
                "&scope=" + googleScope;


        response.sendRedirect(googleAuthUrl);
    }

//
//    @GetMapping(value = "/auth/google/callback")
//    @Operation(summary = "Google OAuth2 callback", description = "Google redirects here with code, backend returns JWT")
//    public Map<String, Object> googleCallback(@RequestParam("code") String code) {
//        logger.info("Received Google OAuth2 callback with code: {}", code);
//
//
//        Map<String, Object> jwtData = googleAuthService.authenticateWithGoogleCode(code);
//
//        logger.info("Google authentication successful for email: {}", jwtData.get("email"));
//        logger.debug("JWT Data: {}", jwtData);
//
//
//        return jwtData;
//
//
//    }

    @GetMapping("/auth/google/callback")
    public void googleCallback(
            @RequestParam("code") String code,
            HttpServletResponse response
    ) throws IOException {

        logger.info("Received Google OAuth2 callback with code: {}", code);

        // Authenticate user and generate tokens
        Map<String, Object> jwtData = googleAuthService.authenticateWithGoogleCode(code);

        String accessToken = (String) jwtData.get("jwtToken");
        String refreshToken = (String) jwtData.get("refreshToken");
        String fullName = (String) jwtData.get("fullName");
        String email = (String) jwtData.get("email");
        String pictureUrl = (String) jwtData.get("pictureUrl");

        String redirectUrl = "http://localhost:5173/oauth-success"
                + "?accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                + "&refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8)
                + "&fullName=" + URLEncoder.encode(fullName, StandardCharsets.UTF_8)
                + "&email=" + URLEncoder.encode(email, StandardCharsets.UTF_8)
                + "&pictureUrl=" + URLEncoder.encode(pictureUrl, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);


        //response.sendRedirect(redirectUrl);
    }



}
