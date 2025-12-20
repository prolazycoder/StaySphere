package com.example.demo.enums.document;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

public enum DocumentType {

    PAN_CARD,
    AADHAR_CARD,
    DRIVING_LICENSE,
    GST_CERTIFICATE,
    HOTEL_LICENSE ;

        public static DocumentType safe(String value) {
            return DocumentType.valueOf(
                    value.trim()           // remove leading/trailing spaces
                            .toUpperCase()    // convert lowercase to uppercase
                            .replace(" ", "") // remove spaces inside
            );
        }

    }

