package com.example.demo.controller.cabcontroller;

import com.example.demo.dto.VehicleRequestDTO;
import com.example.demo.service.cabservice.DriverRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
public class DriverRegistrationController {

    private final DriverRegistrationService registrationService;
    private final com.example.demo.security.JwtUtil jwtUtil;

    // 1. Initial Driver Registration (Upgrades User to Driver Role)
    @PostMapping("/register")
    public ResponseEntity<?> registerDriver(@RequestHeader("Authorization") String token) {
        String jwtToken = token.replace("Bearer ", "");
        Map<String, Object> response = registrationService.registerDriver(token);
        return ResponseEntity.ok(response);
    }

    // 2. Vehicle Registration (Completes the process)
    @PostMapping("/vehicle-register")
    public ResponseEntity<?> registerVehicle(
            @RequestHeader("Authorization") String token,
            @RequestBody VehicleRequestDTO requestDTO) {
        String jwt = token.replace("Bearer ", "");
        UUID userId = jwtUtil.extractUserId(jwt);

        Map<String, Object> response = registrationService.cabRegister(userId, requestDTO);
        return ResponseEntity.ok(response);
    }
}
