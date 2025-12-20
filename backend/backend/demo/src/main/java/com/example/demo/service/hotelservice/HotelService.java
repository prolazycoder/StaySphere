package com.example.demo.service.hotelservice;

import com.example.demo.dto.HotelCreateRequest;
import com.example.demo.entity.hotel.HotelOwner;
import com.example.demo.entity.hotel.Hotels;
import com.example.demo.entity.users.User;
import com.example.demo.entity.users.UserLogin;
import com.example.demo.enums.users.UserRole;
import com.example.demo.repository.hotel.HotelOwnerRepository;
import com.example.demo.repository.hotel.HotelRepository;
import com.example.demo.repository.user.UserLoginRepository;
import com.example.demo.repository.user.UserRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.rediservice.RedisService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final JwtUtil jwtUtil;
    private final HotelOwnerRepository hotelOwnerRepository;
    private final HotelRepository hotelRepository;
    private final MongoTemplate mongoTemplate;
    private final UserLoginRepository userLoginRepository;
    private final UserRepository userRepository;
    private final RedisService redisService ;


    private UUID extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");

        Claims claims = jwtUtil.extractAllClaims(token);
        return UUID.fromString(claims.get("userID").toString());
    }


    public Hotels registerHotel(String authHeader, HotelCreateRequest hotelRequest) {

        UUID ownerId = UUID.fromString(hotelRequest.getHotelOwnerId());

        HotelOwner owner = hotelOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Hotel Owner not found"));


        boolean allVerified =
                owner.isPanVerified() &&
                        owner.isAadharVerified() &&
                        owner.isGstVerified() &&
                        owner.isHotellicenceVerified();

        if (!allVerified) {
            throw new RuntimeException("Hotel registration denied. Documents not verified.");
        }


        Hotels hotel = Hotels.builder()
                .name(hotelRequest.getName())
                .description(hotelRequest.getDescription())
                .address(hotelRequest.getAddress())
                .city(hotelRequest.getCity())
                .state(hotelRequest.getState())
                .country(hotelRequest.getCountry())
                .latitude(hotelRequest.getLatitude())
                .longitude(hotelRequest.getLongitude())
                .stars(hotelRequest.getStars())
                .phone(hotelRequest.getPhone())
                .email(hotelRequest.getEmail())
                .amenities(hotelRequest.getAmenities())
                .ownerId(owner.getHotelOwnerId().toString())   // set by backend, NOT from DTO
                .images(List.of())                              // empty list initially
                .videos(List.of())                              // empty list initially
                .build();

        return hotelRepository.save(hotel);
    }

    public List<Hotels> searchHotels(
            String city,
            String state,
            String country,
            Integer minStars,
            Integer maxStars,
            List<String> amenities,
            int page,
            int size
    ) {
        Query query = new Query();

        if (city != null && !city.isEmpty()) {
            query.addCriteria(Criteria.where("city").is(city));
        }

        if (state != null && !state.isEmpty()) {
            query.addCriteria(Criteria.where("state").is(state));
        }

        if (country != null && !country.isEmpty()) {
            query.addCriteria(Criteria.where("country").is(country));
        }

        if (minStars != null || maxStars != null) {
            int min = minStars != null ? minStars : 0;
            int max = maxStars != null ? maxStars : 5;
            query.addCriteria(Criteria.where("stars").gte(min).lte(max));
        }

        if (amenities != null && !amenities.isEmpty()) {
            query.addCriteria(Criteria.where("amenities").all(amenities));
        }

        // Pagination
        query.skip((long) page * size).limit(size);

        return mongoTemplate.find(query, Hotels.class);
    }


    @Transactional
    public ResponseEntity<Map<String,Object>>  getHotelOwnerIds(String authHeader) {
        UUID userId = extractUserId(authHeader);
        HotelOwner owner = hotelOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Hotel Owner not found"));

        String token = authHeader.replace("Bearer ", "");

        UserLogin userLogin = userLoginRepository.findByJwtToken(token).
                orElseThrow(() -> new RuntimeException("Jwt token  not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(UserRole.HOTEL_ADMIN);
        userRepository.save(user);

        if ((user.getEmail() == null || user.getEmail().isEmpty()) ||
                (user.getPhoneNumber() == null || user.getPhoneNumber().isEmpty())) {

            throw new RuntimeException("Please update your profile and add your email and phone number first.");
        }

        String jwtToken = jwtUtil.generateToken(
                user.getId().toString(),
                user.getAuthProvider(),
                user.getFullName(),
                user.getCountry(),
                user.getCity(),
                user.getGender(),
                UserRole.HOTEL_ADMIN,
                user.getId()
        );
        redisService.delete(token); // delete old token
        redisService.save(jwtToken, String.valueOf(user.getId()), jwtUtil.getTokenValidity()); // register new token

        String refreshToken =jwtUtil.generateRefreshToken(user.getEmail(),user.getId(),UserRole.HOTEL_ADMIN);
        userLogin.setJwtToken(jwtToken);
        userLogin.setRefreshToken(refreshToken);
        userLoginRepository.save(userLogin);
        Map<String, Object> response = new HashMap<>();
        response.put("hotelOwnerId", owner.getHotelOwnerId());
        response.put("jwtToken", jwtToken);
        response.put("refreshToken", refreshToken);

        response.put("message",
                "Your hotel owner key has been generated. Keep this ID safe, you will need it to access your hotel dashboard."
        );

        return ResponseEntity.ok(response);

    }

}
