package com.example.demo.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
        log.info("JwtAuthenticationFilter initialized");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String refreshHeader = request.getHeader("Refresh-Token");
        log.info("Incoming request: {} {}", request.getMethod(), request.getRequestURI());
        log.info("Authorization header: {}", authHeader);
        log.info("Refresh-Token header: {}", refreshHeader);

        String accessToken = (authHeader != null && authHeader.startsWith("Bearer "))
                ? authHeader.substring(7)
                : null;

        if (accessToken == null && refreshHeader == null) {
            log.info("No access token or refresh token found, proceeding to public endpoints if any");
            filterChain.doFilter(request, response);
            return;
        }

        if (accessToken != null) {
            log.info("Access token found: {}", accessToken);
            if (jwtUtil.isAccessTokenValidFromRedis(accessToken)) {
                log.info("Access token is valid from DB");
                Claims claims = jwtUtil.extractAllClaims(accessToken);
                String email = claims.get("sub", String.class);

                String role = claims.get("role", String.class);
                log.info("Authenticated user: {}, role: {}", email, role);

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email, null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                filterChain.doFilter(request, response);
                return;
            } else {
                log.warn("Access token is invalid or expired: {}", accessToken);
            }
        }

        if (refreshHeader != null) {
            log.info("Trying refresh token: {}", refreshHeader);
            if (jwtUtil.isRefreshTokenValidFromDB(refreshHeader)) {
                log.info("Refresh token is valid");
                Claims refreshClaims = jwtUtil.extractAllClaims(refreshHeader);
                String email = refreshClaims.getSubject();
                String role = refreshClaims.get("role", String.class);

                String newAccessToken = jwtUtil.createNewAccessToken(email, role);
                log.info("Generated new access token: {}", newAccessToken);
                response.setHeader("New-Access-Token", newAccessToken);

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email, null,
                        Collections.singletonList(new SimpleGrantedAuthority(role)));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                filterChain.doFilter(request, response);
                return;
            } else {
                log.warn("Refresh token is invalid or expired: {}", refreshHeader);
            }
        }

        log.error("Both access and refresh tokens are invalid, sending 401 Unauthorized");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("Unauthorized or token expired");
    }

}
