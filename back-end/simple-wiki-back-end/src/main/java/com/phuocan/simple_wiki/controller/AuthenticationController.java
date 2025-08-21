package com.phuocan.simple_wiki.controller;

import com.phuocan.simple_wiki.apiResponse.ApiResponse;
import com.phuocan.simple_wiki.request.LoginRequest;
import com.phuocan.simple_wiki.request.VerifyRequest;
import com.phuocan.simple_wiki.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("login")
public class AuthenticationController {
    private final AuthenticationService authService;

    @Autowired
    public AuthenticationController(AuthenticationService authService) {
        this.authService = authService;
    }

    @PostMapping()
    public ResponseEntity<ApiResponse<String>> authenticate(@RequestBody LoginRequest loginRequest) {
        try {
            String token = authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
            return ApiResponse.success(HttpStatus.OK, token);
        } catch (BadCredentialsException e) {
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, e.getMessage());
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<String>> validateToken(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token"); // This mean in the map must contain a key token
            if (token == null || !authService.validateToken(token)) {
                return ApiResponse.error(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
            }
            // Maybe refresh token?
            String newToken = authService.generateToken(authService.findUserByToken(token));
            return ApiResponse.success(HttpStatus.OK, newToken);
        } catch (BadCredentialsException e) {
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<String>> verifyID(@Valid @RequestBody VerifyRequest request) {
        return authService.verifyID(request);
    }
}
