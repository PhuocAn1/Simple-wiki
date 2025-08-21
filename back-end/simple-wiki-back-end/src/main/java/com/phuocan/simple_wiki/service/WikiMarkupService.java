package com.phuocan.simple_wiki.service;

import com.phuocan.simple_wiki.model.CustomWikiModel;
import com.phuocan.simple_wiki.model.Multimedia;
import com.phuocan.simple_wiki.repository.MultimediaRepository;
import com.phuocan.simple_wiki.repository.PageRepository;
import info.bliki.wiki.model.WikiModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class WikiMarkupService {
    private final PageRepository pageRepository;
    private final MultimediaRepository multimediaRepository;
    private static final Logger logger = LoggerFactory.getLogger(WikiMarkupService.class);
    @Autowired
    public WikiMarkupService(PageRepository pageRepository, MultimediaRepository multimediaRepository) {
        this.pageRepository = pageRepository;
        this.multimediaRepository = multimediaRepository;
    }

    public String renderToHtml(String markup) {
        try {
            //logger.info("Markup:{}", markup);
            WikiModel wikiModel = new CustomWikiModel(pageRepository, multimediaRepository);
            //logger.info("Rendered markup:{}", wikiModel.render(markup));
            return wikiModel.render(markup);
        } catch (IOException e) {
            logger.error("Error rendering markup: {}", e.getMessage(), e);
            return "<p>Error rendering content</p>";
        }
    }
}
