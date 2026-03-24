package com.example.demo.service.document;

import com.example.demo.dto.DocumentUploadRequest;
import com.example.demo.entity.hotel.HotelOwner;
import com.example.demo.entity.document.Document;
import com.example.demo.entity.users.User;
import com.example.demo.repository.document.DocumentRepository;
import com.example.demo.repository.hotel.HotelOwnerRepository;
import com.example.demo.repository.user.UserRepository;
import com.example.demo.security.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;


@Service
@RequiredArgsConstructor
public class HotelDocumentService {

    private final DocumentRepository documentRepository;
    private final HotelOwnerRepository hotelOwnerRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;


    private UUID extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Claims claims = jwtUtil.extractAllClaims(token);
        return UUID.fromString(claims.get("userID").toString());
    }

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


        new Thread(() -> {
            try {
                Thread.sleep(300);
                Document updatedDoc = documentRepository.findById(doc.getDocumentId())
                        .orElseThrow();
                updatedDoc.setVerified(true);
                documentRepository.save(updatedDoc);
                HotelOwner updatedOwner = hotelOwnerRepository
                        .findById(owner.getHotelOwnerId())
                        .orElseThrow();
                switch (updatedDoc.getDocumentType()) {
                    case PAN_CARD -> updatedOwner.setPanVerified(true);
                    case AADHAR_CARD -> updatedOwner.setAadharVerified(true);
                    case GST_CERTIFICATE -> updatedOwner.setGstVerified(true);
                    case HOTEL_LICENSE -> updatedOwner.setHotellicenceVerified(true);
                }
                hotelOwnerRepository.save(updatedOwner);
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

        HotelOwner owner = hotelOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Hotel owner not found"));

        List<Document> documents = documentRepository.findByHotelOwner(owner);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Documents fetched successfully");
        res.put("data", documents);

        return res;
    }

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
