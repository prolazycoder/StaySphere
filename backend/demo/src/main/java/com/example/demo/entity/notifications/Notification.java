package com.example.demo.entity.notifications;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "notification_templates")
public class Notification {
    @Id
    private String id;

    private String channel;
    private String subject;
    private String bodyHtml;

}

