package com.example.demo.controller.usercontroller;

import com.example.demo.dto.UserResponseDto;
import com.example.demo.dto.UserUpdateDTO;
import com.example.demo.enums.users.Gender;
import com.example.demo.enums.users.UserRole;
import com.example.demo.service.userservice.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@AllArgsConstructor
public class UserController {
    UserService userService;

    @PreAuthorize("hasAuthority('SYS_ADMIN')")
    @GetMapping("/admin/get/user")
    public ResponseEntity<Map<String, Object>> getUser(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Gender gender,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<UserResponseDto> users = userService.getUsers(username, role, gender, city, page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", users.getContent());
        response.put("currentPage", users.getNumber());
        response.put("totalPages", users.getTotalPages());
        response.put("totalItems", users.getTotalElements());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/user/update")
    public ResponseEntity<Map<String, Object>> updateUser(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UserUpdateDTO dto) {

        String jwt = authHeader.replace("Bearer ", "");

        Map<String, Object> result = userService.updateUserInfo(jwt, dto);

        if (!(boolean) result.get("status")) {
            return ResponseEntity.status(400).body(result);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/user/logout")
    public ResponseEntity<Map<String, Object>> logout(
            @RequestHeader("Authorization") String authHeader) {

        Map<String, Object> response = new HashMap<>();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("success", false);
            response.put("message", "Authorization header missing or invalid");
            response.put("status", 401);
            return ResponseEntity.status(401).body(response);
        }

        String token = authHeader.substring(7);

        Map<String, Object> logoutResponse = userService.logout(token);

        return ResponseEntity.ok(logoutResponse);
    }

    @PreAuthorize("hasAuthority('SYS_ADMIN')")
    @DeleteMapping("/admin/delete/user/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable UUID id) {
        Map<String, Object> response = new HashMap<>();
        userService.deleteUser(id);
        response.put("success", true);
        response.put("message", "User deleted successfully");
        return ResponseEntity.status(204).body(response);
    }

    @GetMapping("/user/get/current-user")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();
        try {
            String token = authHeader.replace("Bearer ", "");
            UserResponseDto userDto = userService.getCurrentUser(token);
            response.put("success", true);
            response.put("data", userDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(401).body(response);
        }
    }

}
