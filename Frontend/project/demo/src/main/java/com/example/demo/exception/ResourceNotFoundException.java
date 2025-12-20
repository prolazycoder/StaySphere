package com.example.demo.exception;

// Extend RuntimeException to make it an unchecked exception
public class ResourceNotFoundException extends RuntimeException {

    // Constructor that accepts a message (e.g., "Ride not found")
    public ResourceNotFoundException(String message) {
        super(message);
    }
}