package com.example.demo.service.emailservice;

import com.example.demo.dto.UserAdditionalInfoDTO;
import com.example.demo.entity.users.User;
import com.example.demo.entity.users.UserLogin;
import com.example.demo.enums.users.UserRole;
import com.example.demo.repository.hotel.HotelOwnerRepository;
import com.example.demo.repository.user.UserLoginRepository;
import com.example.demo.repository.user.UserRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.otp.OtpService;
import com.example.demo.service.rediservice.RedisService;
import io.jsonwebtoken.Claims;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final OtpService otpService;
    private final RedisService redisService;
    private final JwtUtil   jwtUtil;
    private final UserRepository userRepository;
    private final UserLoginRepository userLoginRepository;
    private final HotelOwnerRepository hotelRepository;

    private static final long OTP_COOLDOWN_MINUTES = 1; // 1 minute cooldown
    private static final String OTP_COOLDOWN_PREFIX = "EMAIL_COOLDOWN";

    public EmailService(JavaMailSender mailSender, OtpService otpService,
                        RedisService redisService,JwtUtil jwtUtil,UserRepository userRepository,
                        UserLoginRepository userLoginRepository,HotelOwnerRepository hotelRepository) {
        this.mailSender = mailSender;
        this.otpService = otpService;
        this.redisService = redisService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.userLoginRepository = userLoginRepository;
        this.hotelRepository = hotelRepository;

    }


    public String sendOtp(String email) {
        String cooldownKey = OTP_COOLDOWN_PREFIX + "_" + email;

        // Check if cooldown exists
        if (redisService.exist(cooldownKey)) {
            throw new RuntimeException("OTP already sent. Please wait a minute before requesting again.");
        }

        // Generate OTP
        String otp = otpService.generateOtp("EMAIL", email);

        // Send OTP via email
        sendEmail(email, otp);

        // Set cooldown in Redis
        redisService.save(cooldownKey, "WAIT", OTP_COOLDOWN_MINUTES);

        return otp;
    }


    public  void sendEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Your OTP Code");
        message.setText("Your OTP is: " + otp + "\nIt will expire in 5 minutes.");
        mailSender.send(message);
    }


    public boolean validateOtp(String email, String otp) {
        return otpService.validateOtp("EMAIL", email, otp);
    }

    public Map<String, Object> sendOtpResponse(String email) {
        Map<String, Object> response = new HashMap<>();
        try {
            sendOtp(email);
            response.put("success", true);
            response.put("message", "OTP sent successfully");
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return response;
    }

    public Map<String,Object> registerUser(String email) {

        String name = (email.split("@")[0]);

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            //log.info("Creating new user for email: {}", email);
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(name);
            //newUser.setAuthProvider(AuthProvider.GOOGLE);
            newUser.setRole(UserRole.USER);
            newUser.setIsActive(true);

            newUser.setCountry(null);
            newUser.setCity(null);
            newUser.setGender(null);
            newUser.setDob(null);
            newUser.setPhoneNumber(null);

            return userRepository.save(newUser);
        });

        User savedUser = userRepository.save(user);

        //log.info("Generating JWT token for user: {}", user.getEmail());
        String jwtToken = jwtUtil.generateToken(
                email,
                user.getAuthProvider(),
                user.getFullName(),
                user.getCountry(),
                user.getCity(),
                user.getGender(),
                user.getRole(),
                user.getId()

        );
        redisService.save(jwtToken, String.valueOf(user.getId()), jwtUtil.getTokenValidity());
        String refreshToken =jwtUtil.generateRefreshToken(email,user.getId(),user.getRole());

        UserLogin userLogin = userLoginRepository.findByUserId(user.getId())
                .orElse(new UserLogin());
        userLogin.setUser(user);
        userLogin.setJwtToken(jwtToken);
        userLogin.setRefreshToken(refreshToken);
        userLogin.setRefreshTokenExpiry(
                LocalDateTime.now().plusNanos(jwtUtil.getTokenValidity() * 1_000_000)
        );

        userLoginRepository.save(userLogin);

       // log.info("User login saved for user: {}", user.getEmail());

        Map<String, Object> result = new HashMap<>();
        result.put("jwtToken", jwtToken);
        result.put("refreshToken", refreshToken);
        result.put("email", user.getEmail());
        result.put("fullName", user.getFullName());
        result.put("role", user.getRole().name());
        result.put("flag",user.getFlag());

        //log.info("Returning result map: {}", result);
        return result;

    }

    public boolean logoutUser(String accessToken) {
        return userLoginRepository.findByJwtToken(accessToken)
                .map(userLogin -> {
                    userLoginRepository.delete(userLogin); // Delete the row
                    return true;
                })
                .orElse(false);
    }

    public boolean updateExtraInfo(String email, UserAdditionalInfoDTO dto) {
        try {
            Optional<User> optionalUser = userRepository.findByEmail(email);
            if (optionalUser.isEmpty()) {
                return false; // User not found
            }

            User user = optionalUser.get(); // Get actual User object

            // Update fields from DTO
            if (dto.getFullName() != null) user.setFullName(dto.getFullName());
            if (dto.getCountry() != null) user.setCountry(dto.getCountry());
            if (dto.getCity() != null) user.setCity(dto.getCity());
            if (dto.getPhoneNumber() != null) user.setPhoneNumber(dto.getPhoneNumber());
            if (dto.getGender() != null) user.setGender(dto.getGender());
            if (dto.getDob() != null) user.setDob(dto.getDob());
            if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().equals(user.getPhoneNumber())) {

                // Check if another user has same phone number
                boolean exists = userRepository.existsByPhoneNumber(dto.getPhoneNumber());
                if (exists) {
                    throw new IllegalArgumentException("Phone number already exists");
                }

                user.setPhoneNumber(dto.getPhoneNumber());
            }
            user.setFlag(Boolean.TRUE);

            userRepository.save(user); // Save the User entity
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    public String validateTokenAndGetEmail(String authHeader) {
        try {

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return null;
            }
            String token = authHeader.substring(7);

            if (!jwtUtil.isTokenValid(token)) {
                return null;
            }
            Optional<UserLogin> userLoginOpt = userLoginRepository.findByJwtToken(token);
            if (userLoginOpt.isEmpty()) {
                return null;
            }

            Claims email = jwtUtil.extractAllClaims(token);
            return email.get("sub",String.class);

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


}
