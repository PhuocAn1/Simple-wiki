package com.phuocan.simple_wiki.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class PageRevisionDTO {
    private Long revisionId;

    //@NotNull
    private Long pageId;

    //@NotNull
    private Long userId;

    //@NotNull
    //@Size(min = 1)
    private String content;

    @Size(max = 255)
    private String summary;

    private LocalDateTime createdAt;

    // Default constructor
    public PageRevisionDTO() {}

    // Constructor with fields
    public PageRevisionDTO(Long revisionId, Long pageId, Long userId, String content, String summary, LocalDateTime createdAt) {
        this.revisionId = revisionId;
        this.pageId = pageId;
        this.userId = userId;
        this.content = content;
        this.summary = summary;
        this.createdAt = createdAt;
    }

    // Getters and setters
    public Long getRevisionId() {
        return revisionId;
    }

    public void setRevisionId(Long revisionId) {
        this.revisionId = revisionId;
    }

    public Long getPageId() {
        return pageId;
    }

    public void setPageId(Long pageId) {
        this.pageId = pageId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
