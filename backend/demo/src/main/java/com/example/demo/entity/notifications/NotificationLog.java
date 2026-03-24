package com.example.demo.entity.notifications;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Map;

@Document(collection = "notification_logs")
public class NotificationLog {
    @Id
    private String id;

    private Map<String, Object> payload;

    private String recipient;

}
