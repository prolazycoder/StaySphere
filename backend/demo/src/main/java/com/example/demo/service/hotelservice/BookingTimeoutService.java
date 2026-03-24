package com.example.demo.service.hotelservice;

import com.example.demo.entity.hotel.Booking;
import com.example.demo.entity.hotel.RoomInventory;
import com.example.demo.enums.hotel.BookingStatus;
import com.example.demo.enums.payment.PaymentStatus;
import com.example.demo.repository.hotel.BookingRepository;
import com.example.demo.repository.hotel.RoomInventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingTimeoutService {

    private final BookingRepository bookingRepository;
    private final RoomInventoryRepository inventoryRepository;

    @Scheduled(fixedRate = 6000000) // every 1 minute
    @Transactional
    public void cancelExpiredBookings() {

        LocalDateTime expiryTime = LocalDateTime.now().minusMinutes(5);

        List<Booking> expiredBookings =
                bookingRepository.findByBookingStatusAndPaymentStatusAndCreatedAtBefore(
                        BookingStatus.PENDING,
                        PaymentStatus.PENDING,
                        expiryTime
                );

        for (Booking booking : expiredBookings) {

            log.info("Cancelling expired booking {}", booking.getId());

            restoreInventory(booking);

            booking.setBookingStatus(BookingStatus.CANCELLED);
            booking.setPaymentStatus(PaymentStatus.FAILED);

            bookingRepository.save(booking);
        }
    }

    private void restoreInventory(Booking booking) {

        List<RoomInventory> inventories =
                inventoryRepository.lockInventory(
                        booking.getHotelId(),
                        com.example.demo.enums.hotel.RoomType.valueOf(booking.getRoomType()),
                        booking.getCheckIn(),
                        booking.getCheckOut().minusDays(1)
                );

        for (RoomInventory inv : inventories) {
            inv.setAvailableCount(inv.getAvailableCount() + booking.getRoomsBooked());
        }

        inventoryRepository.saveAll(inventories);
    }
}