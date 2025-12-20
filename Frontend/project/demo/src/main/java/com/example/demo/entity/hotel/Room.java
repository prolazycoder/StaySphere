package com.example.demo.entity.hotel;

import com.example.demo.enums.hotel.RoomType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "rooms")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Room {

    @Id
    private String id;


    private RoomType roomType;
    private double basePrice;
    private int capacity;
    private int totalRooms;
    private String description;
    private List<String> images;

    @Field("hotelId")
    private String hotelId;

}
