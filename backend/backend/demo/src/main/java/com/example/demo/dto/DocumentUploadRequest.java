package com.example.demo.dto;
import com.example.demo.enums.document.DocumentType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class DocumentUploadRequest {

    @NotNull(message = "Document type is required")
    private DocumentType documentType;

    @NotNull(message = "File is required")
    private MultipartFile file;


}

