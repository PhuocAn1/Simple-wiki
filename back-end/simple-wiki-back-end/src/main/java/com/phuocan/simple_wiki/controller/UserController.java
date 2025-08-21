package com.phuocan.simple_wiki.controller;

import com.phuocan.simple_wiki.apiResponse.ApiResponse;
import com.phuocan.simple_wiki.dto.UserDTO;
import com.phuocan.simple_wiki.model.User;
import com.phuocan.simple_wiki.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("users")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<String>>> suggestUsernames(@RequestParam String query) {
        return userService.suggestUsernames(query);
    }

    @GetMapping("")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> createUser(@Valid @RequestBody UserDTO userDTO) {
        return userService.createUser(userDTO);
    }

    @PutMapping("{username}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable String username, @RequestBody UserDTO userDTO) {
        return userService.updateUser(username, userDTO);
    }

    @DeleteMapping("{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        return userService.deleteUser(id);
    }
}
