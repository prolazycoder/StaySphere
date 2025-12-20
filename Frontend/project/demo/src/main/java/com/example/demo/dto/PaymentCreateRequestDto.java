package com.example.demo.dto;

import com.example.demo.enums.ReferenceType;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentCreateRequestDto(
        UUID userId,
        BigDecimal amount,
        String currency,
        UUID referenceId,
        ReferenceType referenceType
) {}
