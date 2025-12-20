package com.example.demo.entity.hotel;

import com.example.demo.entity.users.User;
import com.example.demo.entity.document.Document;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "hotel_owners")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HotelOwner {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID hotelOwnerId;

    // One User ⇌ One HotelOwner profile extension
    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    @JsonIgnore
    private User user;

    // ✔ Verification info belongs here
    private boolean panVerified;
    private boolean gstVerified;
    private boolean hotellicenceVerified;
    private boolean aadharVerified;

    // ✔ Owner documents (PAN, Aadhar, GST, license)
    @OneToMany(mappedBy = "hotelOwner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Document> documents;

    public UUID getId() {
        return this.hotelOwnerId;
    }

}
