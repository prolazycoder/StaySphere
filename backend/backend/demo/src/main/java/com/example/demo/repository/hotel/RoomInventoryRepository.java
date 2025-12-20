package com.example.demo.repository.hotel;

import com.example.demo.entity.hotel.RoomInventory;
import com.example.demo.enums.hotel.RoomType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoomInventoryRepository extends JpaRepository<RoomInventory, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT ri FROM RoomInventory ri
        WHERE ri.hotelId = :hotelId
        AND ri.roomType = :roomType
        AND ri.date BETWEEN :checkIn AND :checkOut
    """)
    List<RoomInventory> lockInventory(
            String hotelId,
            RoomType roomType,
            LocalDate checkIn,
            LocalDate checkOut
    );
    Optional<RoomInventory> findByHotelIdAndRoomTypeAndDate(String hotelId, RoomType roomType, LocalDate date);

    boolean existsByHotelIdAndRoomTypeAndDate(String hotelId, RoomType roomType, LocalDate date);

    List<RoomInventory> findByHotelIdAndRoomTypeAndDateBetween(String hotelId, RoomType roomType, LocalDate start, LocalDate end);
}
