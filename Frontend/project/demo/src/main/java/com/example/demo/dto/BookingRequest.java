package com.example.demo.dto;

import com.example.demo.enums.hotel.RoomType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {

    private String hotelId;
    private RoomType roomType;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private int rooms;
}
