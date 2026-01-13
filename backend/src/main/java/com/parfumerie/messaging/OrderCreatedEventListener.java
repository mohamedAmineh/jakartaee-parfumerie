package com.parfumerie.messaging;

import com.parfumerie.service.NotificationService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

/**
 * Event-driven Consumer (EIP): reacts to OrderCreatedEvent and enriches the notification store.
 */
@ApplicationScoped
public class OrderCreatedEventListener {

    @Inject
    private NotificationService notificationService;

    @Inject
    private DeadLetterChannel deadLetterChannel;

    public void onOrderCreated(@Observes OrderCreatedEvent event) {
        try {
            notificationService.addOrderCreated(event);
        } catch (Exception ex) {
            deadLetterChannel.report(event, "Notification error: " + ex.getMessage());
        }
    }
}
