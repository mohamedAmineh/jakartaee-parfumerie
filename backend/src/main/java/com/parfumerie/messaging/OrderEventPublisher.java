package com.parfumerie.messaging;

import com.parfumerie.domain.Order;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;


/**
 * Publishes order-created events into the CDI event bus.
 */
@ApplicationScoped
public class OrderEventPublisher {

    @Inject
    private Event<OrderCreatedEvent> orderCreatedEvents;

    public void publishOrderCreated(Order order) {
        OrderCreatedEvent payload = OrderCreatedEvent.from(order);
        if (payload == null) return;
        
        orderCreatedEvents.fire(payload);
    }
}
