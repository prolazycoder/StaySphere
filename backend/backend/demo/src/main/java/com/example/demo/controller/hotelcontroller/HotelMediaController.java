package com.example.demo.controller.hotelcontroller;

import com.example.demo.entity.hotel.Hotels;
import com.example.demo.service.hotelservice.HotelMediaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/hotel-media")
@RequiredArgsConstructor
@Tag(name = "Hotel Media Upload")
public class HotelMediaController {

    private final HotelMediaService hotelMediaService;

    @PostMapping(value = "/{hotelId}", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadMedia(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String hotelId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type // image | video
    ) {
        Hotels updated = hotelMediaService
                .uploadHotelMedia(authHeader, hotelId, file, type);

        return ResponseEntity.ok(Map.of(
                "message", "Media uploaded successfully",
                "hotelId", updated.getId(),
                "totalImages", updated.getImages().size(),
                "totalVideos", updated.getVideos().size()
        ));
    }
}
