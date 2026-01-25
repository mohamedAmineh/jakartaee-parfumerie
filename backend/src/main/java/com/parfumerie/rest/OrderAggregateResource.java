package com.parfumerie.rest;

import com.parfumerie.messaging.OrderAggregateEvent;
import com.parfumerie.messaging.OrderEventAggregator;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

/**
 * Exposes recent order aggregates for analytics views.
 */
@Path("orders/aggregates")
@Produces(MediaType.APPLICATION_JSON)
public class OrderAggregateResource {

    @Inject
    private OrderEventAggregator orderEventAggregator;

    @GET
    public List<OrderAggregateEvent> getRecent() {
        return orderEventAggregator.getRecentAggregates();
    }
}
