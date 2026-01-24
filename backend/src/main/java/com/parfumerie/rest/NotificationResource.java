package com.parfumerie.rest;

import com.parfumerie.service.NotificationService;
import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("notifications")
@Produces(MediaType.APPLICATION_JSON)
public class NotificationResource {

    @Inject
    private NotificationService notificationService;

    @GET
    @Path("orders")
    public List<NotificationService.OrderNotification> getOrders() {
        return notificationService.getRecent();
    }

    @DELETE
    @Path("orders")
    public void clearOrders() {
        notificationService.clear();
    }
}
