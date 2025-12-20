package com.example.demo.entity.hotel;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "hotels")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Hotels {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String state;
    private String country;
    private double latitude;
    private double longitude;
    private int stars;
    private String phone;
    private String email;
    private List<String> amenities;
    private List<String> images;
    private List<String> videos;
    @Field("ownerId")
    private String ownerId;

}
