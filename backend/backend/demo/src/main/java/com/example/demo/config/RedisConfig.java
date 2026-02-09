package com.example.demo.config;

import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettucePoolingClientConfiguration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.net.URI;
import java.time.Duration;

@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.url}")
    private String redisUrl;

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        // Parse the Redis URL
        URI uri = URI.create(redisUrl);

        String host = uri.getHost();
        int port = uri.getPort();

        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration(host, port);

        String userInfo = uri.getUserInfo();
        if (userInfo != null) {
            String[] parts = userInfo.split(":", 2);
            if (parts.length > 0)
                redisConfig.setUsername(parts[0]);
            if (parts.length > 1)
                redisConfig.setPassword(parts[1]);
        }

        // Check for SSL (rediss:// scheme)
        boolean isSsl = "rediss".equalsIgnoreCase(uri.getScheme());

        LettuceClientConfiguration.LettuceClientConfigurationBuilder clientConfigBuilder = LettucePoolingClientConfiguration
                .builder()
                .commandTimeout(Duration.ofSeconds(5));

        if (isSsl) {
            clientConfigBuilder.useSsl();
        }

        // Setup Pooling
        GenericObjectPoolConfig poolConfig = new GenericObjectPoolConfig();
        poolConfig.setMaxTotal(8);
        poolConfig.setMaxIdle(8);
        poolConfig.setMinIdle(0);
        poolConfig.setMaxWait(Duration.ofMillis(100));

        ((LettucePoolingClientConfiguration.LettucePoolingClientConfigurationBuilder) clientConfigBuilder)
                .poolConfig(poolConfig);

        return new LettuceConnectionFactory(redisConfig, clientConfigBuilder.build());

    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {

        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(factory);
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        return redisTemplate;
    }
}
