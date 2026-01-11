package com.example.demo.service.userservice;

import com.example.demo.dto.UserResponseDto;
import com.example.demo.dto.UserUpdateDTO;
import com.example.demo.entity.hotel.HotelOwner;
import com.example.demo.entity.users.User;
import com.example.demo.enums.users.Gender;
import com.example.demo.enums.users.UserRole;
import com.example.demo.repository.hotel.HotelOwnerRepository;
import com.example.demo.repository.user.UserLoginRepository;
import com.example.demo.repository.user.UserRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.rediservice.RedisService;
import io.jsonwebtoken.Claims;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.*;
import jakarta.persistence.criteria.Predicate;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final HotelOwnerRepository hotelOwnerRepository;
    private final RedisService redisService;
    private final UserLoginRepository userLoginRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    private UserResponseDto convertToDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());
        dto.setCountry(user.getCountry());
        dto.setCity(user.getCity());
        dto.setGender(user.getGender());
        return dto;
    }

    private UUID extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Claims claims = jwtUtil.extractAllClaims(token);
        return UUID.fromString(claims.get("userID").toString());
    }

    public void initializeHotelOwner(String authHeader) {

        UUID userId = extractUserId(authHeader);

        // If already exists → do nothing
        if (hotelOwnerRepository.findByUserId(userId).isPresent()) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        HotelOwner newOwner = HotelOwner.builder()
                .user(user)
                .panVerified(false)
                .gstVerified(false)
                .hotellicenceVerified(false)
                .aadharVerified(false)
                .build();

        hotelOwnerRepository.save(newOwner);
    }

    // 🔹 Logout (Invalidate Access Token)
    public Map<String, Object> logout(String jwtToken) {

        log.info("Logout request for token: {}", truncateToken(jwtToken));

        Map<String, Object> response = new HashMap<>();

        // 🔸 Check if token exists in Redis
        if (!redisService.exist(jwtToken)) {
            log.warn("Logout failed: Token invalid or already removed {}", truncateToken(jwtToken));
            response.put("status", false);
            response.put("message", "Invalid token / Already logged out");
            return response;
        }

        // 🔹 Remove token from Redis
        redisService.delete(jwtToken);

        // 🔹 Remove token from DB
        userLoginRepository.deleteByJwtToken(jwtToken);

        log.info("User logged out successfully (token: {})", truncateToken(jwtToken));

        response.put("status", true);
        response.put("message", "Logged out successfully");

        return response;
    }

    // Utility function — truncate token for logging
    private String truncateToken(String token) {
        if (token == null || token.length() < 15)
            return token;
        return token.substring(0, 12) + "...";
    }

    public Map<String, Object> updateUserInfo(String jwtToken, UserUpdateDTO dto) {

        log.info("Updating user info using token: {}", truncateToken(jwtToken));

        Map<String, Object> response = new HashMap<>();

        Object userIdObj = redisService.get(jwtToken);
        if (userIdObj == null) {
            log.warn("Token invalid or expired: {}", truncateToken(jwtToken));
            response.put("status", false);
            response.put("message", "Token expired / unauthorized");
            return response;
        }

        UUID userId = UUID.fromString(userIdObj.toString());
        log.info("Updating info for user {}", userId);
        User user = userRepository.findById(userId).orElseThrow();

        if (dto.getFullName() != null)
            user.setFullName(dto.getFullName());
        if (dto.getCountry() != null)
            user.setCountry(dto.getCountry());
        if (dto.getCity() != null)
            user.setCity(dto.getCity());
        if (dto.getDob() != null)
            user.setDob(dto.getDob());
        if (dto.getGender() != null)
            user.setGender(dto.getGender());
        if (dto.getPhoneNumber() != null)
            user.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {

            // check if this email already belongs to another user
            if (userRepository.existsByEmail(dto.getEmail())) {
                response.put("status", false);
                response.put("message", "Email already exists. Please use a different email.");
                return response;
            }

            // Email doesn't exist → safe to update
            user.setEmail(dto.getEmail());
        }

        userRepository.save(user);

        log.info("User info updated for user {}", userId);

        response.put("status", true);
        response.put("message", "User info updated");
        return response;
    }

    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setIsActive(false);
    }

    public Page<UserResponseDto> getUsers(
            String username, UserRole role, Gender gender, String city,
            int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        Specification<User> spec = (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (username != null && !username.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("fullName")),
                        "%" + username.toLowerCase() + "%"));
            }

            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            if (gender != null) {
                predicates.add(cb.equal(root.get("gender"), gender));
            }

            if (city != null && !city.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("city")),
                        "%" + city.toLowerCase() + "%"));
            }

            // Always only active users
            predicates.add(cb.isTrue(root.get("isActive")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> users = userRepository.findAll(spec, pageable);

        return users.map(this::convertToDto);
    }

    public UserResponseDto getCurrentUser(String jwtToken) {
        Object userIdObj = redisService.get(jwtToken);
        if (userIdObj == null) {
            throw new RuntimeException("Token is invalid or expired.");
        }
        UUID userId = UUID.fromString(userIdObj.toString());
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        return convertToDto(user);
    }
}
