package com.parfumerie.rest;

import com.parfumerie.messaging.DeadLetterChannel;
import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Exposes and clears dead letters from the messaging pipeline.
 */
@Path("deadletters")
@Produces(MediaType.APPLICATION_JSON)
public class DeadLetterResource {

    @Inject
    private DeadLetterChannel deadLetterChannel;

    @GET
    public Object getAll() {
        return deadLetterChannel.getAll();
    }

    @DELETE
    @Path("")
    public Response clearAll() {
        deadLetterChannel.clear();
        return Response.noContent().build();
    }

    @POST
    @Path("clear")
    public Response clearAllViaPost() {
        deadLetterChannel.clear();
        return Response.noContent().build();
    }
}
