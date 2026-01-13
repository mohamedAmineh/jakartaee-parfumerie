package com.parfumerie.messaging;

import com.parfumerie.domain.Order;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;

/**
 * Message Endpoint (producer side): publishes an Event Message into the CDI event bus.
 */
@ApplicationScoped
public class OrderEventPublisher {

    @Inject
    private Event<OrderCreatedEvent> orderCreatedEvents;

    public void publishOrderCreated(Order order) {
        OrderCreatedEvent payload = OrderCreatedEvent.from(order);
        if (payload == null) return;
        // fire = synchrone ici pour garantir le routing/handlers immédiats (debug plus simple)
        orderCreatedEvents.fire(payload);
    }
}
