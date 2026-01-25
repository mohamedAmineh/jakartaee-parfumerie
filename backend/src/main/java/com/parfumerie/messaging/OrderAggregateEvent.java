package com.parfumerie.messaging;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;


/**
 * Aggregate event summarizing a batch of orders for one customer.
 */
public class OrderAggregateEvent implements Serializable {

    private final String customerEmail;
    private final int count;
    private final BigDecimal total;
    private final LocalDateTime lastCreatedAt;

    public OrderAggregateEvent(String customerEmail, int count, BigDecimal total, LocalDateTime lastCreatedAt) {
        this.customerEmail = customerEmail;
        this.count = count;
        this.total = total;
        this.lastCreatedAt = lastCreatedAt;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public int getCount() {
        return count;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public LocalDateTime getLastCreatedAt() {
        return lastCreatedAt;
    }
}
