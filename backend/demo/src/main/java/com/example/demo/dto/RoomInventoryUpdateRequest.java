package com.example.demo.dto;
import com.example.demo.enums.hotel.RoomType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RoomInventoryUpdateRequest {

    private String hotelId;
    private RoomType roomType;
    private LocalDate date;
    private Integer availableCount;
    private Double price;
}
