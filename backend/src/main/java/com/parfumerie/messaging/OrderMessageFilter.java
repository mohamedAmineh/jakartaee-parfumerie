package com.parfumerie.messaging;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

import java.math.BigDecimal;

/**
 * Message Filter (EIP): drops invalid or non-actionable order events.
 */
@ApplicationScoped
public class OrderMessageFilter {

    @Inject
    private Event<FilteredOrderCreatedEvent> filteredEvents;

    @Inject
    private DeadLetterChannel deadLetterChannel;

    public void filter(@Observes OrderCreatedEvent event) {
        if (event == null) return;

        if (!accept(event)) {
            deadLetterChannel.report(event, "Filtered: invalid status, total, or customer email");
            return;
        }

        FilteredOrderCreatedEvent filtered = FilteredOrderCreatedEvent.from(event);
        if (filtered != null) {
            filteredEvents.fire(filtered);
        }
    }

    private boolean accept(OrderCreatedEvent event) {
        if (event.getOrderId() == null) return false;
        if (!isCreatedStatus(event.getStatus())) return false;

        BigDecimal total = event.getTotal();
        if (total == null || total.signum() <= 0) return false;

        String email = event.getCustomerEmail();
        return email != null && !email.trim().isEmpty();
    }

    private boolean isCreatedStatus(String status) {
        return status != null && status.equalsIgnoreCase("CREATED");
    }
}
