package com.example.demo.dto;

import com.example.demo.enums.cab.CabType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class VehicleRequestDTO {

    // --- Vehicle Details (For creating the Vehicle entity) ---
    private String vehicleModel;
    private String vehicleNumber;
    private Integer seatingCapacity;
    private CabType vehicleType;
}
