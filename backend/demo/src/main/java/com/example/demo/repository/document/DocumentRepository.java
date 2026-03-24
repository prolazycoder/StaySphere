package com.example.demo.repository.document;

import com.example.demo.entity.document.Document;
import com.example.demo.entity.cab.Driver;
import com.example.demo.entity.hotel.HotelOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {

    List<Document> findByDriver(Driver driver);

    List<Document> findByHotelOwner(HotelOwner hotelOwner);

}
