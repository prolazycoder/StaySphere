package com.example.demo.service.cabservice;

import com.example.demo.entity.cab.Driver;
import com.example.demo.entity.cab.DriverDue;
import com.example.demo.entity.cab.Ride;
import com.example.demo.entity.cab.Vehicle;
import com.example.demo.enums.cab.DriverStatus;
import com.example.demo.enums.cab.RideStatus;
import com.example.demo.repository.cab.DriverDueRepository;
import com.example.demo.repository.cab.DriverRepository;
import com.example.demo.repository.cab.RideRepository;
import com.example.demo.repository.cab.VehicleRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.otp.OtpService;
import com.example.demo.service.rediservice.RedisLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DriverSocketService {

    private final DriverRepository driverRepo;
    private final RideRepository rideRepo;
    private final DriverDueRepository driverDueRepo;
    private final VehicleRepository vehicleRepo;
    private final JwtUtil jwtUtil;
    private final RedisLocationService redisService;
    private final SimpMessagingTemplate messaging;
    private final OtpService otpService;
    private final FareService fareService;  // <-- NEWLY ADDED

    // =======================================================
    // 1) DRIVER GOES ONLINE
    // =======================================================
    public void goOnline(String token  , double lat, double lng) {

         UUID driverId  = jwtUtil.extractUserId(token);
        Driver driver = driverRepo.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        if (driver.isBlocked()) {
            throw new RuntimeException("Please clear your dues");
        }

        driver.setStatus(DriverStatus.ONLINE);
        driverRepo.save(driver);

        redisService.goOnline(driverId, lat, lng);
    }

    // =======================================================
    // 2) DRIVER GOES OFFLINE
    // =======================================================
    public void goOffline(String token ) {
        UUID driverId  = jwtUtil.extractUserId(token);
        driverRepo.updateStatus(driverId, DriverStatus.OFFLINE);
        redisService.goOffline(driverId);
    }

    // =======================================================
    // 3) DRIVER SENDS LIVE LOCATION
    // =======================================================
    public void gpsUpdate(String token , double lat, double lng) {
        UUID driverId  = jwtUtil.extractUserId(token);
        redisService.updateLocation(driverId, lat, lng);
        Ride ride  = rideRepo.findByDriverIdAndStatus(driverId,RideStatus.DRIVER_ASSIGNED)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        if (ride.getId()!= null) {
            messaging.convertAndSend(
                    "/topic/ride/" + ride.getId().toString(),
                    Map.of("lat", lat, "lng", lng)
            );
        }
    }

    // =======================================================
    // 4) DRIVER ACCEPTS RIDE → REDIS OTP + FARE ESTIMATION
    // =======================================================
    public void acceptRide(String token, UUID rideId) {

        // driverId from token (real world)
        UUID userId = jwtUtil.extractUserId(token);

        Driver driver = driverRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Not a driver"));

        Ride ride = rideRepo.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        // ride already taken
        if (ride.getDriverId() != null) return;

        ride.setDriverId(driver.getDriverId());
        ride.setStatus(RideStatus.DRIVER_ASSIGNED);
        ride.setOtpVerified(false);

        // Fare estimation
        double estimatedFare = fareService.estimateFare(
                ride.getPickupLatitude(),
                ride.getPickupLongitude(),
                ride.getDropLatitude(),
                ride.getDropLongitude()
        );

        ride.setFareEstimate(BigDecimal.valueOf(estimatedFare));
        rideRepo.save(ride);

        // OTP
        String otp = otpService.generateOtp("ride", rideId.toString());

        Vehicle vehicle = driver.getVehicle();

        // notify rider
        messaging.convertAndSend(
                "/topic/rider/" + ride.getRiderId(),
                Map.of(
                        "event", "DRIVER_ASSIGNED",
                        "rideId", rideId,
                        "driverName", driver.getUser().getFullName(),
                        "vehicleModel", vehicle.getVehicleModel(),
                        "vehicleNumber", vehicle.getVehicleNumber(),
                        "otp", otp,
                        "estimatedFare", estimatedFare
                )
        );
    }


    // =======================================================
    // 5) VERIFY OTP
    // =======================================================
    public boolean verifyOtp(UUID rideId, String otp) {

        Ride ride = rideRepo.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        boolean valid = otpService.validateOtp("ride", rideId.toString(), otp);

        if (!valid) return false;

        ride.setOtpVerified(true);
        rideRepo.save(ride);

        return true;
    }

    // =======================================================
    // 6) START RIDE
    // =======================================================
    public void startRide(UUID rideId) {

        Ride ride = rideRepo.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getOtpVerified()) {
            throw new RuntimeException("OTP not verified yet!");
        }

        ride.setStatus(RideStatus.ONGOING);
        rideRepo.save(ride);

        messaging.convertAndSend(
                "/topic/rider/" + ride.getRiderId(),
                Map.of("event", "RIDE_STARTED", "rideId", rideId)
        );
    }

    // =======================================================
    // 7) COMPLETE RIDE → CALCULATE FINAL FARE
    // =======================================================
    public void completeRide(UUID rideId, double actualDistanceKm, double actualMinutes) {

        Ride ride = rideRepo.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        // ===== FINAL FARE CALCULATION =====
        double finalFare = fareService.calculateFinalFare(actualDistanceKm, actualMinutes);

        ride.setFinalFare(BigDecimal.valueOf(finalFare));
        ride.setStatus(RideStatus.COMPLETED);
        rideRepo.save(ride);

        // ===== COMMISSION LOGIC =====
        BigDecimal commission = BigDecimal.valueOf(finalFare).multiply(BigDecimal.valueOf(0.20));

        DriverDue due = driverDueRepo.findByDriver_DriverId(ride.getDriverId())
                .orElseThrow(() -> new RuntimeException("DriverDue not found"));


        due.setTotalGrossEarnings(due.getTotalGrossEarnings().add(BigDecimal.valueOf(finalFare)));
        due.setAmountDueToCompany(due.getAmountDueToCompany().add(commission));

        // Auto block driver
        if (due.getAmountDueToCompany().compareTo(BigDecimal.valueOf(1500)) > 0) {
            due.setBlocked(true);

            Driver driver = driverRepo.findById(ride.getDriverId()).orElseThrow();
            driver.setBlocked(true);

            driverRepo.save(driver);
        }

        driverDueRepo.save(due);

        messaging.convertAndSend(
                "/topic/rider/" + ride.getRiderId(),
                Map.of(
                        "event", "RIDE_COMPLETED",
                        "fare", finalFare
                )
        );
    }

    // =======================================================
    // 8) DRIVER REJECTS RIDE
    // =======================================================
    public void rejectRide(UUID driverId, UUID rideId) {

        Ride ride = rideRepo.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getDriverId() != null) return;

        messaging.convertAndSend(
                "/topic/ride/" + rideId,
                Map.of(
                        "event", "DRIVER_REJECTED",
                        "driverId", driverId
                )
        );
    }
}
