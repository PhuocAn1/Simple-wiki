package com.phuocan.simple_wiki.dto;

import java.time.LocalDateTime;

public class LogDTO {
    private String message;
    private LocalDateTime timeStamp;

    public LogDTO(String message, LocalDateTime sentAt) {
        this.message = message;
        this.timeStamp = sentAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(LocalDateTime timeStamp) {
        this.timeStamp = timeStamp;
    }
}
