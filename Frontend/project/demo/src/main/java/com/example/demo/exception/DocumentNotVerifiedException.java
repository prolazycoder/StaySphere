package com.example.demo.exception;


public class DocumentNotVerifiedException extends RuntimeException {
    public DocumentNotVerifiedException(String message) {
        super(message);
    }
}
