package com.phuocan.simple_wiki;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class SimpleWikiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SimpleWikiApplication.class, args);
	}

	@GetMapping("/home")
	public String Home() {
		return "Home!";
	}
}
