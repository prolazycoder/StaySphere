package com.example.demo.entity.payment;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "payment_methods")
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Relation to User entity (better than raw UUID)
    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String provider;
    // Examples: "RAZORPAY", "PAYTM", "STRIPE", "PAYPAL"

    // Token from payment gateway (NEVER store raw card details)
    @Column(nullable = false, unique = true)
    private String token;

    // Optional: last 4 digits to show in app
    private String last4;

    // Optional: type like "CARD", "UPI", "WALLET"
    private String methodType;

    // Optional: expiry if card
    private String expiryMonth;
    private String expiryYear;
}
