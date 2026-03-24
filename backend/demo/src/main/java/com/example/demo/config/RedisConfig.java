package com.example.demo.config;
import io.lettuce.core.api.StatefulConnection;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
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

import java.time.Duration;

@Configuration
public class RedisConfig {
    @org.springframework.beans.factory.annotation.Value("${REDIS_URL:rediss://default:gQAAAAAAAUYLAAIncDFmMzE2ZjU0MTUxMGM0YTczOGU2YTdjZDk1ZGUxOWYzOXAxODM0Njc@top-condor-83467.upstash.io:6379}")
    private String redisUrlStr;

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        java.net.URI uri = java.net.URI.create(redisUrlStr);
        String host = uri.getHost();
        int port = uri.getPort() == -1 ? 6379 : uri.getPort();
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration(host, port);
        
        if (uri.getUserInfo() != null && uri.getUserInfo().contains(":")) {
            redisConfig.setPassword(uri.getUserInfo().split(":", 2)[1]);
        }
        
        GenericObjectPoolConfig<StatefulConnection<?, ?>> poolConfig = new GenericObjectPoolConfig<>();
        poolConfig.setMaxTotal(8);
        poolConfig.setMaxIdle(8);
        poolConfig.setMinIdle(0);
        poolConfig.setMaxWait(Duration.ofMillis(100));

        LettucePoolingClientConfiguration.LettucePoolingClientConfigurationBuilder builder = 
                LettucePoolingClientConfiguration.builder()
                .poolConfig(poolConfig)
                .commandTimeout(Duration.ofSeconds(5));
                
        if (uri.getScheme() != null && uri.getScheme().equalsIgnoreCase("rediss")) {
            builder.useSsl();
        }

        LettuceClientConfiguration clientConfig = builder.build();

        return new LettuceConnectionFactory(redisConfig, clientConfig);

    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
      RedisTemplate<String,Object> redisTemplate = new RedisTemplate<>();
      redisTemplate.setConnectionFactory(factory);
      redisTemplate.setKeySerializer(new StringRedisSerializer());
      redisTemplate.setValueSerializer(new GenericJackson2JsonRedisSerializer());
      return redisTemplate;
 }
}
