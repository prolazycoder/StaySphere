package com.example.demo.repository.hotel;

import com.example.demo.entity.hotel.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

    public interface RoomRepository extends MongoRepository<Room, String> {
    }

