package com.example.demo.dto;

import com.example.demo.enums.users.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PhoneAdditionalinforUpdateDTO {

    private String fullName;
    private String country;
    private String city;
    private String phoneNumber;
    private Gender gender;
    private LocalDate dob;
    private String email;

}
