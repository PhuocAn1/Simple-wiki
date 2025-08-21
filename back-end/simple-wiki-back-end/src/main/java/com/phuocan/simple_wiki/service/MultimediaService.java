package com.phuocan.simple_wiki.service;

import com.phuocan.simple_wiki.apiResponse.ApiResponse;
import com.phuocan.simple_wiki.dto.MultimediaDTO;
import com.phuocan.simple_wiki.model.Multimedia;
import com.phuocan.simple_wiki.model.User;
import com.phuocan.simple_wiki.repository.MultimediaRepository;
import com.phuocan.simple_wiki.repository.PageRepository;
import com.phuocan.simple_wiki.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MultimediaService {
    private final MultimediaRepository multimediaRepository;
    private final PageRepository pageRepository;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(MultimediaService.class);

    @Autowired
    public MultimediaService(MultimediaRepository multimediaRepository, PageRepository pageRepository, UserRepository userRepository) {
        this.multimediaRepository = multimediaRepository;
        this.pageRepository = pageRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ResponseEntity<ApiResponse<List<MultimediaDTO>>> getAllMultimediaByUsername(String username) {
        try {
            List<MultimediaDTO> multimediaDTOs = multimediaRepository.findAllByUsernameOrderedByUploadedAtDesc(username).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ApiResponse.success(HttpStatus.OK, multimediaDTOs);
        } catch (Exception e) {
            logger.error("Unable to get all multimedia: {}", e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to get all multimedia: " + e.getMessage());
        }
    }

    @Transactional
    public ResponseEntity<ApiResponse<List<MultimediaDTO>>> getAllMultimedia() {
        try {
            List<MultimediaDTO> multimediaDTOs = multimediaRepository.findAllOrderedByUploadedAtDesc().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ApiResponse.success(HttpStatus.OK, multimediaDTOs);
        } catch (Exception e) {
            logger.error("Unable to get all multimedia: {}", e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to get all multimedia: " + e.getMessage());
        }
    }

    public ResponseEntity<ApiResponse<MultimediaDTO>> getMultimediaById(Long id) {
        try {
            Optional<Multimedia> multimedia = multimediaRepository.findById(id);
            if (multimedia.isPresent()) {
                return ApiResponse.success(HttpStatus.OK, convertToDTO(multimedia.get()));
            }
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Multimedia not found with id: " + id);
        } catch (Exception e) {
            logger.error("Unable to get multimedia by id {}: {}", id, e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to get multimedia: " + e.getMessage());
        }
    }

    private String mediaPath = "src/main/resources/static/media/";
    public ResponseEntity<Resource> getMultimediaByFileName(String fileName) {
        try {
            Optional<Multimedia> multimedia = multimediaRepository.findByFileName(fileName);
            if (multimedia.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Path filePath = Paths.get(mediaPath, multimedia.get().getFileName());

            Resource fileResource = new UrlResource(filePath.toUri());
            return ResponseEntity.ok()
                    .contentType(MediaTypeFactory.getMediaType(fileResource).orElse(MediaType.APPLICATION_OCTET_STREAM))
                    .body(fileResource);
        } catch (Exception e) {
            logger.error("Unable to get multimedia by fileName {}: {}, {}", fileName, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    public ResponseEntity<ApiResponse<MultimediaDTO>> createMultimedia(MultimediaDTO multimediaDTO) {
        try {
            // Validate userId
            Optional<User> user = userRepository.findById(multimediaDTO.getUserId());
            if (!user.isPresent()) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, "User not found with id: " + multimediaDTO.getUserId());
            }

            Multimedia multimedia = new Multimedia();
            multimedia.setUser(user.get());
            multimedia.setFileName(multimediaDTO.getFileName());
            multimedia.setFileType(multimediaDTO.getFileType());
            multimedia.setFilePath(multimediaDTO.getFilePath());
            multimedia.setDescription(multimediaDTO.getDescription());
            multimedia.setUploadedAt(LocalDateTime.now());
            multimedia.setFileSize(multimediaDTO.getFileSize());

            Multimedia savedMultimedia = multimediaRepository.save(multimedia);
            return ApiResponse.success(HttpStatus.CREATED, convertToDTO(savedMultimedia));
        } catch (Exception e) {
            logger.error("Unable to create multimedia: {}", e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to create multimedia: " + e.getMessage());
        }
    }

    public ResponseEntity<ApiResponse<MultimediaDTO>> updateMultimedia(String fileName, MultimediaDTO multimediaDTO) {
        try {
            Optional<Multimedia> optionalMultimedia = multimediaRepository.findByFileName(fileName);
            if (!optionalMultimedia.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "Multimedia not found with fileName: " + fileName);
            }

            Multimedia multimedia = optionalMultimedia.get();

            // Update userId if provided
            if (multimediaDTO.getUserId() != null) {
                Optional<User> user = userRepository.findById(multimediaDTO.getUserId());
                if (!user.isPresent()) {
                    return ApiResponse.error(HttpStatus.BAD_REQUEST, "User not found with id: " + multimediaDTO.getUserId());
                }
                multimedia.setUser(user.get());
            }

            // Update fileName if provided
            if (multimediaDTO.getFileName() != null) {
                multimedia.setFileName(multimediaDTO.getFileName());
            }

            // Update fileType if provided
            if (multimediaDTO.getFileType() != null) {
                multimedia.setFileType(multimediaDTO.getFileType());
            }

            // Update filePath if provided
            if (multimediaDTO.getFilePath() != null) {
                multimedia.setFilePath(multimediaDTO.getFilePath());
            }

            // Update description if provided
            if (multimediaDTO.getDescription() != null) {
                multimedia.setDescription(multimediaDTO.getDescription());
            }

            multimedia.setUpdatedAt(LocalDateTime.now());

            Multimedia updatedMultimedia = multimediaRepository.save(multimedia);
            return ApiResponse.success(HttpStatus.OK, convertToDTO(updatedMultimedia));
        } catch (Exception e) {
            logger.error("Unable to update multimedia {}: {}", fileName, e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to update multimedia: " + e.getMessage());
        }
    }
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteMultimedia(String fileName) {
        try {
            Optional<Multimedia> optionalMultimedia = multimediaRepository.findByFileName(fileName);
            if (!optionalMultimedia.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "Multimedia not found with fileName: " + fileName);
            }

            // Remove the media from the database
            multimediaRepository.deleteById(optionalMultimedia.get().getMediaId());
            // Try to remove the media from the actual storage
            Path filePath = Paths.get(mediaPath, fileName);
            try {
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                    logger.info("Deleted media file: {}", filePath);
                } else {
                    logger.warn("File {} not found in filesystem. DB record deleted.", fileName);
                }
            } catch (IOException e) {
                logger.error("Error deleting file {}: {}", fileName, e.getMessage());
                // Optional: consider whether to propagate this as an error response or just log it
            }

            return ApiResponse.success(HttpStatus.OK, null);
        } catch (Exception e) {
            logger.error("Unable to delete multimedia {}: {}", fileName, e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to delete multimedia: " + e.getMessage());
        }
    }

    private String normalizeFilename(String filename) {
        //This function will normalize file name white space " " to "_"
        if (filename == null) {
            return null;
        }
        return filename.trim().replaceAll("\\s+", "_");
    }

    public ResponseEntity<ApiResponse<List<String>>> checkDuplicateFilenames(List<String> filenames) {
        try {
            List<String> duplicates = new ArrayList<>();

            for (String name : filenames) {
                Optional<Multimedia> multimedia = multimediaRepository.findByFileName(normalizeFilename(name));
                if (multimedia.isPresent()) {
                    duplicates.add(name);
                }
            }

            return ApiResponse.success(HttpStatus.OK, duplicates);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to check filenames.");
        }
    }

    private MultimediaDTO convertToDTO(Multimedia multimedia) {
        return new MultimediaDTO(
                multimedia.getMediaId(),
                multimedia.getUser().getUserId(),
                multimedia.getFileName(),
                multimedia.getFileType(),
                multimedia.getFilePath(),
                multimedia.getDescription(),
                multimedia.getUploadedAt(),
                multimedia.getUpdatedAt(),
                multimedia.getUser().getUsername(),
                multimedia.getFileSize()
        );
    }
}
