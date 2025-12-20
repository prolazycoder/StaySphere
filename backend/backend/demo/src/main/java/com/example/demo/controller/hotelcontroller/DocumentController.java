package com.example.demo.controller.hotelcontroller;

import com.example.demo.dto.DocumentUploadRequest;
import com.example.demo.enums.document.DocumentType;
import com.example.demo.service.document.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/document")
@RequiredArgsConstructor
@Tag(name = "Document API")
public class DocumentController {

    private final HotelDocumentService hotelDocumentService;

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestHeader("Authorization") String token,
            @RequestPart("documentType") String documentType,
            @RequestPart("file") MultipartFile file
    ) throws Exception {

        DocumentUploadRequest request = new DocumentUploadRequest();
        DocumentType type = DocumentType.valueOf(documentType.trim().toUpperCase());
        request.setDocumentType(type);
        request.setFile(file);

        return ResponseEntity.ok(hotelDocumentService.uploadDocument(token, request));
    }



    @Operation(summary = "Get All Documents for Logged-In Owner")
    @GetMapping("/my-documents")
    public ResponseEntity<Map<String, Object>> getMyDocuments(
            @RequestHeader("Authorization") String token
    ) {
        return ResponseEntity.ok(hotelDocumentService.getOwnerDocuments(token));
    }

    @Operation(summary = "Verify Document (Admin Only)")
    @PutMapping("/verify/{documentId}")
    public ResponseEntity<Map<String, Object>> verifyDocument(
            @PathVariable UUID documentId
    ) {
        return ResponseEntity.ok(hotelDocumentService.verifyDocument(documentId));
    }
}