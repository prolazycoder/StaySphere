package com.example.demo.service.rediservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RedisService {
    @Autowired
    private RedisTemplate<String,Object> redisTemplate;

    public void  save(String key , Object object,long time){
        if(time > 0){
            redisTemplate.opsForValue().set(key,object,time, TimeUnit.SECONDS);
        }else{
            redisTemplate.opsForValue().set(key,object);
        }
    }

    public Object get(String key){
        return redisTemplate.opsForValue().get(key);
    }
    public void delete(String key){
        redisTemplate.delete(key);
    }

    public boolean exist(String key){
        return redisTemplate.hasKey(key);
    }

}
