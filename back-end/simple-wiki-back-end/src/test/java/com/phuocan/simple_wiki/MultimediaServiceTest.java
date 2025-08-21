package com.phuocan.simple_wiki;

import com.phuocan.simple_wiki.apiResponse.ApiResponse;
import com.phuocan.simple_wiki.model.Multimedia;
import com.phuocan.simple_wiki.model.User;
import com.phuocan.simple_wiki.repository.MultimediaRepository;
import com.phuocan.simple_wiki.repository.UserRepository;
import com.phuocan.simple_wiki.service.MediaUploadService;
import com.phuocan.simple_wiki.service.MultimediaService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import static org.hibernate.validator.internal.util.Contracts.assertNotNull;
import static org.hibernate.validator.internal.util.Contracts.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class MultimediaServiceTest {
    @Autowired
    private MultimediaService multimediaService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MultimediaRepository multimediaRepository;
    @Autowired
    private MediaUploadService mediaUploadService;
    private User testUser;

    @BeforeEach
    void setup() {
        testUser = userRepository.findByUsername("editor1").get();
    }

    @AfterEach
    void cleanup() throws IOException {
        List<String> filenames = List.of("test-image.png", "test-audio.mp3", "test-document.pdf");
        for (String filename : filenames) {
            Path filePath = Paths.get("src/main/resources/static/media/", filename);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        }
        System.out.println("Cleaning up!");
    }

    @Test
    @Order(2)
    void testDeleteMultimedia() throws IOException {
        List<String> filenames = List.of("test-image.png", "test-audio.mp3", "test-document.pdf");
        ResponseEntity<ApiResponse<Void>> response;

        // Setting up the test
        // Create multiple mock files
        List<MockMultipartFile> mockFiles = List.of(
                new MockMultipartFile("files", "test-image.png", "image/png", "dummy image content".getBytes()),
                new MockMultipartFile("files", "test-audio.mp3", "audio/mpeg", "dummy audio content".getBytes()),
                new MockMultipartFile("files", "test-document.pdf", "application/pdf", "dummy pdf content".getBytes())
        );
        for (MockMultipartFile mockFile : mockFiles) {
            // Call the service method
            Multimedia result = mediaUploadService.uploadMedia(mockFile, testUser.getUserId(), "Test description");
        }

        // Call delete method
        for (String filename : filenames) {
            System.out.println("Filename: " + filename);
            response = multimediaService.deleteMultimedia(filename);
            // Assertions
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertFalse(Files.exists(Paths.get("src/main/resources/static/media/", filename)), "File should be deleted");
            assertTrue(multimediaRepository.findByFileName(filename).isEmpty(), "DB record should be gone");
        }
    }

    @Test
    @Order(1)
    void testUploadMedia_multipleFiles_success() throws IOException {
        // Create multiple mock files
        List<MockMultipartFile> mockFiles = List.of(
                new MockMultipartFile("files", "test-image.png", "image/png", "dummy image content".getBytes()),
                new MockMultipartFile("files", "test-audio.mp3", "audio/mpeg", "dummy audio content".getBytes()),
                new MockMultipartFile("files", "test-document.pdf", "application/pdf", "dummy pdf content".getBytes())
        );

        List<String> expectedFilePaths = new ArrayList<>();

        for (MockMultipartFile mockFile : mockFiles) {
            // Call the service method
            Multimedia result = mediaUploadService.uploadMedia(mockFile, testUser.getUserId(), "Test description");

            // Build expected path
            Path expectedPath = Paths.get("src/main/resources/static/media/", mockFile.getOriginalFilename());
            expectedFilePaths.add(expectedPath.toString());

            // Assertions per file
            assertTrue(Files.exists(expectedPath), "File should exist in media folder");
            assertNotNull(result);
            assertEquals(mockFile.getOriginalFilename(), result.getFileName());
            assertEquals("/media/" + mockFile.getOriginalFilename(), result.getFilePath());
            assertEquals("Test description", result.getDescription());
            assertEquals(testUser.getUserId(), result.getUser().getUserId());

            // Optional: check MIME mapping
            assertEquals(
                    MediaUploadService.determineFileType(mockFile.getContentType()),
                    result.getFileType()
            );
        }

        // Optional: print paths for debugging
        expectedFilePaths.forEach(path -> System.out.println("Uploaded path verified: " + path));
    }

}
