package com.parfumerie.rest;

import com.parfumerie.messaging.DeadLetterChannel;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("deadletters")
@Produces(MediaType.APPLICATION_JSON)
public class DeadLetterResource {

    @Inject
    private DeadLetterChannel deadLetterChannel;

    @GET
    public Object getAll() {
        return deadLetterChannel.getAll();
    }
}
