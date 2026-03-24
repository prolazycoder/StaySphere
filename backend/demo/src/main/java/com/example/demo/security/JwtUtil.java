package com.example.demo.security;

import com.example.demo.enums.AuthProvider;
import com.example.demo.enums.users.Gender;
import com.example.demo.enums.users.UserRole;
import com.example.demo.repository.user.UserLoginRepository;
import com.example.demo.service.rediservice.RedisService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    @Value("${jwt.expiration}")
    private long TOKEN_VALIDITY;

    @Value("${jwt.refreshExpiration}")
    private long REFRESH_TOKEN_VALIDITY;

    RedisService redisService;
    UserLoginRepository userLoginRepository;

    JwtUtil(UserLoginRepository userLoginRepository, RedisService redisService) {
        this.userLoginRepository = userLoginRepository;
        this.redisService = redisService;
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    //  Access Token
    public String generateToken(
            String emailOrPhone,
            AuthProvider authProvider,
            String fullName,
            String country,
            String city,
            Gender gender,
            UserRole role,
            UUID id
    ) {
        Map<String, Object> claims = new HashMap<>();

        claims.put("name", fullName);
        claims.put("sub", emailOrPhone);
        claims.put("country", country);
        claims.put("city", city);
        claims.put("gender", gender != null ? gender.name() : null);
        claims.put("role", role);
        claims.put("userID", id);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + TOKEN_VALIDITY))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    //  Refresh Token
    public String generateRefreshToken(String emailOrPhone, UUID id, UserRole role) {

        Map<String, Object> claims = new HashMap<>();

        claims.put("sub", emailOrPhone);
        claims.put("userID", id);
        claims.put("role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_VALIDITY))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractAllClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenValid(String token) {

        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isAccessTokenValidFromRedis(String token) {
        return isTokenValid(token) && redisService.get(token) != null;
    }

    public boolean isRefreshTokenValidFromDB(String token) {
        return isTokenValid(token) && userLoginRepository.findByRefreshToken(token).isPresent();
    }

    public String createNewAccessToken(String refreshToken, String role) {

        Claims claims = extractAllClaims(refreshToken);

        String email = claims.getSubject();
        String userId = claims.get("userID").toString();

        return Jwts.builder()
                .claim("sub", email)
                .claim("role", role)
                .claim("userID", userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + TOKEN_VALIDITY))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public long getTokenValidity() {
        return TOKEN_VALIDITY;
    }

    public UUID extractUserId(String token) {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        Claims claims = extractAllClaims(token);
        return UUID.fromString(claims.get("userID").toString());
    }
}