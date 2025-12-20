package com.example.demo.dto;

import lombok.Data;
import java.util.List;
import jakarta.validation.constraints.*;


@Data
public class HotelCreateRequest {

    @NotBlank(message = "Please enter your id")
    private String hotelOwnerId;
    @NotBlank(message = "Hotel name is required")
    @Size(min = 3, max = 100, message = "Hotel name must be between 3 and 100 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")
    private String description;


    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Country is required")
    private String country;

    @DecimalMin(value = "-90.0", message = "Latitude must be >= -90")
    @DecimalMax(value = "90.0", message = "Latitude must be <= 90")
    private double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
    @DecimalMax(value = "180.0", message = "Longitude must be <= 180")
    private double longitude;

    @Min(value = 1, message = "Stars must be at least 1")
    @Max(value = 5, message = "Stars cannot exceed 5")
    private int stars;


    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[0-9]{10,15}$",
            message = "Phone number must be 10–15 digits"
    )
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;


    private List<String> amenities;
}
