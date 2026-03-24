package com.example.demo.service.cabservice;

import com.example.demo.dto.socket.SearchDriverReq;
import com.example.demo.entity.cab.Driver;
import com.example.demo.entity.cab.Ride;
import com.example.demo.entity.cab.Vehicle;
import com.example.demo.enums.cab.RideStatus;
import com.example.demo.repository.cab.DriverRepository;
import com.example.demo.repository.cab.RideRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.rediservice.RedisLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RiderService {

    private final RedisLocationService redis;
    private final RideRepository rideRepo;
    private final DriverRepository driverRepo;
    private final SimpMessagingTemplate messaging;
    private final JwtUtil jwtUtil ;


    public Ride searchDrivers(SearchDriverReq req, String token) {

        UUID riderId = jwtUtil.extractUserId(token);
        List<String> driverIds = redis.findNearbyDrivers(
                req.getPickupLat(),
                req.getPickupLng(),
                3000
        );

        if (driverIds.isEmpty()) {
            throw new RuntimeException("No drivers available nearby");
        }
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
        for (String driverId : driverIds) {
            messaging.convertAndSend(
                    "/topic/driver/" + driverId,
                    Map.of(
                            "event", "NEW_RIDE_REQUEST",
                            "rideId", savedRide.getId().toString(),
                            "pickupLat", req.getPickupLat(),
                            "pickupLng", req.getPickupLng(),
                            "dropLat", req.getDropLat(),
                            "dropLng", req.getDropLng()
                    )
            );
        }
        return savedRide;
    }

    public void cancelRide(UUID rideId, UUID riderId) {
        Ride ride = rideRepo.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getRiderId().equals(riderId)) {
            throw new RuntimeException("Unauthorized user!");
        }
        ride.setStatus(RideStatus.CANCELLED);
        rideRepo.save(ride);
        messaging.convertAndSend(
                "/topic/ride/" + rideId,
                Map.of("event", "RIDE_CANCELLED")
        );
    }


}
