package com.example.demo.repository.hotel;

import com.example.demo.entity.hotel.HotelOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.Optional;
import java.util.UUID;

public interface HotelOwnerRepository extends JpaRepository<HotelOwner, UUID> {

    @Query("SELECT h FROM HotelOwner h WHERE h.user.id = :userId")
    Optional<HotelOwner> findByUserId(@Param("userId") UUID userId);


}
