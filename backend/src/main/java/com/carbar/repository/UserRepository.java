package com.carbar.repository;

import com.carbar.entity.User;
import com.carbar.enums.Role;
import com.carbar.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByPhone(String phone);
    
    List<User> findByRole(Role role);
    
    List<User> findByRoleAndStatus(Role role, UserStatus status);
    
    boolean existsByUsername(String username);
    
    boolean existsByPhone(String phone);
}
