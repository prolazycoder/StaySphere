package com.example.demo.dto;// CoordinatesDto.java
import lombok.Data;

@Data // uses Lombok for Getters/Setters
public class CoordinatesDto {
    private String lat;
    private String lon;
    private String display_name;
}