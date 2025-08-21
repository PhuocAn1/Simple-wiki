package com.phuocan.simple_wiki.controller;

import com.phuocan.simple_wiki.apiResponse.ApiResponse;
import com.phuocan.simple_wiki.dto.WikiTextDTO;
import com.phuocan.simple_wiki.service.WikiMarkupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/wiki-markup")
public class WikiMarkupController {
    private final WikiMarkupService wikiMarkupService;

    @Autowired
    public WikiMarkupController(WikiMarkupService wikiMarkupService) {
        this.wikiMarkupService = wikiMarkupService;
    }

    @PostMapping("/render")
    public ResponseEntity<ApiResponse<String>> renderWikiText(@RequestBody WikiTextDTO wikiTextDTO) {
        String htmlContent = wikiMarkupService.renderToHtml(wikiTextDTO.getWikiText());

        return ApiResponse.success(HttpStatus.OK, htmlContent);
    }
}
