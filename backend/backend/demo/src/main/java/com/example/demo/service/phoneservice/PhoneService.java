package com.example.demo.service.phoneservice;

import com.example.demo.dto.PhoneAdditionalinforUpdateDTO;
import com.example.demo.entity.users.User;
import com.example.demo.entity.users.UserLogin;
import com.example.demo.enums.AuthProvider;
import com.example.demo.repository.hotel.HotelOwnerRepository;
import com.example.demo.repository.user.UserLoginRepository;
import com.example.demo.repository.user.UserRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.otp.OtpService;
import com.example.demo.service.rediservice.RedisService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PhoneService {

    private final RedisService redisService;
    private final OtpService otpService;
    private final UserRepository userRepository;
    private final UserLoginRepository userLoginRepository;
    private final JwtUtil jwtUtil;
    private final HotelOwnerRepository  hotelOwnerRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String OTP_PREFIX = "PHONEOTP_";

    // MSG91 Configuration
    private final String AUTH_KEY = "YOUR_KEY";
    private final String TEMPLATE_ID = "YOUR_TEMPLATE_ID";


    // 🔹 Step 1 ➝ Send OTP via MSG91
    public Map<String, Object> sendOtp(String phoneNumber) {
        log.info("Request received to send OTP to {}", maskPhone(phoneNumber));

        Map<String, Object> response = new HashMap<>();

        try {
            String otp = otpService.generateOtp(OTP_PREFIX + phoneNumber, phoneNumber);
            log.info("OTP generated for {}", otp);

            String url = "https://api.msg91.com/api/v5/otp" +
                    "?authkey=" + AUTH_KEY +
                    "&mobile=" + phoneNumber +
                    "&otp=" + otp +
                    "&template_id=" + TEMPLATE_ID;

            log.info("Calling MSG91 OTP API for {}", maskPhone(phoneNumber));
            restTemplate.getForEntity(url, String.class);

            log.info("OTP successfully sent to {}", maskPhone(phoneNumber));

            response.put("status", true);
            response.put("message", "OTP sent");

        } catch (Exception e) {
            log.error("Failed to send OTP to {} -> {}", maskPhone(phoneNumber), e.getMessage());

            response.put("status", false);
            response.put("message", "Failed to send OTP");
        }

        return response;
    }



    // 🔹 Step 2 ➝ OTP Verification / Login
    public Map<String, Object> verifyOtp(String phoneNumber, String otp) {

        log.info("OTP verification request for {}", maskPhone(phoneNumber));

        Map<String, Object> response = new HashMap<>();

        if (!otpService.validateOtp(OTP_PREFIX + phoneNumber, phoneNumber, otp)) {
            log.warn("Invalid OTP for {}", maskPhone(phoneNumber));
            response.put("status", false);
            response.put("message", "Invalid OTP");
            return response;
        }

        log.info("OTP verified for {}", maskPhone(phoneNumber));

        // Fetch or create user
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseGet(() -> {
                    log.info("User not found. Creating new user for {}", maskPhone(phoneNumber));
                    return createUser(phoneNumber);
                });
        User savedUser = userRepository.save(user);

        log.info("Generating JWT token for user {}", user.getId());

        String token = jwtUtil.generateToken(
                user.getPhoneNumber(),
                user.getAuthProvider(),
                user.getFullName(),
                user.getCountry(),
                user.getCity(),
                user.getGender(),
                user.getRole(),
                user.getId()
        );

        String refreshToken = jwtUtil.generateRefreshToken(user.getPhoneNumber(),user.getId(),user.getRole());

        redisService.save(token, String.valueOf(user.getId()), jwtUtil.getTokenValidity());
        log.info("Access token stored in Redis for user {} with expiry {} seconds",
                user.getId(), jwtUtil.getTokenValidity());

        saveUserLogin(user, token, refreshToken);

        response.put("status", true);
        response.put("jwt", token);
        response.put("refreshToken", refreshToken);

        log.info("Login process completed successfully for user {}", user.getId());

        return response;
    }


    private User createUser(String phone) {
        log.info("Creating user using phone {}", maskPhone(phone));

        User user = new User();
        user.setPhoneNumber(phone);
        user.setAuthProvider(AuthProvider.PHONE);
        user.setFullName(phone); // temporary name as phone

        User savedUser = userRepository.save(user);
        log.info("New user created with ID {}", savedUser.getId());

        return savedUser;
    }



    private void saveUserLogin(User user, String token, String refreshToken) {
        log.info("Saving login record for user {}", user.getId());

        UserLogin login = userLoginRepository.findByUser(user).orElse(new UserLogin());

        login.setUser(user);
        login.setJwtToken(token);
        login.setRefreshToken(refreshToken);
        login.setRefreshTokenExpiry(LocalDateTime.now().plusDays(30));

        userLoginRepository.save(login);
        log.info("Login record saved for user {}", user.getId());
    }



    // 🔹 Step 3 ➝ Update Additional Info
    public Map<String, Object> updateUserInfo(String jwtToken, PhoneAdditionalinforUpdateDTO dto) {

        log.info("Updating user info using token: {}", truncateToken(jwtToken));

        Map<String, Object> response = new HashMap<>();

        Object userIdObj = redisService.get(jwtToken);
        if (userIdObj == null) {
            log.warn("Token invalid or expired: {}", truncateToken(jwtToken));
            response.put("status", false);
            response.put("message", "Token expired / unauthorized");
            return response;
        }

        UUID userId = UUID.fromString(userIdObj.toString());
        log.info("Updating info for user {}", userId);
        User user = userRepository.findById(userId).orElseThrow();

        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getCountry() != null) user.setCountry(dto.getCountry());
        if (dto.getCity() != null) user.setCity(dto.getCity());
        if (dto.getDob() != null) user.setDob(dto.getDob());
        if (dto.getGender() != null) user.setGender(dto.getGender());
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {

            // check if this email already belongs to another user
            if (userRepository.existsByEmail(dto.getEmail())) {
                response.put("status", false);
                response.put("message", "Email already exists. Please use a different email.");
                return response;
            }

            // Email doesn't exist → safe to update
            user.setEmail(dto.getEmail());
        }


        userRepository.save(user);

        log.info("User info updated for user {}", userId);

        response.put("status", true);
        response.put("message", "User info updated");
        return response;
    }






    // Utility: Mask phone for safe logs
    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "****";
        return "******" + phone.substring(phone.length() - 4);
    }

    // Utility: Shorten token for logs
    private String truncateToken(String token) {
        if (token == null || token.length() < 10) return token;
        return token.substring(0, 10) + "****";
    }
}
