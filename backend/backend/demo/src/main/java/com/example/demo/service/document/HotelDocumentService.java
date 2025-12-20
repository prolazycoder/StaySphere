package com.example.demo.service.document;

import com.example.demo.dto.DocumentUploadRequest;
import com.example.demo.entity.hotel.HotelOwner;
import com.example.demo.entity.document.Document;
import com.example.demo.repository.document.DocumentRepository;
import com.example.demo.repository.hotel.HotelOwnerRepository;
import com.example.demo.security.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;


@Service
@RequiredArgsConstructor
public class HotelDocumentService {

    private final DocumentRepository documentRepository;
    private final HotelOwnerRepository hotelOwnerRepository;
    private final JwtUtil jwtUtil;

    // Helper: Extract userID from JWT
    private UUID extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Claims claims = jwtUtil.extractAllClaims(token);
        return UUID.fromString(claims.get("userID").toString());
    }

    // Upload Document
    public Map<String, Object> uploadDocument(String authHeader, DocumentUploadRequest request) throws Exception {

        UUID userId = extractUserId(authHeader);

        HotelOwner owner = hotelOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Hotel owner not found"));

        byte[] fileBytes = request.getFile().getBytes();

        Document doc = Document.builder()
                .hotelOwner(owner)
                .fileData(fileBytes)
                .verified(false)
                .documentType(request.getDocumentType())
                .build();

        documentRepository.save(doc);

        // 🔥 Auto verify after 30 seconds
        new Thread(() -> {
            try {
                Thread.sleep(30000);

                doc.setVerified(true);
                documentRepository.save(doc);

                switch (doc.getDocumentType()) {
                    case PAN_CARD -> owner.setPanVerified(true);
                    case AADHAR_CARD -> owner.setAadharVerified(true);
                    case GST_CERTIFICATE -> owner.setGstVerified(true);
                    case DRIVING_LICENSE -> owner.setHotellicenceVerified(true);
                    case HOTEL_LICENSE -> owner.setHotellicenceVerified(true);
                }

                hotelOwnerRepository.save(owner);

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
    // View documents
    public Map<String, Object> getOwnerDocuments(String authHeader) {

        UUID userId = extractUserId(authHeader);

        HotelOwner owner = hotelOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Hotel owner not found"));

        List<Document> documents = documentRepository.findByHotelOwner(owner);

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
