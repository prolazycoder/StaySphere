package com.example.demo.repository.cab;

import com.example.demo.entity.cab.Ride;
import com.example.demo.enums.cab.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RideRepository extends JpaRepository<Ride, UUID> {
    Optional<Ride> findByDriverIdAndStatus(UUID driverId, RideStatus status);
}