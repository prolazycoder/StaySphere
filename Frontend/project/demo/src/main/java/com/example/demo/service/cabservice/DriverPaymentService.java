package com.example.demo.service.cabservice;

import com.example.demo.entity.cab.DriverDue;
import com.example.demo.entity.cab.Ride;
import com.example.demo.repository.cab.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class DriverPaymentService {

    private final DriverDueRepository driverDueRepository;

    // Commission rate is fixed at 20%
    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.20");

    /**
     * Processes the financial impact of a completed ride on the driver's dues.
     */
    @Transactional
    public void processRideCompletion(Ride ride) {

        if (ride.getFinalFare() == null) {
            log.warn("Ride {} completed without a final fare. Dues update skipped.", ride.getId());
            return;
        }

        BigDecimal finalFare = ride.getFinalFare();

        // 1. Calculate the Company's Commission (20%)
        BigDecimal companyCommission = finalFare.multiply(COMMISSION_RATE)
                .setScale(2, RoundingMode.HALF_UP);

        DriverDue driverDue = driverDueRepository.findByDriver_DriverId(ride.getDriverId())
                .orElseGet(() -> {
                    // NOTE: A proper repository method call is assumed here to fetch/create the DriverDue
                    return DriverDue.builder()
                            .amountDueToCompany(BigDecimal.ZERO)
                            .totalGrossEarnings(BigDecimal.ZERO)
                            // Driver link must be handled by the calling service
                            .build();
                });

        // 2. Update Gross Earnings
        driverDue.setTotalGrossEarnings(driverDue.getTotalGrossEarnings().add(finalFare));

        // 3. Update Amount Due to Company (tracking the 20% debt)
        driverDue.setAmountDueToCompany(driverDue.getAmountDueToCompany().add(companyCommission));

        log.info("Ride {} completed. Driver owes company commission: {}", ride.getId(), companyCommission);

        driverDueRepository.save(driverDue);
    }
}