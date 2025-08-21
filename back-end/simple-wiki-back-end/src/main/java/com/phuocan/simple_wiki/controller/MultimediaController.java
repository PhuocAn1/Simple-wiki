package com.phuocan.simple_wiki.controller;

import com.phuocan.simple_wiki.apiResponse.ApiResponse;
import com.phuocan.simple_wiki.dto.MultimediaDTO;
import com.phuocan.simple_wiki.model.Multimedia;
import com.phuocan.simple_wiki.service.MediaUploadService;
import com.phuocan.simple_wiki.service.MultimediaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("media")
public class MultimediaController {
    private final MultimediaService multimediaService;
    private final MediaUploadService mediaUploadService;

    @Autowired
    public MultimediaController(MultimediaService multimediaService, MediaUploadService mediaUploadService) {
        this.multimediaService = multimediaService;
        this.mediaUploadService = mediaUploadService;
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<MultimediaDTO>>> getAllMultimedia() {
        return multimediaService.getAllMultimedia();
    }

    @GetMapping("/all/{username}")
    public ResponseEntity<ApiResponse<List<MultimediaDTO>>> getAllMultimediaByUsername(@PathVariable String username) {
        return multimediaService.getAllMultimediaByUsername(username);
    }

    @PostMapping("/check-filenames")
    public ResponseEntity<ApiResponse<List<String>>> checkDuplicateFilenames(@RequestBody List<String> filenames) {
        // This function check for duplicate names in the list and return a list of duplicate names
        return multimediaService.checkDuplicateFilenames(filenames);
    }

    @GetMapping("{fileName}")
    public ResponseEntity<Resource> getMultimediaByFileName(@PathVariable String fileName) {
        return multimediaService.getMultimediaByFileName(fileName);
    }
    @PostMapping
    public ResponseEntity<ApiResponse<MultimediaDTO>> createMultimedia(@Valid @RequestBody MultimediaDTO multimediaDTO) {
        return multimediaService.createMultimedia(multimediaDTO);
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<List<String>>> uploadMedia(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("userId") Long userId,
            @RequestParam("description") String description
    ) {
        try {
            List<String> uploadedFileNames = new ArrayList<>();

            for (MultipartFile file : files) {
                Multimedia media = mediaUploadService.uploadMedia(file, userId, description);
                uploadedFileNames.add(media.getFileName());
            }

            return ApiResponse.success(HttpStatus.OK, uploadedFileNames); // returns all uploaded filenames
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (IOException e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "File upload failed");
        }
    }



    @PutMapping("{fileName}")
    public ResponseEntity<ApiResponse<MultimediaDTO>> updateMultimedia(@PathVariable String fileName, @RequestBody MultimediaDTO multimediaDTO) {
        return multimediaService.updateMultimedia(fileName, multimediaDTO);
    }

    @DeleteMapping("{fileName}")
    public ResponseEntity<ApiResponse<Void>> deleteMultimedia(@PathVariable String fileName) {
        return multimediaService.deleteMultimedia(fileName);
    }
}
