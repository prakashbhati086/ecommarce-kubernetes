package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
public class PaymentApplication {
    public static void main(String[] args) {
        SpringApplication.run(PaymentApplication.class, args);
    }
}

@RestController
@CrossOrigin(origins = "*")
class PaymentController {
    
    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "payment-service");
        return response;
    }
    
    @PostMapping("/api/payments/process")
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody Map<String, Object> paymentData) {
        Map<String, Object> response = new HashMap<>();
        
        // Simulate payment processing
        String orderId = (String) paymentData.get("order_id");
        Double amount = ((Number) paymentData.get("amount")).doubleValue();
        String cardNumber = (String) paymentData.get("card_number");
        
        if (orderId == null || amount == null || cardNumber == null) {
            response.put("error", "Missing required fields");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Simulate payment logic
        boolean paymentSuccess = !cardNumber.startsWith("0000"); // Fail if card starts with 0000
        
        if (paymentSuccess) {
            response.put("status", "success");
            response.put("transaction_id", "txn_" + System.currentTimeMillis());
            response.put("message", "Payment processed successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "failed");
            response.put("message", "Payment failed");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/api/payments/{transaction_id}")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(@PathVariable String transactionId) {
        Map<String, Object> response = new HashMap<>();
        response.put("transaction_id", transactionId);
        response.put("status", "completed");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
