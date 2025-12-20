package com.example.demo.controller.cabcontroller;

import com.example.demo.dto.socket.SearchDriverReq;
import com.example.demo.entity.cab.Ride;
import com.example.demo.service.cabservice.DriverSocketService;
import com.example.demo.service.cabservice.RiderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rider")
@RequiredArgsConstructor
public class RiderController {

    private final RiderService riderService;
    private final DriverSocketService driverSocketService;

    // =====================================================
    // 1. RIDER SEARCHES FOR DRIVERS
    // =====================================================

    @PostMapping("/search-drivers")
    public Ride searchDrivers(@RequestBody SearchDriverReq req,
                              @RequestHeader("Authorization") String token) {
        return riderService.searchDrivers(req, token);
    }

    // =====================================================
    // 2. RIDER CANCELS RIDE (BEFORE ACCEPTED)
    // =====================================================
    @PostMapping("/cancel-ride")
    public ResponseEntity<?> cancelRide(
            @RequestParam UUID rideId,
            @RequestParam UUID riderId
    ) {
        riderService.cancelRide(rideId, riderId);

        return ResponseEntity.ok(Map.of("message", "Ride cancelled successfully"));
    }

    // =====================================================
    // 3. RIDER VERIFIES OTP
    // =====================================================


    // =====================================================
    // 4. DRIVER STARTS RIDE (after OTP verified)
    // =====================================================
    @PostMapping("/start-ride")
    public ResponseEntity<?> startRide(@RequestParam UUID rideId) {

        driverSocketService.startRide(rideId);

        return ResponseEntity.ok(Map.of("message", "Ride started"));
    }

    // =====================================================
    // 5. COMPLETE RIDE → UPDATE DRIVER DUE
    // =====================================================
    @PostMapping("/complete-ride")
    public ResponseEntity<?> completeRide(
            @RequestParam UUID rideId,
            @RequestParam double actualDistanceKm,
            @RequestParam double actualMinutes
    ) {
        driverSocketService.completeRide(rideId, actualDistanceKm, actualMinutes);

        return ResponseEntity.ok(Map.of(
                "message", "Ride completed and fare calculated automatically",
                "distanceKm", actualDistanceKm,
                "timeMinutes", actualMinutes
        ));
    }


    // =====================================================
    // 6. SOCKET EVENT: Optional Rider Live Location
    // =====================================================
    @MessageMapping("/rider/updateLocation")
    public void updateLocation(Map<String, Object> payload) {
        // Can store into Redis if needed later
    }
}
