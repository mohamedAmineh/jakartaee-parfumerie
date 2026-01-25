package com.parfumerie.messaging;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;


/**
 * Validated order event used by the aggregation pipeline.
 */
public class FilteredOrderCreatedEvent implements Serializable {

    private final Long orderId;
    private final String customerEmail;
    private final BigDecimal total;
    private final String status;
    private final LocalDateTime createdAt;

    public FilteredOrderCreatedEvent(Long orderId, String customerEmail, BigDecimal total, String status, LocalDateTime createdAt) {
        this.orderId = orderId;
        this.customerEmail = customerEmail;
        this.total = total;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static FilteredOrderCreatedEvent from(OrderCreatedEvent event) {
        if (event == null) return null;
        return new FilteredOrderCreatedEvent(
                event.getOrderId(),
                event.getCustomerEmail(),
                event.getTotal(),
                event.getStatus(),
                event.getCreatedAt()
        );
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
