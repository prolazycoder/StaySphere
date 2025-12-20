package com.example.demo.repository.hotel;
import com.example.demo.entity.hotel.Hotels;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface HotelRepository extends MongoRepository<Hotels, String> {

    // find hotels by owner (Postgres ownerId)
    List<Hotels> findByOwnerId(String ownerId);

    // find hotels by city
    List<Hotels> findByCity(String city);
}
