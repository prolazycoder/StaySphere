package com.example.demo.service.hotelservice;

import com.example.demo.entity.hotel.HotelOwner;
import com.example.demo.entity.hotel.Hotels;
import com.example.demo.repository.hotel.HotelOwnerRepository;
import com.example.demo.repository.hotel.HotelRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.media.CloudinaryService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HotelMediaService {

    private final JwtUtil jwtUtil;
    private final HotelOwnerRepository hotelOwnerRepository;
    private final HotelRepository hotelRepository;
    private final CloudinaryService cloudinaryService;

    private UUID extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Claims claims = jwtUtil.extractAllClaims(token);
        return UUID.fromString(claims.get("userID").toString());
    }

    public Hotels uploadHotelMedia(
            String authHeader,
            String hotelId,
            MultipartFile file,
            String type
    ) {

        UUID userId = extractUserId(authHeader);

        HotelOwner owner = hotelOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Hotel owner not found"));

        Hotels hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        // 🔐 Owner check
        if (!hotel.getOwnerId().equals(owner.getId().toString())) {
            throw new RuntimeException("Unauthorized access");
        }

        // ✅ Cloudinary upload
        String folder = "hotels/" + hotelId + "/" + type;
        String url = cloudinaryService.uploadFile(file, folder);

        // ✅ Save URL in Mongo
        if ("image".equalsIgnoreCase(type)) {
            hotel.getImages().add(url);
        } else if ("video".equalsIgnoreCase(type)) {
            hotel.getVideos().add(url);
        } else {
            throw new RuntimeException("Invalid media type");
        }

        return hotelRepository.save(hotel);
    }
}
