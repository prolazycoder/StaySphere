package com.example.demo.dto.socket;

import lombok.Data;

@Data
public class RideStatusUpdate {
    private String event;
    private Object data;
}
