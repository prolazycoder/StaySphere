package com.example.demo.service.hotelservice;

import com.example.demo.dto.BookingRequest;
import com.example.demo.dto.PaymentCreateRequestDto;
import com.example.demo.entity.hotel.Booking;
import com.example.demo.entity.hotel.RoomInventory;
import com.example.demo.entity.payment.Transaction;
import com.example.demo.entity.users.User;
import com.example.demo.enums.hotel.BookingStatus;
import com.example.demo.enums.payment.PaymentStatus;
import com.example.demo.enums.ReferenceType;
import com.example.demo.exception.BadRequestException;
import com.example.demo.repository.hotel.BookingRepository;
import com.example.demo.repository.hotel.RoomInventoryRepository;
import com.example.demo.repository.user.UserRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;   // 👈 Added
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomInventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PaymentService paymentService;

    @Transactional
    public Map<String, Object> createBooking(String authHeader, BookingRequest request) throws Exception {

        log.info(" Starting booking creation");
        log.info(" Incoming BookingRequest: {}", request);

        String token = authHeader.replace("Bearer ", "");
        log.debug("Extracted JWT token: {}", token);

        UUID userId = UUID.fromString(
                jwtUtil.extractAllClaims(token).get("userID").toString()
        );

        log.info(" User ID extracted from JWT: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error(" User not found: {}", userId);
                    return new BadRequestException("User not found");
                });

        LocalDate today = LocalDate.now();
        log.debug(" Today: {}", today);

        if (request.getCheckIn().isBefore(today)) {
            log.error(" Invalid check-in date: {}", request.getCheckIn());
            throw new BadRequestException("Check-in date cannot be in the past");
        }

        if (!request.getCheckOut().isAfter(request.getCheckIn())) {
            log.error(" Invalid date range. CheckIn: {} CheckOut: {}",
                    request.getCheckIn(), request.getCheckOut());
            throw new BadRequestException("Invalid date range");
        }

        log.info(" Locking inventory for hotelId={} roomType={} from {} to {}",
                request.getHotelId(), request.getRoomType(),
                request.getCheckIn(), request.getCheckOut().minusDays(1));

        List<RoomInventory> inventories =
                inventoryRepository.lockInventory(
                        request.getHotelId(),
                        request.getRoomType(),
                        request.getCheckIn(),
                        request.getCheckOut().minusDays(1)
                );

        if (inventories.isEmpty()) {
            log.error(" No inventory initialized for hotelId={} roomType={}",
                    request.getHotelId(), request.getRoomType());
            throw new BadRequestException("Inventory not initialized");
        }

        log.info(" Inventory fetched: {} entries", inventories.size());

        for (RoomInventory inv : inventories) {
            log.debug("Inventory on {} = {}", inv.getDate(), inv.getAvailableCount());

            if (inv.getAvailableCount() < request.getRooms()) {
                log.error(" Not enough rooms on {}. Required={} Available={}",
                        inv.getDate(), request.getRooms(), inv.getAvailableCount());
                throw new RuntimeException(
                        "Not enough rooms on " + inv.getDate()
                );
            }
        }
        log.info("🛏 Deducting {} rooms for each night", request.getRooms());

        for (RoomInventory inv : inventories) {
            int before = inv.getAvailableCount();
            inv.setAvailableCount(before - request.getRooms());
            log.debug("Updated inventory {} -> {} for date {}",
                    before, inv.getAvailableCount(), inv.getDate());
        }
        inventoryRepository.saveAll(inventories);
        log.info(" Inventory updated successfully");

        long nights = request.getCheckIn().until(request.getCheckOut()).getDays();
        double pricePerNight = inventories.get(0).getPrice();
        double totalAmount = pricePerNight * nights * request.getRooms();

        log.info(" Pricing: nights={} pricePerNight={} rooms={} total={}",
                nights, pricePerNight, request.getRooms(), totalAmount);

        Booking booking = Booking.builder()
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .roomsBooked(request.getRooms())
                .pricePerNight(pricePerNight)
                .totalAmount(totalAmount)
                .hotelId(request.getHotelId())
                .roomType(request.getRoomType().name())
                .user(user)
                .paymentStatus(PaymentStatus.PENDING)
                .bookingStatus(BookingStatus.PENDING)
                .build();

        booking = bookingRepository.save(booking);
        log.info(" Booking created with ID={}", booking.getId());

        PaymentCreateRequestDto paymentRequest =
                new PaymentCreateRequestDto(
                        user.getId(),
                        BigDecimal.valueOf(totalAmount),
                        "INR",
                        booking.getId(),
                        ReferenceType.HOTEL_BOOKING
                );

        log.info(" Creating payment for booking {}", booking.getId());
        Transaction tx = paymentService.createPayment(paymentRequest);

        log.info("Payment order created: {}", tx.getOrderId());

        return Map.of(
                "bookingId", booking.getId(),
                "orderId", tx.getOrderId(),
                "amount", booking.getTotalAmount(),
                "currency", "INR"
        );
    }
}
