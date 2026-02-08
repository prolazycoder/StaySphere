package com.example.demo.config;

import com.example.demo.entity.cab.Driver;
import com.example.demo.enums.cab.DriverStatus;
import com.example.demo.repository.cab.DriverRepository;
import com.example.demo.service.rediservice.RedisLocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final DriverRepository driverRepository;
    private final RedisLocationService redisLocationService;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting Redis driver synchronization...");

        List<Driver> onlineDrivers = driverRepository.findByStatus(DriverStatus.ONLINE);

        int syncedCount = 0;
        for (Driver driver : onlineDrivers) {
            if (driver.getCurrentLatitude() != null && driver.getCurrentLongitude() != null) {
                redisLocationService.updateLocation(
                        driver.getDriverId(),
                        driver.getCurrentLatitude().doubleValue(),
                        driver.getCurrentLongitude().doubleValue());
                syncedCount++;
            }
        }

        log.info("Successfully synced {} drivers to Redis from DB", syncedCount);
    }
}
