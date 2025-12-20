package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class RideOtpRequestDTO {
    @NotNull(message = "Ride ID is required.")
    private UUID rideId;
}