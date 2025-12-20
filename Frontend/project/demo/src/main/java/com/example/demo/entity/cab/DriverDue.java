package com.example.demo.entity.cab;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "driver_dues")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DriverDue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID dueId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false, unique = true)
    private Driver driver;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amountDueToCompany = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalGrossEarnings = BigDecimal.ZERO;

    private LocalDateTime lastSettlementDate;

    private LocalDate weekStart;   // Monday
    private LocalDate weekEnd;     // Sunday

    private boolean blocked = false;   // If unpaid dues exceed limit
}
