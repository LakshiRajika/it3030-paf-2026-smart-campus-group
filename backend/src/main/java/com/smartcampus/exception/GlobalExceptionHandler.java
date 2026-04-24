package com.smartcampus.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── Validation errors (@Valid) ────────────────────────────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field   = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            fieldErrors.put(field, message);
        });

        return ResponseEntity.badRequest().body(Map.of(
            "timestamp", LocalDateTime.now().toString(),
            "status",    400,
            "error",     "Validation Failed",
            "errors",    fieldErrors
        ));
    }

    // ── Resource not found (404) ─────────────────────────────────────────────────
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex, WebRequest request) {
        Map<String, Object> details = new HashMap<>();
        details.put("timestamp", new Date());
        details.put("message", ex.getMessage());
        if (request != null) {
            details.put("details", request.getDescription(false));
        }
        return new ResponseEntity<>(details, HttpStatus.NOT_FOUND);
    }

    // ── Conflict / scheduling overlap (409) ──────────────────────────────────────
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorBody(409, ex.getMessage()));
    }

    // ── Unauthorized (403) ───────────────────────────────────────────────────────
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorBody(403, ex.getMessage()));
    }

    // ── Authentication Failure (401) ─────────────────────────────────────────────
    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(org.springframework.security.core.AuthenticationException ex) {
        String msg = ex.getMessage();
        if (msg == null || msg.isEmpty() || msg.contains("Bad credentials")) {
            msg = "Invalid email or password";
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorBody(401, msg));
    }

    // ── Business rule / validation logic (400) ───────────────────────────────────
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessValidation(ValidationException ex) {
        return ResponseEntity.badRequest().body(errorBody(400, ex.getMessage()));
    }

    // ── Catch-all (500) ──────────────────────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> globalExceptionHandler(Exception ex, WebRequest request) {
        Map<String, Object> details = new HashMap<>();
        details.put("timestamp", new Date());
        details.put("message", "An unexpected error occurred");
        details.put("error", ex.getClass().getSimpleName());
        if (request != null) {
            details.put("details", request.getDescription(false));
        }
        ex.printStackTrace();
        return new ResponseEntity<>(details, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ── Helper ───────────────────────────────────────────────────────────────────
    private Map<String, Object> errorBody(int status, String message) {
        return Map.of(
            "timestamp", LocalDateTime.now().toString(),
            "status",    status,
            "message",   message
        );
    }
}
