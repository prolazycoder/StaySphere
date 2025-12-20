package com.example.demo.repository.user;

import com.example.demo.entity.users.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository
        extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User>
 {
    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneNumber(String phone);

    @Override
    Optional<User> findById(UUID uuid);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

}
