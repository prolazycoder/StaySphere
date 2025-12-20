package com.example.demo.repository.document;

import com.example.demo.entity.document.Document;
import com.example.demo.entity.cab.Driver;
import com.example.demo.entity.hotel.HotelOwner;
import com.example.demo.enums.document.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {

    // find all documents of a cab owner
    List<Document> findByDriver(Driver driver);

    // find all documents of a hotel owner
    List<Document> findByHotelOwner(HotelOwner hotelOwner);

    // find by document type for a hotel owner
    List<Document> findByHotelOwnerAndDocumentType(HotelOwner hotelOwner, DocumentType documentType);

    // find by document type for a cab owner
    List<Document> findByDriverAndDocumentType(Driver driver, DocumentType documentType);

}
