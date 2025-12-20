package com.example.demo.service.otp;

import com.example.demo.entity.cab.Ride;
import com.example.demo.service.rediservice.RedisService;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.UUID;

@Service
public class OtpService {

    private final RedisService redisService;
    private final SecureRandom secureRandom = new SecureRandom();
    private static final int OTP_LENGTH = 6;
    private static final long OTP_EXPIRATION_MINUTES = 5;

    public OtpService(RedisService redisService) {
        this.redisService = redisService;
    }

    // Generate OTP for any purpose
    public String generateOtp(String keyPrefix, String identifier) {
        String key = buildKey(keyPrefix, identifier);
        String otp = String.format("%06d", secureRandom.nextInt(999999));
      redisService.save(key, otp, OTP_EXPIRATION_MINUTES);
        return otp;
    }

    // Validate OTP
    public boolean validateOtp(String keyPrefix, String identifier, String otp) {
        String key = buildKey(keyPrefix, identifier);
        Object storedOtp = redisService.get(key);

        if (storedOtp == null) return false;

        boolean isValid = storedOtp.toString().equals(otp);
        if (isValid) redisService.delete(key); // One-time use

        return isValid;
    }

    public String generateNumericOtp(int length) {
        SecureRandom random = new SecureRandom();
        // Calculate the range: e.g., for length 6, start is 100000, end is 999999
        int min = (int) Math.pow(10, length - 1);
        int max = (int) Math.pow(10, length) - 1;

        int otp = random.nextInt(max - min + 1) + min;

        // Pad with leading zeros if necessary (though usually unnecessary for base-10 generation)
        return String.format("%0" + length + "d", otp);
    }




    private String buildKey(String prefix, String identifier){
        return prefix + "_" + identifier;
    }
}
