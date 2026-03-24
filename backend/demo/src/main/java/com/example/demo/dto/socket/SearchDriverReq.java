package com.example.demo.dto.socket;

import lombok.Data;
import java.util.UUID;

@Data
public class SearchDriverReq {
    //private UUID riderId;
    private double pickupLat;
    private double pickupLng;
    private String pickupLocation;
    private String dropLocation;
    private double dropLat;
    private double dropLng;
}
