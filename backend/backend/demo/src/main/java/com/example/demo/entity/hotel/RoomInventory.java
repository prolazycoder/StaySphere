package com.example.demo.entity.hotel;

import com.example.demo.enums.hotel.RoomType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "room_inventory")
@Data
@Builder @AllArgsConstructor @NoArgsConstructor
public class RoomInventory  {

    @Id
    @GeneratedValue(generator = "uuid2")
    private Long id;
    private LocalDate date;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType roomType;
    private int availableCount;
    private double price;


    @Column(name = "hotel_id", nullable = false)
    private String hotelId;
}
