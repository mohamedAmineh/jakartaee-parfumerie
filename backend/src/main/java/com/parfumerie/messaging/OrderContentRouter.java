package com.parfumerie.messaging;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

import java.math.BigDecimal;

/**
 * Content-based Router (EIP) :
 * - si total >= seuil, on route vers le handler "high value" (revue manuelle).
 * - sinon, on route vers le handler standard.
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

    public void route(@Observes OrderCreatedEvent event) {
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
