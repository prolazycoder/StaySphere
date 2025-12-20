package com.example.demo.dto;

import com.example.demo.enums.cab.DriverStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DriverResponse {

    private UUID driverId;

    // Flattened User Details
    private String fullName;
    private String email;
    private String phoneNumber;

    // Driver Status & Verification
    private DriverStatus status;
    private boolean isVerified; // aggregate of pan/aadhar/license verified

    // Location Data (Nullable if offline)
    private BigDecimal currentLatitude;
    private BigDecimal currentLongitude;

    // Vehicle Summary
    private String vehicleModel;
    private String vehicleNumber;

    private String jwtToken;
    private String refreshToken;
    private String role;
}