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
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverRepository extends JpaRepository<Driver, UUID> {
    @Query("SELECT d FROM Driver d WHERE d.user.id = :userId")
    Optional<Driver> findByUserId(@Param("userId") UUID userId);

    Optional<Driver> findByUser(User user);

    @Modifying
    @Transactional
    @Query("UPDATE Driver d SET d.status = :status WHERE d.driverId = :id")
    void updateStatus(@Param("id") UUID id, @Param("status") DriverStatus status);
}
