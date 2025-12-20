package com.example.demo.dto;

import com.example.demo.enums.users.Gender;
import com.example.demo.enums.users.UserRole;
import lombok.Data;

import java.util.UUID;

@Data
public class UserResponseDto {
    private UUID id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private UserRole role;
    private String country;
    private String city;
    private Gender gender;
}
