package com.parfumerie.messaging;

import com.parfumerie.service.NotificationService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;


/**
 * Consumes order-created events to update notifications.
 */
@ApplicationScoped
public class OrderCreatedEventListener {

    @Inject
    private NotificationService notificationService;

    @Inject
    private DeadLetterChannel deadLetterChannel;

    public void onOrderCreated(@Observes FilteredOrderCreatedEvent event) {
        try {
            notificationService.addOrderCreated(event);
        } catch (Exception ex) {
            deadLetterChannel.report(event, "Notification error: " + ex.getMessage());
        }
    }
}
