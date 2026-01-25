package com.parfumerie.messaging;

import jakarta.enterprise.context.ApplicationScoped;


/**
 * Default handler for standard orders.
 */
@ApplicationScoped
public class StandardOrderHandler {

    public void handle(FilteredOrderCreatedEvent event) {
        if (event == null) return;
        System.out.println("[Standard] Commande " + event.getOrderId() + " total=" + event.getTotal() + " traitée normalement");
    }
}
