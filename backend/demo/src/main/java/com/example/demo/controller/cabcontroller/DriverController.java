package com.example.demo.controller.cabcontroller;

import com.example.demo.dto.socket.*;
import com.example.demo.service.cabservice.DriverSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
public class DriverController {

    private final DriverSocketService driverService;

    @PostMapping("/go-online")
    public ResponseEntity<?> goOnline(@RequestBody DriverOnlineReq req ,@RequestHeader("Authorization") String authHeader) {
        driverService.goOnline(authHeader, req.getLat(), req.getLng());
        return ResponseEntity.ok(Map.of("message", "Driver is now ONLINE"));
    }

    @PostMapping("/go-offline")
    public ResponseEntity<?> goOffline(@RequestHeader("Authorization") String authHeader) {
        driverService.goOffline(authHeader);
        return ResponseEntity.ok(Map.of("message", "Driver is now OFFLINE"));
    }

    @PostMapping("/location")
    public ResponseEntity<?> updateLocation(@RequestHeader("Authorization") String authHeader,@RequestBody GpsReq req) {
        driverService.gpsUpdate(authHeader , req.getLat(), req.getLng());
        return ResponseEntity.ok(Map.of("message", "Location updated"));
    }

    @PostMapping("/accept-ride")
    public void acceptRide(@RequestHeader("Authorization") String token,
                           @RequestParam UUID rideId) {
        driverService.acceptRide(token, rideId);
    }

    @PostMapping("/reject-ride")
    public ResponseEntity<?> rejectRide(@RequestBody RejectReq req) {
        driverService.rejectRide(req.getDriverId(), req.getRideId());
        return ResponseEntity.ok(Map.of("message", "Ride rejected"));
    }


    @PostMapping("/start-ride/{rideId}")
    public ResponseEntity<?> startRide(@PathVariable UUID rideId) {
        driverService.startRide(rideId);
        return ResponseEntity.ok(Map.of("message", "Ride started"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestParam UUID rideId,
            @RequestParam String otp
    ) {
        boolean verified = driverService.verifyOtp(rideId, otp);

        if (!verified) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP"));
        }

        return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
    }

    @PostMapping("/complete-ride")
    public ResponseEntity<?> completeRide(
            @RequestParam UUID rideId,
            @RequestParam double actualDistanceKm,
            @RequestParam double actualMinutes
    ) {
        driverService.completeRide(rideId, actualDistanceKm, actualMinutes);

        return ResponseEntity.ok(Map.of(
                "message", "Ride completed successfully",
                "distanceKm", actualDistanceKm,
                "timeMinutes", actualMinutes
        ));
    }

    @GetMapping("/status/{driverId}")
    public ResponseEntity<?> status(@PathVariable UUID driverId) {
        return ResponseEntity.ok(Map.of("driverId", driverId));
    }
}
