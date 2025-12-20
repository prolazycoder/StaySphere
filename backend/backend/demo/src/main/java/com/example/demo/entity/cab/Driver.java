package com.example.demo.entity.cab;

import com.example.demo.entity.users.User;
import com.example.demo.enums.cab.DriverStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "cab_owners"
)
@Data
@Builder @AllArgsConstructor @NoArgsConstructor


public class Driver {

    @Id
    @Column(name = "driver_id")
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID driverId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private boolean panVerified;
    private boolean aadharVerified;
    private boolean licenseVerified;

    // Driver will be blocked when weekly dues not paid
    private boolean blocked = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriverStatus status = DriverStatus.OFFLINE;

    @Column(precision = 10, scale = 7)
    private BigDecimal currentLatitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal currentLongitude;

    @Column(length = 12)
    private String currentGeohash;

    private LocalDateTime lastPing;

    @OneToOne(mappedBy = "driver", cascade = CascadeType.ALL, orphanRemoval = true)
    private Vehicle vehicle;

}

