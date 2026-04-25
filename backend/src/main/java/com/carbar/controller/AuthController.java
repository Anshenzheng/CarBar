package com.carbar.controller;

import com.carbar.dto.*;
import com.carbar.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDTO>> register(@Valid @RequestBody RegisterDTO registerDTO) {
        UserDTO user = userService.register(registerDTO);
        return ResponseEntity.ok(ApiResponse.success("注册成功", user));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(@Valid @RequestBody LoginDTO loginDTO) {
        LoginResponseDTO response = userService.login(loginDTO);
        return ResponseEntity.ok(ApiResponse.success("登录成功", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser() {
        UserDTO user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
