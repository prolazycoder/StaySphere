package com.example.demo.service.cabservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class FareService {

    @Value("${earth.radius}")
    private double EARTH_RADIUS;

    @Value("${fare.base}")
    private double BASE_FARE;

    @Value("${fare.per.km.rate}")
    private double PER_KM_RATE;

    @Value("${fare.per.min.rate}")
    private double PER_MIN_RATE;

    @Value("${fare.surge.multiplier}")
    private double SURGE_MULTIPLIER;

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



    public double estimateFare(double pickupLat, double pickupLng,
                               double dropLat, double dropLng) {
        double distanceKm = calculateDistanceKm(pickupLat, pickupLng, dropLat, dropLng);
        double fare = BASE_FARE + (distanceKm * PER_KM_RATE);
        fare *= SURGE_MULTIPLIER;
        return Math.round(fare);
    }


    public double calculateFinalFare(double actualKm, double actualMinutes) {
        double fare = BASE_FARE
                + (actualKm * PER_KM_RATE)
                + (actualMinutes * PER_MIN_RATE);
        fare *= SURGE_MULTIPLIER;
        return Math.round(fare);
    }
}
