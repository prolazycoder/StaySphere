package com.example.demo.repository.payment;

import com.example.demo.entity.payment.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository
        extends JpaRepository<Transaction, UUID> {

    Optional<Transaction> findByOrderId(String orderId);
}
