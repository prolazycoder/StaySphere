package com.example.demo.service.hotelservice;

import com.example.demo.dto.RoomDTO;
import com.example.demo.dto.RoomInventoryUpdateRequest;
import com.example.demo.entity.hotel.HotelOwner;
import com.example.demo.entity.hotel.Hotels;
import com.example.demo.entity.hotel.Room;
import com.example.demo.entity.hotel.RoomInventory;
import com.example.demo.enums.hotel.RoomType;
import com.example.demo.repository.hotel.HotelOwnerRepository;
import com.example.demo.repository.hotel.HotelRepository;
import com.example.demo.repository.hotel.RoomInventoryRepository;
import com.example.demo.repository.hotel.RoomRepository;
import com.example.demo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class RoomService {

    private final JwtUtil jwtUtil;
    private final HotelOwnerRepository hotelOwnerRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final RoomInventoryRepository roomInventoryRepository;

    private UUID extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return UUID.fromString(jwtUtil.extractAllClaims(token).get("userID").toString());
    }


    public Room addRoomType(String authHeader, String hotelId, RoomDTO roomRequest) {

        UUID userId = extractUserId(authHeader);
        HotelOwner owner = hotelOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Hotel Owner not found"));

        Hotels hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        if (!hotel.getOwnerId().equals(owner.getId().toString())) {
            throw new RuntimeException("Unauthorized");
        }

        // ✅ Map DTO → Entity
        Room room = Room.builder()
                .hotelId(hotelId)
                .roomType(roomRequest.getRoomType())
                .basePrice(roomRequest.getBasePrice())
                .capacity(roomRequest.getCapacity())
                .totalRooms(roomRequest.getTotalRooms())
                .description(roomRequest.getDescription())
                .images(roomRequest.getImages())
                .build();

        Room savedRoom = roomRepository.save(room);

        // Initialize inventory
        initializeInventory(
                hotelId,
                roomRequest.getRoomType(),
                roomRequest.getTotalRooms(),
                roomRequest.getBasePrice(),
                30
        );

        return savedRoom;
    }

    public RoomInventory updateInventoryByType(
            String authHeader,
            RoomInventoryUpdateRequest request
    ) {
        UUID userId = extractUserId(authHeader);
        HotelOwner owner = hotelOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Hotel Owner not found"));

        Hotels hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        if (!hotel.getOwnerId().equals(owner.getId().toString())) {
            throw new RuntimeException("Unauthorized");
        }

        RoomInventory inventory = roomInventoryRepository
                .findByHotelIdAndRoomTypeAndDate(
                        request.getHotelId(),
                        request.getRoomType(),
                        request.getDate()
                )
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        if (request.getAvailableCount() != null) {
            inventory.setAvailableCount(request.getAvailableCount());
        }
        if (request.getPrice() != null) {
            inventory.setPrice(request.getPrice());
        }

        return roomInventoryRepository.save(inventory);
    }

    public void addSeasonalPrice(
            String authHeader,
            String hotelId,
            RoomType roomType,
            LocalDate startDate,
            LocalDate endDate,
            double price
    ) {
        UUID userId = extractUserId(authHeader);
        HotelOwner owner = hotelOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Hotel Owner not found"));

        Hotels hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        if (!hotel.getOwnerId().equals(owner.getId().toString())) {
            throw new RuntimeException("Unauthorized");
        }

        List<RoomInventory> inventories =
                roomInventoryRepository.findByHotelIdAndRoomTypeAndDateBetween(
                        hotelId, roomType, startDate, endDate
                );

        for (RoomInventory inv : inventories) {
            inv.setPrice(price);
        }

        roomInventoryRepository.saveAll(inventories);
    }


    private void initializeInventory(
            String hotelId,
            RoomType roomType,
            int totalRooms,
            double basePrice,
            int days
    ) {
        LocalDate today = LocalDate.now();
        for (int i = 0; i < days; i++) {
            LocalDate date = today.plusDays(i);

            if (!roomInventoryRepository.existsByHotelIdAndRoomTypeAndDate(
                    hotelId, roomType, date)) {

                roomInventoryRepository.save(RoomInventory.builder()
                        .hotelId(hotelId)
                        .roomType(roomType)
                        .date(date)
                        .availableCount(totalRooms)
                        .price(basePrice)
                        .build());
            }
        }
    }
}
