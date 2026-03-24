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

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String provider;

    @Column(nullable = false, unique = true)
    private String token;

    private String last4;

    private String methodType;

    private String expiryMonth;

    private String expiryYear;
}
