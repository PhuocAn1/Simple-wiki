package com.phuocan.simple_wiki.service;

import com.phuocan.simple_wiki.apiResponse.ApiResponse;
import com.phuocan.simple_wiki.dto.PageDTO;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PageService {
    private final PageRepository pageRepository;
    private final PageRevisionRepository pageRevisionRepository;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(PageService.class);

    @Autowired
    public PageService(PageRepository pageRepository, PageRevisionRepository pageRevisionRepository
            , UserRepository userRepository) {
        this.pageRepository = pageRepository;
        this.pageRevisionRepository = pageRevisionRepository;
        this.userRepository = userRepository;
    }

    public ResponseEntity<ApiResponse<List<String>>> suggestPageTitle(String query) {
        try {
            if (query.isBlank()) {
                return ApiResponse.success(HttpStatus.OK, Collections.emptyList());
            }

            List<String> pageTitles = pageRepository.searchPagesByTitle(query).stream()
                    .map(Page::getTitle)
                    .limit(10) // Only show top 10 matches
                    .collect(Collectors.toList());

            return ApiResponse.success(HttpStatus.OK, pageTitles);
        } catch (Exception e) {
            logger.error("Unable to get page title suggestions!");
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to get page title suggestions!");
        }
    }

    @Transactional
    public ResponseEntity<ApiResponse<Page>> createPage(PageDTO pageDTO) {
        try {
            if (pageRepository.existsByTitle(pageDTO.getTitle())) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, "Title already exists");
            }

            // Create a new page
            LocalDateTime now = LocalDateTime.now();
            Page page = new Page();
            page.setTitle(pageDTO.getTitle());
            page.setCreatedAt(now);
            page.setUpdatedAt(now);

            Page savedPage = pageRepository.save(page);

            // Create a new page revision
            PageRevision pageRevision = new PageRevision();
            pageRevision.setPage(savedPage);

            // May need to adjust how to pass userId to create a page revision
            Optional<User> user = userRepository.findById(pageDTO.getUserId());
            if (user.isEmpty()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "Unable to find user with id: " + pageDTO.getUserId());
            }
            pageRevision.setUser(user.get());

            PageRevisionDTO revisionDTO = pageDTO.getPageRevisionDTO();
            pageRevision.setContent(revisionDTO != null && revisionDTO.getContent() != null ? revisionDTO.getContent() : "");
            pageRevision.setSummary(revisionDTO != null && revisionDTO.getSummary() != null ? revisionDTO.getSummary() : "");
            pageRevision.setCreatedAt(now);

            pageRevisionRepository.save(pageRevision);

            return ApiResponse.success(HttpStatus.CREATED, savedPage);
        } catch (Exception e) {
            logger.error("Unable to create page: {}", e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to create page: " + e.getMessage());
        }
    }
    /* Update a page logic */
    public ResponseEntity<ApiResponse<Page>> updatePage(String pageTitle, PageDTO pageDTO) {
        try {
            // Validate page existence
            Optional<Page> optionalPage = pageRepository.findByTitle(pageTitle);
            if (!optionalPage.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "Page not found with title: " + pageTitle);
            }
            Page page = optionalPage.get();

            // Validate user existence
            Optional<User> user = userRepository.findById(pageDTO.getUserId());
            if (user.isEmpty()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "Unable to find user with id: " + pageDTO.getUserId());
            }

            LocalDateTime now = LocalDateTime.now();
            boolean isPageTitleUpdated = updatePageTitle(page, pageDTO);
            String titleUpdateSummary = isPageTitleUpdated
                    ? "Page title updated from '" + pageTitle + "' to '" + pageDTO.getTitle() + "'.\n"
                    : "";

            // Update page timestamp
            page.setUpdatedAt(now);

            // Handle page revision
            if (isPageTitleUpdated || pageDTO.getPageRevisionDTO() != null) {
                createPageRevision(page, user.get(), pageDTO.getPageRevisionDTO(), titleUpdateSummary, now);
            }

            // Save updated page
            Page updatedPage = pageRepository.save(page);
            return ApiResponse.success(HttpStatus.OK, updatedPage);
        } catch (Exception e) {
            logger.error("Unable to update page {}: {}", pageTitle, e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to update page: " + e.getMessage());
        }
    }

    private boolean updatePageTitle(Page page, PageDTO pageDTO) {
        if (pageDTO.getTitle() == null || pageDTO.getTitle().equals(page.getTitle())) {
            return false;
        }
        if (pageRepository.existsByTitle(pageDTO.getTitle())) {
            throw new IllegalArgumentException("Title already exists");
        }
        page.setTitle(pageDTO.getTitle());
        return true;
    }

    private void createPageRevision(Page page, User user, PageRevisionDTO revisionDTO, String titleUpdateSummary, LocalDateTime now) {
        PageRevision pageRevision = new PageRevision();
        pageRevision.setPage(page);
        pageRevision.setUser(user);
        pageRevision.setCreatedAt(now);

        // If no revision DTO is provided, use the latest revision's content
        if (revisionDTO == null) {
            Optional<PageRevision> latestRevision = pageRevisionRepository.findTopByPageIdOrderByCreatedAtDesc(page.getPageId());
            if (latestRevision.isEmpty()) {
                throw new IllegalStateException("No previous revision found for page: " + page.getTitle());
            }
            pageRevision.setContent(latestRevision.get().getContent());
            pageRevision.setSummary(titleUpdateSummary);
        } else {
            // Use provided revision DTO
            pageRevision.setContent(revisionDTO.getContent() != null ? revisionDTO.getContent() : "");
            pageRevision.setSummary(titleUpdateSummary + (revisionDTO.getSummary() != null ? revisionDTO.getSummary() : ""));
        }

        pageRevisionRepository.save(pageRevision);
    }

    /* --------------------------------------------------------- */
    public ResponseEntity<ApiResponse<List<Page>>> getAllPages() {
        try {
            return ApiResponse.success(HttpStatus.CREATED, pageRepository.findAll());
        } catch (Exception e) {
            logger.error("Unable to get all pages: {}", e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to get all pages: " + e.getMessage());
        }
    }

    public ResponseEntity<ApiResponse<Page>> getPage(Long id) {
        try {
            if (!pageRepository.existsById(id)) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "Unable to find the page with id: " + id);
            }

            return ApiResponse.success(HttpStatus.CREATED, pageRepository.findById(id).get());
        } catch (Exception e) {
            logger.error("Unable to the page with id: " + id + ": {}", e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to the page with id: " + id + e.getMessage());
        }
    }

    public ResponseEntity<ApiResponse<Page>> getPageByTitle(String pageTitle) {
        try {
            if (!pageRepository.existsByTitle(pageTitle)) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "Page with title: " + pageTitle +
                                            " do not exists");
            }

            Optional<Page> optionalPage = pageRepository.findByTitle(pageTitle);
            if (optionalPage.isEmpty()) {
                return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to find the page with title: "
                        + pageTitle + ". ");
            }

            return ApiResponse.success(HttpStatus.OK, optionalPage.get());
        } catch (Exception e) {
            logger.error("Unable to find the page with title: " + pageTitle + ":{}", e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to find the page with title: "
                    + pageTitle + ". " + e.getMessage());
        }
    }

    public ResponseEntity<ApiResponse<Void>> deletePage(Long id) {
        try {
            Optional<Page> page = pageRepository.findById(id);
            if (!page.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "Unable to find page with id: " + id);
            }

            pageRepository.deleteById(id);
            return ApiResponse.success(HttpStatus.OK, null);
        } catch (Exception e) {
            logger.error("Unable to delete page with id: " + id +"{}", e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to delete page with id: " + id + " " + e.getMessage());
        }
    }
}
