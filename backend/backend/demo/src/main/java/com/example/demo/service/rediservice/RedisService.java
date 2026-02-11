package com.example.demo.service.rediservice;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisService {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void save(String key, Object value, long minutes) {
        try {
            if (minutes <= 0) minutes = 600000; // safe default

            String json = objectMapper.writeValueAsString(value);

            redisTemplate.opsForValue()
                    .set(key, json, minutes, TimeUnit.MILLISECONDS);

        } catch (Exception e) {
            throw new RuntimeException("Redis save failed", e);
        }
    }

    public Map<String, Object> get(String key) {
        try {
            String json = redisTemplate.opsForValue().get(key);
            if (json == null) return null;

            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return null;
        }
    }

    public void delete(String key) {
        redisTemplate.delete(key);
    }
    public boolean exist(String key) {
        Boolean exists = redisTemplate.hasKey(key);
        return exists != null && exists;
    }
}
