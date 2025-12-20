package com.example.demo.dto.socket;

import lombok.Data;
import java.util.UUID;

@Data
public class GpsReq {
    private double lat;
    private double lng;
}
