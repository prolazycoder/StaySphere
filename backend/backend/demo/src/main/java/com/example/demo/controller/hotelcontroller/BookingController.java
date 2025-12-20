package com.example.demo.controller.hotelcontroller;

import com.example.demo.dto.BookingRequest;
import com.example.demo.entity.hotel.Booking;
import com.example.demo.service.hotelservice.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/book")
    public ResponseEntity<?> bookHotel(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody BookingRequest request
    ) throws Exception {

        Booking booking = bookingService.createBooking(authHeader, request);

        return ResponseEntity.ok(
                Map.of(
                        "message", "Booking created successfully",
                        "bookingId", booking.getId(),
                        "status", booking.getBookingStatus(),
                        "amount", booking.getTotalAmount()
                )
        );
    }
}

