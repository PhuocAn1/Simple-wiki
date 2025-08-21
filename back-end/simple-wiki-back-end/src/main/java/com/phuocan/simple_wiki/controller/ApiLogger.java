package com.phuocan.simple_wiki.controller;

import com.phuocan.simple_wiki.dto.LogDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/log")
public class ApiLogger {
    private static final Logger logger = LoggerFactory.getLogger(ApiLogger.class);

    @PostMapping()
    public void apiLogger(@RequestBody LogDTO logDTO) {
        logger.info("Received log - Message: {}, Timestamp: {}",
                logDTO.getMessage(),
                logDTO.getTimeStamp());
    }
}
