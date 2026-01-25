package com.parfumerie.messaging;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

import java.math.BigDecimal;


/**
 * Routes order-created events to handlers based on total value.
 */
@ApplicationScoped
public class OrderContentRouter {

    private static final BigDecimal HIGH_VALUE_THRESHOLD = new BigDecimal("500.00");

    @Inject
    private HighValueOrderHandler highValueOrderHandler;

    @Inject
    private StandardOrderHandler standardOrderHandler;

    @Inject
    private DeadLetterChannel deadLetterChannel;

    public void route(@Observes FilteredOrderCreatedEvent event) {
        if (event == null) return;

        try {
            BigDecimal total = event.getTotal();
            boolean isHighValue = total != null && total.compareTo(HIGH_VALUE_THRESHOLD) >= 0;

            if (isHighValue) {
                highValueOrderHandler.handle(event);
            } else {
                standardOrderHandler.handle(event);
            }
        } catch (Exception ex) {
            deadLetterChannel.report(event, "Routing error: " + ex.getMessage());
        }
    }
}
