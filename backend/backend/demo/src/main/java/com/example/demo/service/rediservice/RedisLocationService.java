package com.example.demo.service.rediservice;

import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.*;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RedisLocationService {

    private final RedisTemplate<String, String> redis;

    private static final String DRIVER_STATUS = "driver:status:";
    private static final String DRIVER_GEO = "drivers:geo";
    private static final String DRIVER_LOC = "driver:location:";

    public void goOnline(UUID driverId, double lat, double lng) {
        redis.opsForValue().set(DRIVER_STATUS + driverId, "ONLINE");
        updateLocation(driverId, lat, lng);
    }

    public void goOffline(UUID driverId) {
        redis.opsForValue().set(DRIVER_STATUS + driverId, "OFFLINE");
        redis.opsForGeo().remove(DRIVER_GEO, driverId.toString());
    }

    public void updateLocation(UUID driverId, double lat, double lng) {
        redis.opsForGeo().add(
                DRIVER_GEO,
                new Point(lng, lat),
                driverId.toString());
        redis.opsForValue().set(DRIVER_LOC + driverId, lat + "," + lng);
    }

    public List<String> findNearbyDrivers(double lat, double lng, double radiusMeters) {

        GeoResults<RedisGeoCommands.GeoLocation<String>> results =
                redis.opsForGeo().radius(
                DRIVER_GEO,
                new Circle(
                        new Point(lng, lat),
                                new Distance(radiusMeters, RedisGeoCommands.DistanceUnit.METERS)
                        )
                );

        if (results == null) return Collections.emptyList();

        return results.getContent().stream()
                .map(r -> r.getContent().getName())
                .toList();
    }

}
