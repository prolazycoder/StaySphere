package com.example.demo.service.cabservice;

import com.example.demo.entity.cab.DriverDue;
import com.example.demo.enums.cab.DriverStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.dto.VehicleRequestDTO;
import com.example.demo.entity.cab.Driver;
import com.example.demo.entity.cab.Vehicle;
import com.example.demo.entity.users.User;
import com.example.demo.entity.users.UserLogin;
import com.example.demo.enums.users.UserRole;
import com.example.demo.repository.cab.DriverDueRepository;
import com.example.demo.repository.cab.DriverRepository;
import com.example.demo.repository.user.*;
import com.example.demo.repository.cab.VehicleRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.rediservice.RedisService;
import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.crypto.password.PasswordEncoder; // Uncomment if you use password encoding
import org.springframework.stereotype.Service;


import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
@Service
@Transactional
public class DriverRegistrationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverDueRepository driverDueRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserLoginRepository userLoginRepository;

    @Autowired
    private RedisService redisService;


    private UUID extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Claims claims = jwtUtil.extractAllClaims(token);
        return UUID.fromString(claims.get("userID").toString());
    }


    public Map<String, Object> registerDriver(String token) {

        UUID id = extractUserId(token);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("First create an account"));

        // ******** Profile Validation ********
        if (user.getEmail() == null ||
                user.getPhoneNumber() == null ||
                user.getFullName() == null ||
                user.getCity() == null ||
                user.getCountry() == null) {

            throw new BadRequestException("Please update your profile completely");
        }

        // ******** Create Driver ********
        Driver driver = driverRepository.findByUser(user)
                .orElseGet(() -> driverRepository.save(Driver.builder()
                        .user(user)
                        .status(DriverStatus.OFFLINE)
                        .blocked(false)
                        .build()
                ));

        // ******** Create DriverDue Record ********
        driverDueRepository.findByDriver(driver)
                .orElseGet(() -> {
                    DriverDue due = DriverDue.builder()
                            .driver(driver)
                            .amountDueToCompany(BigDecimal.ZERO)
                            .totalGrossEarnings(BigDecimal.ZERO)
                            .weekStart(LocalDate.now().with(DayOfWeek.MONDAY))
                            .weekEnd(LocalDate.now().with(DayOfWeek.SUNDAY))
                            .blocked(false)
                            .build();
                    return driverDueRepository.save(due);
                });

        // ******** Generate JWT ********
        UserLogin login = userLoginRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Login info not found"));

        String jwt = jwtUtil.generateToken(
                user.getEmail(),
                user.getAuthProvider(),
                user.getFullName(),
                user.getCountry(),
                user.getCity(),
                user.getGender(),
                UserRole.DRIVER,
                driver.getDriverId()
        );

        String refresh = jwtUtil.generateRefreshToken(
                user.getEmail(), user.getId(), UserRole.DRIVER
        );

        login.setJwtToken(jwt);
        login.setRefreshToken(refresh);

        redisService.save(jwt, user.getId().toString(), jwtUtil.getTokenValidity());

        Map<String, Object> response = new HashMap<>();
        response.put("jwtToken", jwt);
        response.put("refreshToken", refresh);
        response.put("driverId", driver.getDriverId());

        return response;
    }


    public Map<String, Object> cabRegister(UUID id, VehicleRequestDTO requestDTO) {

        Driver driver = driverRepository.findByUserId(id)
                .orElseThrow(() -> new BadRequestException("Invalid driver"));

        // Already has vehicle?
        if (driver.getVehicle() != null) {
            throw new BadRequestException("Vehicle already registered");
        }

        // KYC verification check
        if (!driver.isAadharVerified() ||
                !driver.isLicenseVerified() ||
                !driver.isPanVerified()) {
            throw new BadRequestException("Please complete KYC verification");
        }

        // Duplicate vehicle number
        if (vehicleRepository.existsByVehicleNumber(requestDTO.getVehicleNumber())) {
            throw new BadRequestException("Vehicle number already registered");
        }

        // Create vehicle
        Vehicle vehicle = Vehicle.builder()
                .driver(driver)
                .vehicleModel(requestDTO.getVehicleModel())
                .vehicleNumber(requestDTO.getVehicleNumber())
                .vehicleType(requestDTO.getVehicleType())
                .seatingCapacity(requestDTO.getSeatingCapacity())
                .build();

        vehicleRepository.save(vehicle);

        // Update driver status
        driver.setStatus(DriverStatus.OFFLINE);
        driverRepository.save(driver);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Vehicle registered successfully");
        response.put("driverId", driver.getDriverId());
        response.put("vehicleId", vehicle.getVehicleId());

        return response;
    }
}
