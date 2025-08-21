package com.phuocan.simple_wiki.service;

import com.phuocan.simple_wiki.apiResponse.ApiResponse;
import com.phuocan.simple_wiki.dto.UserDTO;
import com.phuocan.simple_wiki.model.User;
import com.phuocan.simple_wiki.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        passwordEncoder = new BCryptPasswordEncoder(10);
    }

    public ResponseEntity<ApiResponse<List<String>>> suggestUsernames(String query) {
        try {
            if (query.isBlank()) {
                return ApiResponse.success(HttpStatus.OK, Collections.emptyList());
            }

            List<String> usernames = userRepository.searchUsernames(query).stream()
                    .map(User::getUsername)
                    .limit(10) // Only show top 10 matches
                    .collect(Collectors.toList());

            return ApiResponse.success(HttpStatus.OK, usernames);
        } catch (Exception e) {
            logger.error("Unable to get username suggestion!");
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to get username suggestion!");
        }
    }

    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        try {
            return ApiResponse.success(HttpStatus.OK, userRepository.findAll());
        } catch (Exception e) {
            logger.error("Unable to get all users: {}", e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to get all users: " + e.getMessage());
        }
    }

    public ResponseEntity<ApiResponse<User>> getUserById(Long id) {
        try {
            Optional<User> user = userRepository.findById(id);
            if (user.isPresent()) {
                return ApiResponse.success(HttpStatus.OK, user.get());
            }
            return ApiResponse.error(HttpStatus.NOT_FOUND, "User not found with id: " + id);
        } catch (Exception e) {
            logger.error("Unable to get user by id {}: {}", id, e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to get user: " + e.getMessage());
        }
    }

    public ResponseEntity<ApiResponse<User>> createUser(UserDTO userDTO) {
        try {
            if (userRepository.existsByUsername(userDTO.getUsername().trim())) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, "Username already exists");
            }

            String rawEmail = userDTO.getEmail();
            String normalizedEmail = (rawEmail != null && !rawEmail.trim().isEmpty()) ? rawEmail.trim() : null;
            // Check for duplicate only if email is provided
            if (normalizedEmail != null && userRepository.existsByEmail(normalizedEmail)) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, "Email already exists: " + normalizedEmail);
            }

            User user = new User();
            user.setUsername(userDTO.getUsername());
            user.setEmail(normalizedEmail);
            user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());

            User savedUser = userRepository.save(user);
            return ApiResponse.success(HttpStatus.CREATED, savedUser);
        } catch (Exception e) {
            logger.error("Unable to create user: {}", e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to create user: " + e.getMessage());
        }
    }

    public ResponseEntity<ApiResponse<User>> updateUser(String username, UserDTO userDTO) {
        try {
            Optional<User> optionalUser = userRepository.findByUsername(username);
            if (!optionalUser.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "User not found with username: " + username);
            }

            User user = optionalUser.get();

            // Update username if provided and not already taken
            if (userDTO.getUsername() != null && !userDTO.getUsername().isBlank()) {
                if (!user.getUsername().equals(userDTO.getUsername()) &&
                        userRepository.existsByUsername(userDTO.getUsername())) {
                    return ApiResponse.error(HttpStatus.BAD_REQUEST, "Username already exists");
                }
                user.setUsername(userDTO.getUsername());
            }

            // Update email if provided and not already taken
            if (userDTO.getEmail() != null) {
                String trimmedEmail = userDTO.getEmail().trim();

                if (trimmedEmail.isEmpty()) {
                    // User wants to clear their email
                    user.setEmail(null);
                } else {
                    if (!Objects.equals(user.getEmail(), trimmedEmail) &&
                            userRepository.existsByEmail(trimmedEmail)) {
                        return ApiResponse.error(HttpStatus.BAD_REQUEST, "Email already exists");
                    }
                    user.setEmail(trimmedEmail);
                }
            }


            // Update password if provided
            if (userDTO.getPassword() != null && !userDTO.getPassword().isBlank()) {
                user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));
            }

            user.setUpdatedAt(LocalDateTime.now());

            User updatedUser = userRepository.save(user);
            return ApiResponse.success(HttpStatus.OK, updatedUser);
        } catch (Exception e) {
            logger.error("Unable to update user {}: {}", username, e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to update user: " + e.getMessage());
        }
    }

    public ResponseEntity<ApiResponse<Void>> deleteUser(Long id) {
        try {
            Optional<User> optionalUser = userRepository.findById(id);
            if (!optionalUser.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "User not found with id: " + id);
            }

            userRepository.deleteById(id);
            return ApiResponse.success(HttpStatus.NO_CONTENT, null);
        } catch (Exception e) {
            logger.error("Unable to delete user {}: {}", id, e.getMessage(), e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to delete user: " + e.getMessage());
        }
    }
}
