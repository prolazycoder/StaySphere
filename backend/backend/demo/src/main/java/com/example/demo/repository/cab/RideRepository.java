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

    // Find rides for a specific rider by their ID
    List<Ride> findByRiderIdOrderByCreatedAtDesc(UUID riderId);

    // Find active rides (e.g., SEARCHING, ACCEPTED, IN_PROGRESS)
    //List<Ride> findByDriverIdAndStatusIn(UUID driverId, RideStatus statuses);

    // Find a ride by ID and check if it's currently active (for cancellation/completion)
    Optional<Ride> findByIdAndStatusIn(UUID rideId, List<RideStatus> statuses);

    Optional<Ride> findByDriverIdAndStatus(UUID driverId, RideStatus status);

}