package com.parfumerie.messaging;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;

/**
 * Event-driven Consumer (EIP): logs aggregate events for traceability.
 */
@ApplicationScoped
public class OrderAggregateListener {

    public void onAggregate(@Observes OrderAggregateEvent event) {
        if (event == null) return;
        System.out.println("[Aggregate] customer=" + event.getCustomerEmail()
                + " count=" + event.getCount()
                + " total=" + event.getTotal()
                + " lastCreatedAt=" + event.getLastCreatedAt());
    }
}
