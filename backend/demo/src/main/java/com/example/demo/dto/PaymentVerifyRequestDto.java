package com.example.demo.dto;

public record PaymentVerifyRequestDto(
        String orderId,
        String paymentId,
        String signature
) {}
