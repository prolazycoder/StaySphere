package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class RideOtpVerifyDTO {
    @NotNull(message = "Ride ID is required.")
    private UUID rideId;

    @NotBlank(message = "OTP is required.")
    private String otp;

    // Optional: Driver ID for security check (can be extracted from JWT)
    private UUID driverId;
}