package com.example.demo.entity.notifications;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

// NotificationTemplate.java
@Document(collection = "notification_templates")
public class Notification {
    @Id // Maps to _id in MongoDB, e.g., payment_success_email_v1
    private String id;

    private String channel;
    private String subject;
    private String bodyHtml;
    // ...
}

