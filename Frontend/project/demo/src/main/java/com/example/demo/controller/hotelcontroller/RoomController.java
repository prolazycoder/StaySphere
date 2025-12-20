package com.example.demo.controller.hotelcontroller;

import com.example.demo.dto.RoomDTO;
import com.example.demo.dto.RoomInventoryUpdateRequest;
import com.example.demo.entity.hotel.Room;
import com.example.demo.entity.hotel.RoomInventory;
import com.example.demo.enums.hotel.RoomType;
import com.example.demo.service.hotelservice.RoomService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;


@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@Tag(name = "Room API", description = "Manage hotel rooms and inventory")
public class RoomController {

    private final RoomService roomService;

    // ✅ Add Room Type to Hotel (Mongo + Inventory init)
    @PostMapping("/hotel/{hotelId}")
    public ResponseEntity<?> addRoomType(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String hotelId,
            @RequestBody RoomDTO roomRequest
    ) {
        Room savedRoom = roomService.addRoomType(authHeader, hotelId, roomRequest);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "message", "Room type added and inventory initialized",
                        "roomType", savedRoom.getRoomType(),
                        "hotelId", hotelId
                )
        );
    }


    // ✅ Update Inventory (NO roomId anymore)
    @PutMapping("/inventory")
    public ResponseEntity<?> updateInventory(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody RoomInventoryUpdateRequest request
    ) {
        RoomInventory updated = roomService.updateInventoryByType(authHeader, request);

        return ResponseEntity.ok(Map.of(
                "message", "Inventory updated successfully",
                "inventory", updated
        ));
    }

    // ✅ Seasonal pricing by RoomType
    @PostMapping("/inventory/seasonal")
    public ResponseEntity<?> addSeasonalPrice(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String hotelId,
            @RequestParam RoomType roomType,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam double price
    ) {
        roomService.addSeasonalPrice(authHeader, hotelId, roomType, startDate, endDate, price);

        return ResponseEntity.ok(Map.of(
                "message", "Seasonal price applied successfully"
        ));
    }
}
