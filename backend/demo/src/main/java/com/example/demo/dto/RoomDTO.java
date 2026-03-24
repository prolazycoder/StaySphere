package com.example.demo.dto;



import com.example.demo.enums.hotel.RoomType;
import lombok.Data;
import java.util.List;

@Data
public class RoomDTO {

    private RoomType roomType;
    private double basePrice;
    private int capacity;
    private int totalRooms;
    private String description;
    private List<String> images;
}
