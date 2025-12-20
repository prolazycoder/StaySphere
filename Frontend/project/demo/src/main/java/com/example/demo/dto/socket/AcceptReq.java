package com.example.demo.dto.socket;

import lombok.Data;
import java.util.UUID;

@Data
public class AcceptReq {
    private UUID driverId;
    private UUID rideId;
}
