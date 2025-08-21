package com.phuocan.simple_wiki.controller;

import com.phuocan.simple_wiki.apiResponse.ApiResponse;
import com.phuocan.simple_wiki.dto.PageRevisionDTO;
import com.phuocan.simple_wiki.model.PageRevision;
import com.phuocan.simple_wiki.service.PageRevisionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("page-revisions")
public class PageRevisionController {
    private final PageRevisionService pageRevisionService;

    @Autowired
    public PageRevisionController(PageRevisionService pageRevisionService) {
        this.pageRevisionService = pageRevisionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PageRevisionDTO>>> getAllPageRevisions() {
        return pageRevisionService.getAllPageRevisions();
    }

    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<PageRevisionDTO>> getPageRevisionById(@PathVariable Long id) {
        return pageRevisionService.getPageRevisionById(id);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PageRevisionDTO>> createPageRevision(@Valid @RequestBody PageRevisionDTO pageRevisionDTO) {
        return pageRevisionService.createPageRevision(pageRevisionDTO);
    }

    @PutMapping("{id}")
    public ResponseEntity<ApiResponse<PageRevisionDTO>> updatePageRevision(@PathVariable Long id, @RequestBody PageRevisionDTO pageRevisionDTO) {
        return pageRevisionService.updatePageRevision(id, pageRevisionDTO);
    }

    @DeleteMapping("{id}")
    public ResponseEntity<ApiResponse<Void>> deletePageRevision(@PathVariable Long id) {
        return pageRevisionService.deletePageRevision(id);
    }
}
