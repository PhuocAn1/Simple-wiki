package com.phuocan.simple_wiki.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "multimedia")
public class Multimedia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "media_id")
    private Long mediaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", nullable = false)
    private FileType fileType;

    @Column(name = "file_path", nullable = false, length = 255)
    private String filePath;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @Column(name = "file_size")
    private Long fileSize; // size in bytes
    public enum FileType {
        png("image/png"),
        gif("image/gif"),
        jpg("image/jpeg"),
        jpeg("image/jpeg"),
        webp("image/webp"),
        ico("image/x-icon"),
        svg("image/svg+xml"),
        wav("audio/wav"),
        mp3("audio/mpeg"),
        ogg("audio/ogg"),
        flac("audio/flac"),
        mp4("video/mp4"),
        webm("video/webm"),
        mkv("video/x-matroska"),
        mov("video/quicktime"),
        pdf("application/pdf"),
        unknown("application/octet-stream");


        private final String mimeType;

        FileType(String mimeType) {
            this.mimeType = mimeType;
        }

        public String getMimeType() {
            return mimeType;
        }

        public static FileType fromMimeType(String mimeType) {
            for (FileType type : values()) {
                if (type.getMimeType().equalsIgnoreCase(mimeType)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Unsupported MIME type: " + mimeType);
        }
    }
    // Default constructor
    public Multimedia() {}

    // Constructor with fields
    public Multimedia(Long mediaId, User user, String fileName, FileType fileType, String filePath, String description, LocalDateTime uploadedAt, Long fileSize) {
        this.mediaId = mediaId;
        this.user = user;
        this.fileName = fileName;
        this.fileType = fileType;
        this.filePath = filePath;
        this.description = description;
        this.uploadedAt = uploadedAt;
        this.fileSize = fileSize;
    }

    // Getters and setters

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Long getMediaId() {
        return mediaId;
    }

    public void setMediaId(Long mediaId) {
        this.mediaId = mediaId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
