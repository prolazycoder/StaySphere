package com.example.demo.entity.cab;

import com.example.demo.entity.users.User;
import com.example.demo.enums.cab.RideStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "rides")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "rider_id")
    private UUID riderId;

    @Column(name = "driver_id")
    private UUID driverId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_id", insertable = false, updatable = false)
    private User rider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", referencedColumnName = "driver_id", insertable = false, updatable = false)
    private Driver driver;

    private String pickupLocation;
    private String dropLocation;

    private double pickupLatitude;
    private double pickupLongitude;
    private double dropLatitude;
    private double dropLongitude;

    private Boolean OtpVerified = Boolean.FALSE ;
    @Enumerated(EnumType.STRING)
    private RideStatus status;

    private BigDecimal fareEstimate;
    private BigDecimal finalFare;

    @CreationTimestamp
    private Instant createdAt;
}
