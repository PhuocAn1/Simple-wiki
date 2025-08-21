package com.phuocan.simple_wiki.service;

import com.phuocan.simple_wiki.model.Multimedia;
import com.phuocan.simple_wiki.model.User;
import com.phuocan.simple_wiki.repository.MultimediaRepository;
import com.phuocan.simple_wiki.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class MediaUploadService {
    private final MultimediaRepository multimediaRepository;
    private final UserRepository userRepository;
    public final String mediaPath = "src/main/resources/static/media/";
    private static final Logger logger = LoggerFactory.getLogger(MediaUploadService.class);

    @Autowired
    public MediaUploadService(MultimediaRepository multimediaRepository, UserRepository userRepository) {
        this.multimediaRepository = multimediaRepository;
        this.userRepository = userRepository;
    }

    private String normalizeFilename(String filename) {
        //This function will normalize file name white space " " to "_"
        if (filename == null) {
            return null;
        }
        return filename.trim().replaceAll("\\s+", "_");
    }

    public Multimedia uploadMedia(MultipartFile file, Long userId, String description) throws IOException {
        String fileName = normalizeFilename(Paths.get(file.getOriginalFilename()).getFileName().toString());
        Path targetPath = Paths.get(mediaPath, fileName);
        Files.createDirectories(targetPath.getParent());
        Files.write(targetPath, file.getBytes());

        logger.info("File original name: {}, file target path: {}", fileName, targetPath);

        Optional<User> user = userRepository.findById(userId);
        if (!user.isPresent()) {
            throw new IllegalArgumentException("User with id: " + userId + " not found");
        }

        long size = file.getSize();
        Multimedia media = new Multimedia();
        media.setUser(user.get());
        media.setFileName(fileName);
        media.setFileType(determineFileType(file.getContentType()));
        media.setFilePath("/media/" + fileName);
        media.setDescription(description);
        media.setUploadedAt(LocalDateTime.now());
        media.setFileSize(size);
        return multimediaRepository.save(media);
    }


    public static Multimedia.FileType determineFileType(String contentType) {
        if (contentType == null) return null;
        switch (contentType) {
            case "image/png": return Multimedia.FileType.png;
            case "image/gif": return Multimedia.FileType.gif;
            case "image/jpeg": return Multimedia.FileType.jpeg; // or jpg
            case "image/jpg": return Multimedia.FileType.jpg;
            case "image/webp": return Multimedia.FileType.webp;
            case "image/x-icon": return Multimedia.FileType.ico;
            case "image/svg+xml": return Multimedia.FileType.svg;

            case "audio/wav": return Multimedia.FileType.wav;
            case "audio/x-wav": return Multimedia.FileType.wav;
            case "audio/mpeg": return Multimedia.FileType.mp3;
            case "audio/ogg": return Multimedia.FileType.ogg;
            case "audio/flac": return Multimedia.FileType.flac;

            case "video/mp4": return Multimedia.FileType.mp4;
            case "video/webm": return Multimedia.FileType.webm;
            case "video/x-matroska": return Multimedia.FileType.mkv;
            case "video/quicktime": return Multimedia.FileType.mov;

            case "application/pdf": return Multimedia.FileType.pdf;

            default: return Multimedia.FileType.unknown; // or throw exception / use fallback
        }
    }
}
