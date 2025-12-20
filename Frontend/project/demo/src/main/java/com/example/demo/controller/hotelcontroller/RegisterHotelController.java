package com.example.demo.controller.hotelcontroller;

import com.example.demo.dto.HotelCreateRequest;
import com.example.demo.entity.hotel.Hotels;
import com.example.demo.service.hotelservice.HotelService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hotel-owner")
@RequiredArgsConstructor
@Tag(name = "Hotel Owner API", description = "APIs for managing hotel owners")
public class RegisterHotelController {

    private final HotelService hotelService;

    @PreAuthorize("hasAuthority('HOTEL_ADMIN')")
    @PostMapping("/register-hotel")
    public ResponseEntity<?> registerHotel(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody HotelCreateRequest hotelRequest
    ) {

        Hotels savedHotel = hotelService.registerHotel(authHeader, hotelRequest);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "message", "Hotel registered successfully",
                        "hotel", savedHotel
                )
        );
    }

    @GetMapping("/hotel-owner-id")
    public ResponseEntity<?> getHotelId(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            return hotelService.getHotelOwnerIds(authHeader);
        } catch (RuntimeException ex) {

            // Custom error message returned to frontend
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", ex.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

}
