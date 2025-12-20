package com.example.demo.service.cabservice;

import org.springframework.stereotype.Service;

@Service
public class FareService {

    private static final double EARTH_RADIUS = 6371.0; // KM

    // === FARE CONFIG ===
    private static final double BASE_FARE = 50.0;        // ₹50 base
    private static final double PER_KM_RATE = 12.0;      // ₹12 per KM
    private static final double PER_MIN_RATE = 1.5;      // ₹1.5 per minute (optional)
    private static final double SURGE_MULTIPLIER = 1.0;  // set to 1.5 if surge is on

    // ======================================================
    // 1. CALCULATE DISTANCE using Haversine Formula (KM)
    // ======================================================
    public double calculateDistanceKm(double lat1, double lng1, double lat2, double lng2) {

        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);

        lat1 = Math.toRadians(lat1);
        lat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1) * Math.cos(lat2)
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c; // distance in KM
    }

    // ======================================================
    // 2. ESTIMATE FARE (BEFORE RIDE START)
    // ======================================================
    public double estimateFare(double pickupLat, double pickupLng,
                               double dropLat, double dropLng) {

        double distanceKm = calculateDistanceKm(pickupLat, pickupLng, dropLat, dropLng);

        double fare = BASE_FARE + (distanceKm * PER_KM_RATE);

        fare *= SURGE_MULTIPLIER;

        return Math.round(fare);
    }

    // ======================================================
    // 3. FINAL FARE after ride complete (distance + time)
    // ======================================================
    public double calculateFinalFare(double actualKm, double actualMinutes) {

        double fare = BASE_FARE
                + (actualKm * PER_KM_RATE)
                + (actualMinutes * PER_MIN_RATE);

        fare *= SURGE_MULTIPLIER;

        return Math.round(fare);
    }
}
