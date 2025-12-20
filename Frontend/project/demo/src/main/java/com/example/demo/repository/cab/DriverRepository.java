package com.example.demo.repository.cab;

import com.example.demo.entity.cab.Driver;
import com.example.demo.entity.users.User;
import com.example.demo.enums.cab.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverRepository extends JpaRepository<Driver, UUID> {

    // Find driver by phone number
    Optional<Driver> findByUser_PhoneNumber(String phoneNumber);

    // Find drivers by status (AVAILABLE, BUSY, OFFLINE)
    List<Driver> findByStatus(DriverStatus status);

    // Find driver by email
    Optional<Driver> findByUser_Email(String email);

    // Find available drivers in bounding box
    @Query("SELECT d FROM Driver d WHERE d.currentLatitude BETWEEN :minLat AND :maxLat " +
            "AND d.currentLongitude BETWEEN :minLon AND :maxLon " +
            "AND d.status = :status")
    List<Driver> findAvailableDriversInArea(
            @Param("minLat") double minLat,
            @Param("maxLat") double maxLat,
            @Param("minLon") double minLon,
            @Param("maxLon") double maxLon,
            @Param("status") DriverStatus status
    );

    // FIXED: wrong query earlier (you had HotelOwner instead of Driver)
    @Query("SELECT d FROM Driver d WHERE d.user.id = :userId")
    Optional<Driver> findByUserId(@Param("userId") UUID userId);

    // Find by user entity
    Optional<Driver> findByUser(User user);

    // ❌ REMOVE INVALID METHOD
    // void updateStatus(UUID driverId, DriverStatus driverStatus);

    // Correct update query
    @Modifying
    @Transactional
    @Query("UPDATE Driver d SET d.status = :status WHERE d.driverId = :id")
    void updateStatus(@Param("id") UUID id, @Param("status") DriverStatus status);
}
