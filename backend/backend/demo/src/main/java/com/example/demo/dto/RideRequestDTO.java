package com.example.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RideRequestDTO {

    // --- Pickup Location ---
    @NotNull(message = "Pickup latitude is required.")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90.")
    private BigDecimal pickupLat;

    @NotNull(message = "Pickup longitude is required.")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180.")
    private BigDecimal pickupLon;

    // --- Drop-off Location ---
    @NotNull(message = "Drop-off latitude is required.")
    private BigDecimal dropLat;

    @NotNull(message = "Drop-off longitude is required.")
    private BigDecimal dropLon;

    // Optional: Preferred Cab Type (e.g., SEDAN, SUV)
    private String preferredCabType;
}