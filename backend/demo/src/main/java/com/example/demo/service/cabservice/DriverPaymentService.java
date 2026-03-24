package com.example.demo.service.cabservice;
import com.example.demo.entity.cab.DriverDue;
import com.example.demo.entity.cab.Ride;
import com.example.demo.repository.cab.*;
import com.google.api.client.util.Value;
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

    @Value("${commission.rate}")
    private BigDecimal COMMISSION_RATE;

    @Transactional
    public void processRideCompletion(Ride ride) {

        if (ride.getFinalFare() == null) {
            log.warn("Ride {} completed without a final fare. Dues update skipped.", ride.getId());
            return;
        }
        BigDecimal finalFare = ride.getFinalFare();
        BigDecimal companyCommission = finalFare.multiply(COMMISSION_RATE)
                .setScale(2, RoundingMode.HALF_UP);

        DriverDue driverDue = driverDueRepository.findByDriver_DriverId(ride.getDriverId())
                .orElseGet(() -> {
                    return DriverDue.builder()
                            .amountDueToCompany(BigDecimal.ZERO)
                            .totalGrossEarnings(BigDecimal.ZERO)
                            .build();
                });
        driverDue.setTotalGrossEarnings(driverDue.getTotalGrossEarnings().add(finalFare));
        driverDue.setAmountDueToCompany(driverDue.getAmountDueToCompany().add(companyCommission));
        log.info("Ride {} completed. Driver owes company commission: {}", ride.getId(), companyCommission);
        driverDueRepository.save(driverDue);
    }
}