package com.example.demo.repository.hotel;

import com.example.demo.entity.hotel.Booking;
import com.example.demo.enums.hotel.BookingStatus;
import com.example.demo.enums.payment.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


public interface BookingRepository extends JpaRepository<Booking, UUID> { Booking save(Booking booking);
    List<Booking> findByBookingStatusAndPaymentStatusAndCreatedAtBefore(
            BookingStatus bookingStatus,
            PaymentStatus paymentStatus,
            LocalDateTime time
    );
}
