package com.example.demo.controller.payment;

import com.example.demo.dto.PaymentCreateRequestDto;
import com.example.demo.dto.PaymentVerifyRequestDto;
import com.example.demo.entity.payment.Transaction;
import com.example.demo.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    public Transaction create(
            @RequestBody PaymentCreateRequestDto request) throws Exception {
        return paymentService.createPayment(request);
    }

    @PostMapping("/verify")
    public boolean verify(
            @RequestBody PaymentVerifyRequestDto request) {
        return paymentService.verifyPayment(request);
    }
}


