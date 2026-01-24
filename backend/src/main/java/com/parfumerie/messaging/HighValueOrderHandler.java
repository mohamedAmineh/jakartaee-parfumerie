package com.parfumerie.messaging;

import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

/**
 * Handler pour les commandes à forte valeur (route dédiée).
 */
@ApplicationScoped
public class HighValueOrderHandler {

    private static final int MAX_EVENTS = 20;
    private final Deque<FilteredOrderCreatedEvent> flagged = new ArrayDeque<>();

    public synchronized void handle(FilteredOrderCreatedEvent event) {
        if (event == null) return;
        flagged.addFirst(event);
        while (flagged.size() > MAX_EVENTS) {
            flagged.removeLast();
        }
        System.out.println("[HighValue] Commande " + event.getOrderId() + " total=" + event.getTotal() + " envoyée en revue manuelle");
    }

    public synchronized List<FilteredOrderCreatedEvent> getFlaggedEvents() {
        return new ArrayList<>(flagged);
    }
}
