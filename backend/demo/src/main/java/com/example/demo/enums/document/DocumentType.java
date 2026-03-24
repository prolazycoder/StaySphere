package com.example.demo.enums.document;

public enum DocumentType {

    PAN_CARD,
    AADHAR_CARD,
    DRIVING_LICENSE,
    GST_CERTIFICATE,
    HOTEL_LICENSE ;

        public static DocumentType safe(String value) {
            return DocumentType.valueOf(
                    value.trim()
                            .toUpperCase()
                            .replace(" ", "")
            );
        }

    }

