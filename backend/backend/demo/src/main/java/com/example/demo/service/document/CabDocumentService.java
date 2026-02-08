package com.example.demo.service.document;

import com.example.demo.dto.DocumentUploadRequest;
import com.example.demo.entity.cab.Driver;
import com.example.demo.entity.document.Document;
import com.example.demo.repository.cab.*;
import com.example.demo.repository.document.DocumentRepository;
import com.example.demo.security.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CabDocumentService {
    private final DocumentRepository documentRepository;
    private final JwtUtil jwtUtil;
    private final DriverRepository driverRepository ;

    private UUID extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Claims claims = jwtUtil.extractAllClaims(token);
        return UUID.fromString(claims.get("userID").toString());
    }

    public Map<String,Object> uploadDocument(String authHeader, DocumentUploadRequest request)throws Exception{
        UUID id = extractUserId(authHeader);
            Driver driver = driverRepository.findByUserId(id).
                orElseThrow(()->new EntityNotFoundException("First Register"));

        byte[] fileBytes = request.getFile().getBytes();
        Document doc = Document.builder()
                .fileData(fileBytes)
                .verified(false)
                .documentType(request.getDocumentType())
                .driver(driver)
                .build();

        documentRepository.save(doc);
        new Thread(() -> {
            try {
                Thread.sleep(30000);

                doc.setVerified(true);
                documentRepository.save(doc);

                switch (doc.getDocumentType()) {
                    case PAN_CARD -> driver.setPanVerified(true);
                    case AADHAR_CARD -> driver.setAadharVerified(true);
                    case DRIVING_LICENSE -> driver.setLicenseVerified(true);
                    case GST_CERTIFICATE -> {
                    } // No specific field for GST yet, but handle to avoid warning
                }
                driverRepository.save(driver);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Document uploaded. Auto verification will complete in 30 seconds.");
        response.put("data", doc);

        return response;
    }

    public Map<String, Object> getOwnerDocuments(String authHeader) {

        UUID userId = extractUserId(authHeader);

        Driver driver =driverRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Hotel owner not found"));

        List<Document> documents = documentRepository.findByDriver(driver);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Documents fetched successfully");
        res.put("data", documents);

        return res;
    }

    // Verify document (Admin only)
    public Map<String, Object> verifyDocument(UUID documentId) {

        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        doc.setVerified(true);
        documentRepository.save(doc);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Document verified");
        res.put("data", doc);

        return res;
    }





}

