package com.example.demo.entity.notifications;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

// NotificationLog.java
@Document(collection = "notification_logs")
public class NotificationLog {
    @Id
    private String id;

    // Flexible JSON-like structure can be mapped to a Java Map<String, Object>
    private Map<String, Object> payload;

    private String recipient;
    // ... other fields like status, timestamp, templateId
    // ...
}
