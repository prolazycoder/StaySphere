package com.example.demo.controller.cabcontroller;

import com.example.demo.dto.VehicleRequestDTO;
import com.example.demo.service.cabservice.DriverRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/driver")
public class DriverRegistrationController {

    @Autowired
    private DriverRegistrationService driverRegistrationService;

    @PostMapping("/register")
    public ResponseEntity<?> registerDriver(@RequestHeader("Authorization") String token
    ) {
        Map<String, Object> response = driverRegistrationService.registerDriver(token);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/vehicle/register/{userId}")
    public ResponseEntity<?> registerVehicle(
            @PathVariable UUID userId, @RequestBody VehicleRequestDTO vehicleRequestDTO
    ) {
        Map<String, Object> response = driverRegistrationService.cabRegister(userId, vehicleRequestDTO);
        return ResponseEntity.ok(response);
    }
}