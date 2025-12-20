package com.example.demo.entity.payment;

import com.example.demo.enums.payment.PaymentStatus;
import com.example.demo.enums.ReferenceType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID userId;

    private BigDecimal amount;
    private String currency;

    private UUID referenceId;

    @Enumerated(EnumType.STRING)
    private ReferenceType referenceType;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    // Payment verification fields
    private String orderId;
    private String paymentId;
    private String signature;

    private Long createdAt;
}
