package com.parfumerie.service;

import com.parfumerie.domain.Order;
import com.parfumerie.messaging.OrderCreatedEvent;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

@Singleton
@Startup
public class NotificationService {

    public static class OrderNotification {
        public Long orderId;
        public String customerEmail;
        public BigDecimal total;
        public String status;
        public LocalDateTime createdAt;
    }

    private final Deque<OrderNotification> events = new ArrayDeque<>();
    private static final int MAX_EVENTS = 50;

    public synchronized void addOrderCreated(Order order) {
        OrderNotification n = new OrderNotification();
        n.orderId = order.getId();
        n.customerEmail = order.getUser() != null ? order.getUser().getEmail() : null;
        n.total = order.getTotalPrice();
        n.status = order.getStatus();
        n.createdAt = order.getOrderDate() != null ? order.getOrderDate() : LocalDateTime.now();

        addNotification(n);
    }

    /**
     * Content Enricher/Event Message: consume an order-created event coming from the async pipeline.
     */
    public synchronized void addOrderCreated(OrderCreatedEvent event) {
        if (event == null) return;

        OrderNotification n = new OrderNotification();
        n.orderId = event.getOrderId();
        n.customerEmail = event.getCustomerEmail();
        n.total = event.getTotal();
        n.status = event.getStatus();
        n.createdAt = event.getCreatedAt() != null ? event.getCreatedAt() : LocalDateTime.now();

        addNotification(n);
    }

    public synchronized List<OrderNotification> getRecent() {
        return new ArrayList<>(events);
    }

    private void addNotification(OrderNotification n) {
        events.addFirst(n);
        while (events.size() > MAX_EVENTS) {
            events.removeLast();
        }
    }
}
