package com.phuocan.simple_wiki.controller;

import com.phuocan.simple_wiki.apiResponse.ApiResponse;
import com.phuocan.simple_wiki.dto.PageDTO;
import com.phuocan.simple_wiki.dto.PageRevisionDTO;
import com.phuocan.simple_wiki.model.Page;
import com.phuocan.simple_wiki.model.PageRevision;
import com.phuocan.simple_wiki.service.PageRevisionService;
import com.phuocan.simple_wiki.service.PageService;
import com.phuocan.simple_wiki.service.WikiMarkupService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("pages")
public class PageController {
    private final PageService pageService;
    private final WikiMarkupService wikiMarkupService;
    private final PageRevisionService pageRevisionService;
    private static final Logger logger = LoggerFactory.getLogger(PageController.class);

    @Autowired
    public PageController(PageService pageService, WikiMarkupService wikiMarkupService, PageRevisionService pageRevisionService) {
        this.pageService = pageService;
        this.wikiMarkupService = wikiMarkupService;
        this.pageRevisionService = pageRevisionService;
    }

    @GetMapping("")
    public ResponseEntity<ApiResponse<List<Page>>> getAllPages() {
        return pageService.getAllPages();
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<String>>> suggestPageTitle(@RequestParam String query) {
        return pageService.suggestPageTitle(query);
    }

    /*
    @GetMapping("/{pageId}")
    public ResponseEntity<ApiResponse<String>> getPageContent(@PathVariable Long pageId) {
        PageRevision revision = pageRevisionService.getLatestRevision(pageId);
        if (revision == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Unable to find the page with id: " + pageId);
        }
        String htmlContent = wikiMarkupService.renderToHtml(revision.getContent());
        return ApiResponse.success(HttpStatus.OK, htmlContent);
    }
    */
    @GetMapping("/raw/{pageTitle}")
    public ResponseEntity<ApiResponse<PageDTO>> getRawWikitextContentByTitle(@PathVariable String pageTitle) {
        // Find the page with the given title
        ResponseEntity<ApiResponse<Page>> pageResponse = pageService.getPageByTitle(pageTitle);
        if (pageResponse.getBody().getStatus() != HttpStatus.OK.value()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, pageResponse.getBody().getErrorMessage());
        }
        Page page = pageResponse.getBody().getData();

        if (page == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Page with title: " + pageTitle + " does not exist");
        }

        // Get the latest revision
        PageRevision revision = pageRevisionService.getLatestRevision(page.getPageId());
        if (revision == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Unable to find the latest revision for page with title: " + pageTitle);
        }

        // Map to PageDTO with the latest revision
        PageDTO pageDTO = new PageDTO();
        pageDTO.setPageId(page.getPageId());
        pageDTO.setTitle(page.getTitle());
        pageDTO.setCreatedAt(page.getCreatedAt());
        pageDTO.setUpdatedAt(page.getUpdatedAt());

        PageRevisionDTO revisionDTO = new PageRevisionDTO(
                revision.getRevisionId(),
                revision.getPage().getPageId(),
                revision.getUser().getUserId(),
                revision.getContent(),
                revision.getSummary(),
                revision.getCreatedAt()
        );
        pageDTO.setPageRevisionDTO(revisionDTO);

        return ApiResponse.success(HttpStatus.OK, pageDTO);
    }

    @GetMapping("/{pageTitle}")
    public ResponseEntity<ApiResponse<PageDTO>> getPageContentByTitle(@PathVariable String pageTitle) {
        // Find the page with the given title
        ResponseEntity<ApiResponse<Page>> pageResponse = pageService.getPageByTitle(pageTitle);
        if (pageResponse.getBody().getStatus() != HttpStatus.OK.value()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, pageResponse.getBody().getErrorMessage());
        }
        Page page = pageResponse.getBody().getData();

        if (page == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Page with title: " + pageTitle + " does not exist");
        }

        // Get the latest revision
        PageRevision revision = pageRevisionService.getLatestRevision(page.getPageId());
        if (revision == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Unable to find the latest revision for page with title: " + pageTitle);
        }
        // We return the page revision content as rendered html instead of wikitext
        String htmlContent = wikiMarkupService.renderToHtml(revision.getContent());
        //logger.info("Final HTML sent to frontend: {}", htmlContent);

        // Map to PageDTO with the latest revision
        PageDTO pageDTO = new PageDTO();
        pageDTO.setPageId(page.getPageId());
        pageDTO.setTitle(page.getTitle());
        pageDTO.setCreatedAt(page.getCreatedAt());
        pageDTO.setUpdatedAt(page.getUpdatedAt());

        PageRevisionDTO revisionDTO = new PageRevisionDTO(
                revision.getRevisionId(),
                revision.getPage().getPageId(),
                revision.getUser().getUserId(),
                htmlContent,
                revision.getSummary(),
                revision.getCreatedAt()
        );
        pageDTO.setPageRevisionDTO(revisionDTO);
        return ApiResponse.success(HttpStatus.OK, pageDTO);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Page>> createPage(@Valid @RequestBody PageDTO pageDTO) {
        return pageService.createPage(pageDTO);
    }

    @PutMapping("{pageTitle}")
    public ResponseEntity<ApiResponse<Page>> updatePage(@PathVariable String pageTitle, @RequestBody PageDTO pageDTO) {
        return pageService.updatePage(pageTitle, pageDTO);
    }

    @DeleteMapping("{id}")
    public ResponseEntity<ApiResponse<Void>> deletePage(@PathVariable Long id) {
        return pageService.deletePage(id);
    }
}
