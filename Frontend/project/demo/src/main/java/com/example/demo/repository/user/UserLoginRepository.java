package com.example.demo.repository.user;

import com.example.demo.entity.users.User;
import com.example.demo.entity.users.UserLogin;
import org.springframework.data.jpa.repository.JpaRepository;

//import java.lang.ScopedValue;
import java.util.Optional;
import java.util.UUID;

public interface UserLoginRepository extends JpaRepository<UserLogin, UUID> {
   // Optional<UserLogin> findByEmail(String email);
    Optional<UserLogin> findByJwtToken(String token);
    Optional<UserLogin> findByUserId(UUID userId);

    Optional<Object> findByRefreshToken(String token);

    Optional<UserLogin> findByUser(User user);

    void deleteByJwtToken(String jwtToken);
}
