package com.example.demo.config;

import com.example.demo.security.JwtAuthenticationFilter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import jakarta.servlet.http.HttpServletResponse;
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

    @org.springframework.beans.factory.annotation.Value("${FRONTEND_URL:https://stay-sphere-two.vercel.app}")
    private String frontendUrl;

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

                .cors(cors -> cors.configurationSource(request -> {
                    var config = new org.springframework.web.cors.CorsConfiguration();
                    config.setAllowedOrigins(java.util.List.of(frontendUrl));
                    config.setAllowedMethods(java.util.List.of("GET","POST","PUT","DELETE","OPTIONS"));
                    config.setAllowedHeaders(java.util.List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Unauthorized\"}");
                        })
                )

                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(
                            "/auth/**","/auth/refresh",
                            "/public/**",
                            "/swagger-ui/**",
                            "/v3/api-docs/**",
                            "/oauth2/**","/auth/phone/**",
                            "/auth/otp/**",
                            "/oauth2callback",
                            "/test","/ws-driver/**"

                    ).permitAll()

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
