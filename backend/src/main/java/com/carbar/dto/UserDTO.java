package com.carbar.dto;

import com.carbar.enums.Role;
import com.carbar.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String realName;
    private String phone;
    private String email;
    private Role role;
    private UserStatus status;
    private LocalDateTime createdAt;
}
