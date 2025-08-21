package com.phuocan.simple_wiki.dto;

import com.phuocan.simple_wiki.model.Multimedia.FileType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class MultimediaDTO {
    private Long mediaId;

    @NotNull
    private Long userId;
    private String username;
    @NotNull
    @Size(min = 1, max = 255)
    private String fileName;

    @NotNull
    private FileType fileType;

    @NotNull
    @Size(min = 1, max = 255)
    private String filePath;

    private String description;

    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;
    private Long fileSize;
    // Default constructor
    public MultimediaDTO() {}

    // Constructor with fields
    public MultimediaDTO(Long mediaId, Long userId, String fileName, FileType fileType, String filePath,
                         String description, LocalDateTime uploadedAt, LocalDateTime updatedAt, String username, Long fileSize) {
        this.mediaId = mediaId;
        this.userId = userId;
        this.fileName = fileName;
        this.fileType = fileType;
        this.filePath = filePath;
        this.description = description;
        this.uploadedAt = uploadedAt;
        this.updatedAt = updatedAt;
        this.username = username;
        this.fileSize = fileSize;
    }

    // Getters and setters
    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getMediaId() {
        return mediaId;
    }

    public void setMediaId(Long mediaId) {
        this.mediaId = mediaId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public FileType getFileType() {
        return fileType;
    }

    public void setFileType(FileType fileType) {
        this.fileType = fileType;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
