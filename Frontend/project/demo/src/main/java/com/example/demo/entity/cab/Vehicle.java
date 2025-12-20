package com.example.demo.entity.cab;

import com.example.demo.enums.cab.CabType;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "vehicles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID vehicleId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cab_owner_id", nullable = false, unique = true, referencedColumnName = "driver_id")
    private Driver driver;

    private String vehicleModel;

    private String vehicleNumber;

    @Enumerated(EnumType.STRING)
    private CabType vehicleType;

    private Integer seatingCapacity;
}
