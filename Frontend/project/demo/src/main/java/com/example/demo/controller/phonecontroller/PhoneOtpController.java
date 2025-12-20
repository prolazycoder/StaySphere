package com.example.demo.controller.phonecontroller;

import com.example.demo.dto.PhoneAdditionalinforUpdateDTO;

import com.example.demo.service.phoneservice.PhoneService;
import com.example.demo.service.rediservice.RedisService;
import com.example.demo.service.otp.OtpService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/auth/phone")
@Tag(name = "Phone OTP Auth", description = "Handles OTP based phone authentication and registration")
public class PhoneOtpController {

    private final PhoneService phoneService;
    private final RedisService redisService;
    private final OtpService otpService;

    private static final String OTP_SESSION_KEY = "PHONE_OTP_SESSION_";

    public PhoneOtpController(PhoneService phoneService,
                              RedisService redisService,
                              OtpService otpService) {
        this.phoneService = phoneService;
        this.redisService = redisService;
        this.otpService = otpService;
    }


    // ---------------- Step 1: Send OTP ----------------
    @Operation(summary = "Send OTP", description = "Send OTP to a phone number")
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestParam String phone) {

        Map<String, Object> response = new HashMap<>();
        log.info("OTP send request received for phone: {}", phone);

        if (!phone.matches("^[0-9]{10}$")) {
            response.put("success", false);
            response.put("message", "Invalid phone number format");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Generate OTP
           // String otp = otpService.generateOtp("PHONE", phone);

            // Send OTP via service (MSG91)
            phoneService.sendOtp(phone );

            // Create unique OTP session token
            String otpToken = UUID.randomUUID().toString();
            redisService.save(OTP_SESSION_KEY + otpToken, phone, 5);

            response.put("success", true);
            response.put("message", "OTP sent successfully");
            response.put("otpToken", otpToken);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to send OTP: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }


    // ---------------- Step 2: Verify OTP and Login/Signup ----------------
    @Operation(summary = "Verify OTP", description = "Verify OTP using otpToken + otp")
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> req) {

        Map<String, Object> response = new HashMap<>();

        String otpToken = req.get("otpToken");
        String otp = req.get("otp");

        if (otpToken == null || otp == null) {
            response.put("success", false);
            response.put("message", "otpToken & otp are required");
            return ResponseEntity.badRequest().body(response);
        }

        String key = OTP_SESSION_KEY + otpToken;

        if (!redisService.exist(key)) {
            response.put("success", false);
            response.put("message", "Invalid or expired OTP session");
            return ResponseEntity.status(401).body(response);
        }
        String phone = redisService.get(key).toString();
        // Remove OTP session
        redisService.delete(key);

        // Login/Register User + return JWT
        Map<String, Object> loginResponse = phoneService.verifyOtp(phone, otp);

        return ResponseEntity.ok(loginResponse);
    }



}
