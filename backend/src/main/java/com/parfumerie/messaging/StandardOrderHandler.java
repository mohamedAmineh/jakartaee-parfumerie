package com.parfumerie.messaging;

import jakarta.enterprise.context.ApplicationScoped;

/**
 * Handler par défaut pour les commandes standards.
 */
@ApplicationScoped
public class StandardOrderHandler {

    public void handle(OrderCreatedEvent event) {
        if (event == null) return;
        System.out.println("[Standard] Commande " + event.getOrderId() + " total=" + event.getTotal() + " traitée normalement");
    }
}
