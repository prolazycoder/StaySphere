package com.example.demo.dto;

import com.example.demo.entity.cab.Ride;
import com.example.demo.enums.cab.RideStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class RideResponseDTO {
    private UUID rideId;
    private RideStatus status;
    private String driverName;
    private String driverPhone; // Used to call the driver
    private String vehicleModel;
    private String vehicleNumber;
    private BigDecimal fareEstimate;
    private UUID assignedDriverId;
    private BigDecimal driverCurrentLat;
    private BigDecimal driverCurrentLon;

    public RideResponseDTO() {

    }
    public  RideResponseDTO(Ride ride) {
        this.rideId = ride.getId();
        this.status = ride.getStatus();
        this.driverName=ride.getDriver().getUser().getFullName();
        this.driverPhone=ride.getDriver().getUser().getPhoneNumber();
        this.vehicleModel=ride.getDriver().getVehicle().getVehicleModel();
        this.vehicleNumber=ride.getDriver().getVehicle().getVehicleNumber();
        this.fareEstimate=ride.getFareEstimate();
        this.assignedDriverId=ride.getDriverId();
        this.driverCurrentLat=ride.getDriver().getCurrentLatitude();
        this.driverCurrentLon=ride.getDriver().getCurrentLongitude();
    }

}