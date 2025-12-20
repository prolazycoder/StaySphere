package com.example.demo.entity.users;

import com.example.demo.enums.*;
import com.example.demo.enums.users.Gender;
import com.example.demo.enums.users.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "app_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String fullName;

    @Column(unique = true)
    private String email; // optional for OTP login

    // private String password; // optional for Google / OTP login

    @Column(unique = true)
    private String phoneNumber; // optional for Email / Google login

    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.USER;

    @Column(nullable = false)
    private boolean isActive = true;

    private String country;

    private String city;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private LocalDate dob;

    private Boolean flag =  false;

    @Basic(fetch = FetchType.LAZY)
    @Column(columnDefinition = "BYTEA")
    private byte[] profileImage=new byte[0];

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider authProvider = AuthProvider.EMAIL;

    public void setIsActive(boolean b) {
        this.isActive = b;
    }
}
