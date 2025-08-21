package com.phuocan.simple_wiki.service;

import com.phuocan.simple_wiki.apiResponse.ApiResponse;
import com.phuocan.simple_wiki.dto.PageRevisionDTO;
import com.phuocan.simple_wiki.model.Page;
import com.phuocan.simple_wiki.model.PageRevision;
import com.phuocan.simple_wiki.model.User;
import com.phuocan.simple_wiki.repository.PageRepository;
import com.phuocan.simple_wiki.repository.PageRevisionRepository;
import com.phuocan.simple_wiki.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PageRevisionService {
    private final PageRevisionRepository pageRevisionRepository;
    private final PageRepository pageRepository;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(PageRevisionService.class);

    @Autowired
    public PageRevisionService(PageRevisionRepository pageRevisionRepository, PageRepository pageRepository, UserRepository userRepository) {
        this.pageRevisionRepository = pageRevisionRepository;
        this.pageRepository = pageRepository;
        this.userRepository = userRepository;
    }

    public ResponseEntity<ApiResponse<List<PageRevisionDTO>>> getAllPageRevisions() {
        try {
            List<PageRevision> revisions = pageRevisionRepository.findAll();
            List<PageRevisionDTO> revisionDTOs = revisions.stream()
                    .map(this::convertToDTO)
                    .toList();
            return ApiResponse.success(HttpStatus.OK, revisionDTOs);
        } catch (Exception e) {
            logger.error("Unable to get all page revisions: {}", e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to get all page revisions: " + e.getMessage());
        }
    }

    public ResponseEntity<ApiResponse<PageRevisionDTO>> getPageRevisionById(Long id) {
        try {
            Optional<PageRevision> pageRevision = pageRevisionRepository.findById(id);
            if (pageRevision.isPresent()) {
                return ApiResponse.success(HttpStatus.OK, convertToDTO(pageRevision.get()));
            }
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Page revision not found with id: " + id);
        } catch (Exception e) {
            logger.error("Unable to get page revision by id {}: {}", id, e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to get page revision: " + e.getMessage());
        }
    }

    public ResponseEntity<ApiResponse<PageRevisionDTO>> createPageRevision(PageRevisionDTO pageRevisionDTO) {
        try {
            Optional<Page> page = pageRepository.findById(pageRevisionDTO.getPageId());
            if (!page.isPresent()) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, "Page not found with id: " + pageRevisionDTO.getPageId());
            }

            Optional<User> user = userRepository.findById(pageRevisionDTO.getUserId());
            if (!user.isPresent()) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, "User not found with id: " + pageRevisionDTO.getUserId());
            }

            PageRevision pageRevision = new PageRevision();
            pageRevision.setPage(page.get());
            pageRevision.setUser(user.get());
            pageRevision.setContent(pageRevisionDTO.getContent());
            pageRevision.setSummary(pageRevisionDTO.getSummary());
            pageRevision.setCreatedAt(LocalDateTime.now());

            PageRevision savedPageRevision = pageRevisionRepository.save(pageRevision);
            return ApiResponse.success(HttpStatus.CREATED, convertToDTO(savedPageRevision));
        } catch (Exception e) {
            logger.error("Unable to create page revision: {}", e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to create page revision: " + e.getMessage());
        }
    }

    public ResponseEntity<ApiResponse<PageRevisionDTO>> updatePageRevision(Long id, PageRevisionDTO pageRevisionDTO) {
        try {
            Optional<PageRevision> optionalPageRevision = pageRevisionRepository.findById(id);
            if (!optionalPageRevision.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "Page revision not found with id: " + id);
            }

            PageRevision pageRevision = optionalPageRevision.get();

            if (pageRevisionDTO.getPageId() != null) {
                Optional<Page> page = pageRepository.findById(pageRevisionDTO.getPageId());
                if (!page.isPresent()) {
                    return ApiResponse.error(HttpStatus.BAD_REQUEST, "Page not found with id: " + pageRevisionDTO.getPageId());
                }
                pageRevision.setPage(page.get());
            }

            if (pageRevisionDTO.getUserId() != null) {
                Optional<User> user = userRepository.findById(pageRevisionDTO.getUserId());
                if (!user.isPresent()) {
                    return ApiResponse.error(HttpStatus.BAD_REQUEST, "User not found with id: " + pageRevisionDTO.getUserId());
                }
                pageRevision.setUser(user.get());
            }

            if (pageRevisionDTO.getContent() != null) {
                pageRevision.setContent(pageRevisionDTO.getContent());
            }

            if (pageRevisionDTO.getSummary() != null) {
                pageRevision.setSummary(pageRevisionDTO.getSummary());
            }

            pageRevision.setCreatedAt(LocalDateTime.now());

            PageRevision updatedPageRevision = pageRevisionRepository.save(pageRevision);
            return ApiResponse.success(HttpStatus.OK, convertToDTO(updatedPageRevision));
        } catch (Exception e) {
            logger.error("Unable to update page revision {}: {}", id, e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to update page revision: " + e.getMessage());
        }
    }

    public ResponseEntity<ApiResponse<Void>> deletePageRevision(Long id) {
        try {
            Optional<PageRevision> optionalPageRevision = pageRevisionRepository.findById(id);
            if (!optionalPageRevision.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "Page revision not found with id: " + id);
            }

            pageRevisionRepository.deleteById(id);
            return ApiResponse.success(HttpStatus.NO_CONTENT, null);
        } catch (Exception e) {
            logger.error("Unable to delete page revision {}: {}", id, e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to delete page revision: " + e.getMessage());
        }
    }

    private PageRevisionDTO convertToDTO(PageRevision pageRevision) {
        return new PageRevisionDTO(
                pageRevision.getRevisionId(),
                pageRevision.getPage().getPageId(),
                pageRevision.getUser().getUserId(),
                pageRevision.getContent(),
                pageRevision.getSummary(),
                pageRevision.getCreatedAt()
        );
    }

    public PageRevision getLatestRevision(Long pageId) {
        Optional<PageRevision> optionalPageRevision = pageRevisionRepository.findTopByPageIdOrderByCreatedAtDesc(pageId);
        if (!optionalPageRevision.isPresent()) {
            return null;
        }
        return optionalPageRevision.get();
    }
}
