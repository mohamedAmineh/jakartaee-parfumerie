package com.parfumerie.messaging;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * Aggregates filtered order events per customer into batches.
 */
@ApplicationScoped
public class OrderEventAggregator {

    private static final int BATCH_SIZE = 3;
    private static final int MAX_AGGREGATES = 20;

    private final Map<String, AggregateBucket> buckets = new HashMap<>();
    private final Deque<OrderAggregateEvent> recentAggregates = new ArrayDeque<>();

    @Inject
    private Event<OrderAggregateEvent> aggregateEvents;

    public synchronized void aggregate(@Observes FilteredOrderCreatedEvent event) {
        if (event == null) return;

        String email = event.getCustomerEmail();
        if (email == null || email.trim().isEmpty()) return;

        AggregateBucket bucket = buckets.computeIfAbsent(email, key -> new AggregateBucket());
        bucket.count += 1;
        bucket.total = bucket.total.add(safeTotal(event.getTotal()));
        bucket.lastCreatedAt = event.getCreatedAt() != null ? event.getCreatedAt() : LocalDateTime.now();

        if (bucket.count >= BATCH_SIZE) {
            OrderAggregateEvent aggregate = new OrderAggregateEvent(
                    email,
                    bucket.count,
                    bucket.total,
                    bucket.lastCreatedAt
            );

            recentAggregates.addFirst(aggregate);
            while (recentAggregates.size() > MAX_AGGREGATES) {
                recentAggregates.removeLast();
            }

            aggregateEvents.fire(aggregate);
            buckets.remove(email);
        }
    }

    public synchronized List<OrderAggregateEvent> getRecentAggregates() {
        return new ArrayList<>(recentAggregates);
    }

    private BigDecimal safeTotal(BigDecimal total) {
        return total != null ? total : BigDecimal.ZERO;
    }

    private static class AggregateBucket {
        int count;
        BigDecimal total = BigDecimal.ZERO;
        LocalDateTime lastCreatedAt;
    }
}
