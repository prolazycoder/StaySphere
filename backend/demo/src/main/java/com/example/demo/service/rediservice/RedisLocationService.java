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

    private static final String DRIVER_STATUS = "driver:status:";     // driver:status:<userId>
    private static final String DRIVER_GEO = "drivers:geo";           // geo set members = userId
    private static final String DRIVER_LOC = "driver:location:";      // driver:location:<userId>

    public void goOnline(UUID userId, double lat, double lng) {
        redis.opsForValue().set(DRIVER_STATUS + userId, "ONLINE");
        updateLocation(userId, lat, lng);
    }

    public void goOffline(UUID userId) {
        redis.opsForValue().set(DRIVER_STATUS + userId, "OFFLINE");
        redis.opsForGeo().remove(DRIVER_GEO, userId.toString());
        redis.delete(DRIVER_LOC + userId); // optional cleanup
    }

    public void updateLocation(UUID userId, double lat, double lng) {
        redis.opsForGeo().add(
                DRIVER_GEO,
                new Point(lng, lat),
                userId.toString()
        );

        redis.opsForValue().set(DRIVER_LOC + userId, lat + "," + lng);
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
                .map(r -> r.getContent().getName()) // returns userId string
                .toList();
    }
}
