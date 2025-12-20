package com.example.demo.entity.document;

import com.example.demo.entity.cab.Driver;
import com.example.demo.entity.hotel.HotelOwner;
import com.example.demo.enums.document.DocumentType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "documents")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID documentId;

    // for cab owner
    @ManyToOne
    @JoinColumn(name = "cab_owner_id")
    private Driver driver;

    // for hotel owner
    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "hotel_owner_id")
    private HotelOwner hotelOwner;

    private DocumentType documentType;  // PAN, AADHAR, GST, LICENSE, etc.


    @Column(columnDefinition = "BYTEA")
    private byte[] fileData;

    private boolean verified;
}
