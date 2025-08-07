package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@SpringBootApplication
public class PaymentApplication {
    public static void main(String[] args) {
        SpringApplication.run(PaymentApplication.class, args);
    }
}

@RestController
@CrossOrigin(origins = "*")
class PaymentController {
    
    // In-memory storage for demo purposes
    private final Map<String, Map<String, Object>> transactions = new ConcurrentHashMap<>();
    
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
        
        try {
            // Extract payment details
            String orderId = String.valueOf(paymentData.get("order_id"));
            Double amount = Double.parseDouble(String.valueOf(paymentData.get("amount")));
            String cardNumber = String.valueOf(paymentData.get("card_number"));
            
            if (orderId == null || amount == null || cardNumber == null) {
                response.put("error", "Missing required fields");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Simulate payment processing
            boolean paymentSuccess = !cardNumber.startsWith("0000"); // Fail if card starts with 0000
            String transactionId = "txn_" + System.currentTimeMillis();
            
            // Store transaction
            Map<String, Object> transaction = new HashMap<>();
            transaction.put("transaction_id", transactionId);
            transaction.put("order_id", orderId);
            transaction.put("amount", amount);
            transaction.put("status", paymentSuccess ? "success" : "failed");
            transaction.put("timestamp", System.currentTimeMillis());
            
            transactions.put(transactionId, transaction);
            
            if (paymentSuccess) {
                response.put("status", "success");
                response.put("transaction_id", transactionId);
                response.put("message", "Payment processed successfully");
                response.put("amount", amount);
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "failed");
                response.put("message", "Payment failed - Invalid card");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            response.put("error", "Payment processing error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/api/payments/{transaction_id}")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(@PathVariable String transactionId) {
        Map<String, Object> transaction = transactions.get(transactionId);
        
        if (transaction != null) {
            return ResponseEntity.ok(transaction);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Transaction not found");
            return ResponseEntity.notFound().build();
        }
    }
}
