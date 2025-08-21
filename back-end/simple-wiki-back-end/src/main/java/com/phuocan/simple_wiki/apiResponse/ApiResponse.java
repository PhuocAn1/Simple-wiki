package com.phuocan.simple_wiki.apiResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;

public class ApiResponse<T> {
    private int status;
    private String errorMessage;
    private T data;
    private LocalDateTime timestamp;

    // Constructor for successful response
    public ApiResponse(HttpStatus status, T data) {
        this.status = status.value();
        this.errorMessage = null;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    // Constructor for error response
    public ApiResponse(HttpStatus status, String errorMessage) {
        this.status = status.value();
        this.errorMessage = errorMessage;
        this.data = null;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and setters
    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    // Static methods to build responses
    public static <T> ResponseEntity<ApiResponse<T>> success(HttpStatus status, T data) {
        return new ResponseEntity<>(new ApiResponse<>(status, data), status);
    }

    public static <T> ResponseEntity<ApiResponse<T>> error(HttpStatus status, String errorMessage) {
        return new ResponseEntity<>(new ApiResponse<>(status, errorMessage), status);
    }
}