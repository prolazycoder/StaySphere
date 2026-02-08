package com.example.demo.service.cabservice;

import com.example.demo.dto.socket.SearchDriverReq;
import com.example.demo.entity.cab.Ride;
import com.example.demo.enums.cab.RideStatus;
import com.example.demo.repository.cab.DriverRepository;
import com.example.demo.repository.cab.RideRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.rediservice.RedisLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.exception.DriverNotFoundException;

import java.util.*;

@Service
@RequiredArgsConstructor
public class RiderService {

    private final RedisLocationService redis;
    private final RideRepository rideRepo;
    private final DriverRepository driverRepo;
    private final SimpMessagingTemplate messaging;
    private final JwtUtil jwtUtil;

    // =======================================================
    // 1) RIDER SEARCHES FOR NEARBY DRIVERS
    // =======================================================
    public Ride searchDrivers(SearchDriverReq req, String token) {

        // 1. Rider ID from token
        UUID riderId = jwtUtil.extractUserId(token);

        // 2. Find nearby drivers
        System.out.println("DEBUG: Searching for drivers at " + req.getPickupLat() + ", " + req.getPickupLng());
        List<String> driverIds = redis.findNearbyDrivers(
                req.getPickupLat(),
                req.getPickupLng(),
                5000); // Increased radius to 5km for easier testing

        System.out.println("DEBUG: Found drivers: " + driverIds);

        if (driverIds.isEmpty()) {
            throw new DriverNotFoundException("No drivers available nearby");
        }

        // 3. Create ride
        Ride ride = Ride.builder()
                .riderId(riderId)
                .pickupLocation(req.getPickupLocation())
                .dropLocation(req.getDropLocation())
                .pickupLatitude(req.getPickupLat())
                .pickupLongitude(req.getPickupLng())
                .dropLatitude(req.getDropLat())
                .dropLongitude(req.getDropLng())
                .status(RideStatus.SEARCHING)
                .build();

        Ride savedRide = rideRepo.save(ride);

        // 4. Send ride request to drivers
        for (String driverId : driverIds) {

            messaging.convertAndSend(
                    "/topic/driver/" + driverId,
                    Map.of(
                            "event", "NEW_RIDE_REQUEST",
                            "rideId", savedRide.getId().toString(),
                            "pickupLat", req.getPickupLat(),
                            "pickupLng", req.getPickupLng(),
                            "dropLat", req.getDropLat(),
                            "dropLng", req.getDropLng()));
        }

        return savedRide;
    }

    // =======================================================
    // 2) RIDER CANCELS RIDE BEFORE DRIVER ACCEPTS
    // =======================================================
    public void cancelRide(UUID rideId, UUID riderId) {

        Ride ride = rideRepo.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getRiderId().equals(riderId)) {
            throw new RuntimeException("Unauthorized user!");
        }

        ride.setStatus(RideStatus.CANCELLED);
        rideRepo.save(ride);

        // Notify corresponding drivers/rider
        messaging.convertAndSend(
                "/topic/ride/" + rideId,
                Map.of("event", "RIDE_CANCELLED"));
    }

}
