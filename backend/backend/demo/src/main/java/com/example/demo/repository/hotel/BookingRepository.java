
package com.example.demo.repository.hotel;

import com.example.demo.entity.hotel.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    Booking save(Booking booking);

    java.util.List<Booking> findByUserId(UUID userId);
}
