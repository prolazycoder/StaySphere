package com.example.demo.entity.users;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class UserLogin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Access token (stored in Redis for validation)
    @Column(length = 500, nullable = true, columnDefinition = "TEXT")
    private String jwtToken;

    // Refresh token stored in DB
    @Column(columnDefinition = "TEXT")
    private String refreshToken;

    // Refresh token creation time
    private LocalDateTime refreshTokenCreatedAt;

    // Refresh token expiry time
    private LocalDateTime refreshTokenExpiry;

    // Refresh token revoked flag
    @Builder.Default
    private Boolean revoked = false;

    // Relation with user
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;
}