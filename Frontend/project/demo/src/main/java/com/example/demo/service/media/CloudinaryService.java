package com.example.demo.service.media;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file, String folder) {
        try {
            Map<String, Object> options = Map.of(
                    "folder", folder,
                    "resource_type", "auto" // ✅ image / video auto handled
            );

            Map uploadResult = cloudinary.uploader()
                    .upload(file.getBytes(), options);

            return uploadResult.get("secure_url").toString();

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload to Cloudinary", e);
        }
    }
}