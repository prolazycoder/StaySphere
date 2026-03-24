package com.example.demo.repository.cab;

import com.example.demo.entity.cab.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    boolean existsByVehicleNumber(String vehicleNumber);
}