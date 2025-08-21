package com.phuocan.simple_wiki.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class PageDTO {
    private Long pageId;

    @NotNull
    @Size(max = 255)
    private String title;
    @NotNull
    private Long userId;
    private PageRevisionDTO pageRevisionDTO;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public PageDTO() {}

    public PageDTO(Long pageId, String title, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.pageId = pageId;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public PageRevisionDTO getPageRevisionDTO() {
        return pageRevisionDTO;
    }

    public void setPageRevisionDTO(PageRevisionDTO pageRevisionDTO) {
        this.pageRevisionDTO = pageRevisionDTO;
    }

    public Long getPageId() {
        return pageId;
    }

    public void setPageId(Long pageId) {
        this.pageId = pageId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
