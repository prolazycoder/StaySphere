package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DriverRegistrationRequest {

    // --- User Details (For creating the AppUser) ---
    private String fullName;
    private String email;
    private String phoneNumber;
    // Add 'password' here if you are not using SSO/OTP only

}