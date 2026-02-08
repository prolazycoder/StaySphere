package com.example.demo.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import javax.naming.AuthenticationException;
import java.time.Instant;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

        /*
         * =========================
         * 1️⃣ Bad Request – Custom
         * =========================
         */
        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ErrorResponse> handleBadRequest(
                        BadRequestException ex,
                        HttpServletRequest request) {
                log.warn("Bad Request: {}", ex.getMessage());

                return buildResponse(
                                HttpStatus.BAD_REQUEST,
                                ex.getMessage(),
                                request.getRequestURI());
        }

        /*
         * =========================
         * 2️⃣ Validation Errors
         * =========================
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidationErrors(
                        MethodArgumentNotValidException ex,
                        WebRequest request) {
                String errors = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                                .collect(Collectors.joining("; "));

                log.warn("Validation Error: {}", errors);

                return buildResponse(
                                HttpStatus.BAD_REQUEST,
                                "Validation failed: " + errors,
                                request.getDescription(false).replace("uri=", ""));
        }

        /*
         * =========================
         * 3️⃣ Resource Not Found
         * =========================
         */
        @ExceptionHandler(EntityNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleNotFound(
                        EntityNotFoundException ex,
                        WebRequest request) {
                log.warn("Resource Not Found: {}", ex.getMessage());

                return buildResponse(
                                HttpStatus.NOT_FOUND,
                                ex.getMessage(),
                                request.getDescription(false).replace("uri=", ""));
        }

        /*
         * =========================
         * 4️⃣ Optimistic Locking
         * =========================
         */
        @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
        public ResponseEntity<ErrorResponse> handleOptimisticLocking(
                        ObjectOptimisticLockingFailureException ex,
                        WebRequest request) {
                log.error("Concurrency conflict", ex);

                return buildResponse(
                                HttpStatus.CONFLICT,
                                "Data was modified by another request. Please retry.",
                                request.getDescription(false).replace("uri=", ""));
        }

        /*
         * =========================
         * 5️⃣ DB Constraint Errors
         * =========================
         */
        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
                        DataIntegrityViolationException ex,
                        WebRequest request) {
                String message = "Data integrity violation";

                if (ex.getCause() instanceof ConstraintViolationException cve) {
                        message = "Unique constraint violated: " + cve.getConstraintName();
                }

                log.error("Database Error: {}", ex.getMessage());

                return buildResponse(
                                HttpStatus.CONFLICT,
                                message,
                                request.getDescription(false).replace("uri=", ""));
        }

        /*
         * =========================
         * 6️⃣ Authentication Errors
         * =========================
         */
        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<ErrorResponse> handleAuthenticationError(
                        AuthenticationException ex,
                        WebRequest request) {
                log.error("Authentication Error: {}", ex.getMessage());

                return buildResponse(
                                HttpStatus.UNAUTHORIZED,
                                ex.getMessage(),
                                request.getDescription(false).replace("uri=", ""));
        }

        /*
         * =========================
         * 8️⃣ Driver Not Found Error
         * =========================
         */
        @ExceptionHandler(DriverNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleDriverNotFound(
                        DriverNotFoundException ex,
                        WebRequest request) {
                log.warn("Driver Not Found: {}", ex.getMessage());

                return buildResponse(
                                HttpStatus.NOT_FOUND,
                                ex.getMessage(),
                                request.getDescription(false).replace("uri=", ""));
        }

        /*
         * =========================
         * 7️⃣ External Service Error
         * =========================
         */
        @ExceptionHandler(ExternalAuthServiceException.class)
        public ResponseEntity<ErrorResponse> handleExternalService(
                        ExternalAuthServiceException ex,
                        WebRequest request) {
                log.error("External Service Failure", ex);

                return buildResponse(
                                HttpStatus.BAD_GATEWAY,
                                "External authentication service unavailable",
                                request.getDescription(false).replace("uri=", ""));
        }

        /*
         * =========================
         * 8️⃣ Global Fallback (500)
         * =========================
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleAllExceptions(
                        Exception ex,
                        WebRequest request) {
                log.error("Unhandled Exception", ex);

                return buildResponse(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "An unexpected error occurred. Please try again later.",
                                request.getDescription(false).replace("uri=", ""));
        }

        /*
         * =========================
         * 🔧 Helper Method
         * =========================
         */
        private ResponseEntity<ErrorResponse> buildResponse(
                        HttpStatus status,
                        String message,
                        String path) {
                ErrorResponse response = new ErrorResponse(
                                Instant.now().toString(),
                                status.value(),
                                status.getReasonPhrase(),
                                message,
                                path);
                return new ResponseEntity<>(response, status);
        }
}
