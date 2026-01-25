package com.parfumerie.rest;

import com.parfumerie.messaging.HighValueOrderHandler;
import com.parfumerie.messaging.FilteredOrderCreatedEvent;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;


/**
 * Exposes high-value orders queued for manual review.
 */
@Path("orders/high-value")
@Produces(MediaType.APPLICATION_JSON)
public class ReviewResource {

    @Inject
    private HighValueOrderHandler highValueOrderHandler;

    @GET
    public List<FilteredOrderCreatedEvent> getFlagged() {
        return highValueOrderHandler.getFlaggedEvents();
    }
}
