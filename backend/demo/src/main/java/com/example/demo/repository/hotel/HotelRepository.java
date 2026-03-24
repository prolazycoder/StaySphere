package com.example.demo.repository.hotel;
import com.example.demo.entity.hotel.Hotels;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface HotelRepository extends MongoRepository<Hotels, String> {

}
