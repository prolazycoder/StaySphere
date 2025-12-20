package com.example.demo.controller.hotelcontroller;

import com.example.demo.entity.hotel.Hotels;
import com.example.demo.service.hotelservice.HotelService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hotels")
@RequiredArgsConstructor
@Tag(name = "Hotel Search API", description = "Search hotels by location and filters")
public class SearchHotelController {
    private final HotelService hotelService;

    @GetMapping("/search")
    public ResponseEntity<?> searchHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) Integer minStars,
            @RequestParam(required = false) Integer maxStars,
            @RequestParam(required = false) List<String> amenities,
            @RequestParam(defaultValue = "0") int page,       // page number, 0-based
            @RequestParam(defaultValue = "10") int size       // page size
    ) {

        List<Hotels> hotels = hotelService.searchHotels(city, state, country, minStars, maxStars, amenities, page, size);

        return ResponseEntity.ok(Map.of(
                "page", page,
                "size", size,
                "count", hotels.size(),
                "hotels", hotels
        ));
    }


}
