package com.example.demo.config;

import com.example.demo.security.JwtAuthenticationFilter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
        log.info("SecurityConfig initialized with JwtAuthenticationFilter");
    }

    @Bean
    public SecurityFilterChain securityWebFilterChain(HttpSecurity http) throws Exception {
        log.info("Configuring SecurityFilterChain...");

        http.csrf(csrf -> csrf.disable())
                .sessionManagement(session -> {
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
                    log.info("Session management set to STATELESS");
                })
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(
                            "/auth/**",
                            "/public/**",
                            "/swagger-ui/**",
                            "/v3/api-docs/**",
                            "/oauth2/**", "/auth/phone/**",
                            "/auth/otp/**",
                            "/oauth2callback",
                            "/test",
                            "/api/v1/hotels/search"

                ).permitAll()
                            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                            .requestMatchers("/admin/**").hasAuthority("SYS_ADMIN")

                            .requestMatchers("/hotel-admin/**").hasAuthority("HOTEL_ADMIN");

                    log.info("Permitting all requests to public endpoints and /logout");
                    auth.anyRequest().authenticated();

                    log.info("All other requests will require authentication");
                })
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        log.info("JwtAuthenticationFilter added before UsernamePasswordAuthenticationFilter");

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        log.info("Creating BCryptPasswordEncoder bean");
        return new BCryptPasswordEncoder();
    }
}
