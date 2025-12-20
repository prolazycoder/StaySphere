

package com.example.demo.controller.emailcontroller;


import com.example.demo.controller.googlecontroller.GoogleAuthController;
import com.example.demo.dto.UserAdditionalInfoDTO;
import com.example.demo.service.rediservice.RedisService;
import com.example.demo.service.emailservice.EmailService;

import com.example.demo.service.otp.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/auth/otp")
@Tag(name = "Email OTP Auth", description = "Handles OTP based email authentication and registration")
public class EmailOtpController {

    private final EmailService emailService;
    private final RedisService redisService;
    private final OtpService otpService;
    // private final AuthService authService;
    private static final Logger logger = LoggerFactory.getLogger(GoogleAuthController.class);
    private static final String OTP_SESSION_KEY = "OTP_SESSION_";
    private static final String TEMP_REG_TOKEN_KEY = "TEMP_REGISTRATION_TOKEN_";

    public EmailOtpController(EmailService emailService,
                              RedisService redisService,
                              OtpService otpService) {
        this.emailService = emailService;
        this.redisService = redisService;
        this.otpService = otpService;

    }

//    // ---------------- Step 1: Send OTP ----------------
//    @Operation(summary = "Send OTP", description = "Send OTP to email for verification")
//    @PostMapping("/send")
//    public ResponseEntity<Map<String, Object>> sendOtp(@RequestParam String email) {
//        Map<String, Object> response = new HashMap<>();
//        logger.info("OTP send request received for email: {}", email);
//
//        // Validate email format
//        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
//            response.put("success", false);
//            response.put("message", "Invalid email format!");
//            return ResponseEntity.badRequest().body(response);
//        }
//
//        try {
//            // Generate OTP and send
//            String otp = otpService.generateOtp("EMAIL", email);
//            emailService.sendEmail(email, otp);
//
//            // Generate OTP session token
//            String otpToken = UUID.randomUUID().toString();
//            redisService.save(OTP_SESSION_KEY + otpToken, email, 5); // valid 5 min
//
//            response.put("success", true);
//            response.put("message", "OTP sent to email");
//            response.put("otpToken", otpToken);
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            response.put("success", false);
//            response.put("message", e.getMessage());
//            return ResponseEntity.status(500).body(response);
//        }
//    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        logger.info("OTP send request received for email: {}", email);

        // Validate email format
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            response.put("success", false);
            response.put("message", "Invalid email format!");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // USE EMAIL SERVICE (handles cooldown + sending)
            emailService.sendOtp(email);

            // Create OTP Token for verification
            String otpToken = UUID.randomUUID().toString();
            redisService.save(OTP_SESSION_KEY + otpToken, email, 5);

            response.put("success", true);
            response.put("message", "OTP sent successfully");
            response.put("otpToken", otpToken);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // COOLDOWN OR BUSINESS ERRORS
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            // UNEXPECTED SYSTEM ERRORS
            response.put("success", false);
            response.put("message", "Something went wrong. Try again later.");
            return ResponseEntity.status(500).body(response);
        }
    }

    // ---------------- Step 2: Verify OTP ----------------
    @Operation(summary = "Verify OTP", description = "Verify OTP using otpToken")
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> req) {
        Map<String, Object> response = new HashMap<>();

        String otpToken = req.get("otpToken");
        String otp = req.get("otp");

        String tokenKey = OTP_SESSION_KEY + otpToken;
        if (!redisService.exist(tokenKey)) {
            response.put("success", false);
            response.put("message", "Invalid or expired OTP session token");
            return ResponseEntity.status(401).body(response);
        }

        String email = redisService.get(tokenKey).toString();
        boolean valid = otpService.validateOtp("EMAIL", email, otp);

        if (!valid) {
            response.put("success", false);
            response.put("message", "Invalid or expired OTP");
            return ResponseEntity.status(401).body(response);
        }



        // OTP verified, delete OTP session
        redisService.delete(tokenKey);

        return  ResponseEntity.ok( emailService.registerUser(email));
    }

}