package com.example.demo.repository.cab;

import com.example.demo.entity.cab.Driver;
import com.example.demo.entity.cab.DriverDue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverDueRepository extends JpaRepository<DriverDue, UUID> {

    // Correct: manually written JPQL
    @Query("SELECT d FROM DriverDue d WHERE d.driver.driverId = :driverId")
    Optional<DriverDue> findByDriver_DriverId(@Param("driverId") UUID driverId);

    // Also correct: Spring Data will derive automatically using the Driver entity
    Optional<DriverDue> findByDriver(Driver driver);

    // ❌ REMOVE THIS – It breaks Spring Boot startup
    // Optional<DriverDue> findByDriverId(UUID driverId);
}
