package com.example.demo.dto;

import com.example.demo.enums.hotel.BookingStatus;
import com.example.demo.enums.payment.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDto {
    private UUID id;
    private String hotelId;
    private String hotelName;
    private String hotelLocation; // city, country
    private String hotelImage;
    private String roomType;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private int roomsBooked;
    private double totalAmount;
    private BookingStatus bookingStatus;
    private PaymentStatus paymentStatus;
}
