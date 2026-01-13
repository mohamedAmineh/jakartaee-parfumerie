package com.parfumerie.messaging;

import com.parfumerie.domain.Order;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Event Message (EIP): immutable payload describing that an order has been created.
 */
public class OrderCreatedEvent implements Serializable {

    private final Long orderId;
    private final String customerEmail;
    private final BigDecimal total;
    private final String status;
    private final LocalDateTime createdAt;

    public OrderCreatedEvent(Long orderId, String customerEmail, BigDecimal total, String status, LocalDateTime createdAt) {
        this.orderId = orderId;
        this.customerEmail = customerEmail;
        this.total = total;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static OrderCreatedEvent from(Order order) {
        if (order == null) return null;
        String email = order.getUser() != null ? order.getUser().getEmail() : null;
        LocalDateTime ts = order.getOrderDate() != null ? order.getOrderDate() : LocalDateTime.now();
        return new OrderCreatedEvent(order.getId(), email, order.getTotalPrice(), order.getStatus(), ts);
    }

    public Long getOrderId() {
        return orderId;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
