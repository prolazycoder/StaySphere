package com.example.demo.service.payment;

import com.example.demo.repository.hotel.BookingRepository;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.dto.PaymentCreateRequestDto;
import com.example.demo.dto.PaymentVerifyRequestDto;
import com.example.demo.entity.hotel.Booking;
import com.example.demo.entity.payment.Transaction;
import com.example.demo.enums.hotel.BookingStatus;
import com.example.demo.enums.payment.PaymentStatus;
import com.example.demo.enums.ReferenceType;
import com.example.demo.repository.payment.TransactionRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final TransactionRepository repository;
    private final BookingRepository bookingRepository ;

    @Value("${razorpay.key}")
    private String razorpayKey;

    @Value("${razorpay.secret}")
    private String razorpaySecret;

    /**
     * STEP 1: CREATE REAL RAZORPAY ORDER
     */
    public Transaction createPayment(PaymentCreateRequestDto request) throws Exception {

        RazorpayClient client =
                new RazorpayClient(razorpayKey, razorpaySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", request.amount().multiply(
                BigDecimal.valueOf(100)).intValue()); // paise
        orderRequest.put("currency", request.currency());
        orderRequest.put("payment_capture", 1);

        Order order = client.orders.create(orderRequest);

        Transaction tx = Transaction.builder()
                .userId(request.userId())
                .amount(request.amount())
                .currency(request.currency())
                .referenceId(request.referenceId())
                .referenceType(request.referenceType())
                .orderId(order.get("id"))   // ✅ REAL ORDER ID
                .status(PaymentStatus.PENDING)
                .createdAt(System.currentTimeMillis())
                .build();

        return repository.save(tx);
    }

    /**
     * STEP 2: VERIFY PAYMENT (REAL MONEY CONFIRMATION)
     */
    @Transactional
    public boolean verifyPayment(PaymentVerifyRequestDto request) {

        Transaction tx = repository.findByOrderId(request.orderId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        String data = request.orderId() + "|" + request.paymentId();
        String generatedSignature = hmacSha256(data, razorpaySecret);

        boolean success = generatedSignature.equals(request.signature());

        tx.setPaymentId(request.paymentId());
        tx.setSignature(request.signature());
        tx.setStatus(success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        repository.save(tx);

        // ✅ Update Booking
        if (success && tx.getReferenceType() == ReferenceType.HOTEL_BOOKING) {

            Booking booking = bookingRepository
                    .findById(tx.getReferenceId())
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            booking.setPaymentStatus(PaymentStatus.SUCCESS);
            booking.setBookingStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);
        }

        return success;
    }

    /**
     * STEP 3: SIGNATURE VERIFICATION (SECURITY)
     */
    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey =
                    new SecretKeySpec(secret.getBytes(), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Signature verification failed");
        }
    }
}
