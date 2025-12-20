package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class OSRMResponseDto {
    private String code;
    private List<Route> routes;

    @Data
    public static class Route {
        private Double distance; // in meters
        private Double duration; // in seconds
        private String geometry; // The encrypted string to draw the blue line on map
    }
}