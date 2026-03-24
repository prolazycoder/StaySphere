package com.example.demo.dto.socket;

import lombok.Data;
import java.util.UUID;

@Data
public class DriverOnlineReq {

    private double lat;
    private double lng;
}
