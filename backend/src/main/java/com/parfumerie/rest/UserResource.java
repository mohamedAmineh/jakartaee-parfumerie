package com.parfumerie.rest;

import com.parfumerie.domain.User;
import com.parfumerie.messaging.UserCreatedProducer;
import com.parfumerie.service.UserService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("users")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    private UserService userService;

    @Inject
    private UserCreatedProducer userCreatedProducer;

    public static class CreateUserRequest {
        public String firstName;
        public String lastName;
        public String email;
        public String phone;
        public String password;
        public String address;
    }

    public static class UpdateUserRequest {
        public String firstName;
        public String lastName;
        public String email;
        public String phone;
        public String password;
        public String address;
    }

    @POST
    public Response create(CreateUserRequest req) {
        if (req == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Invalid payload").build();
        }

        try {
            User created = userService.createUser(
                    req.firstName, req.lastName, req.email, req.phone, req.password, req.address, null
            );
            // Best-effort JMS : ne bloque pas si JMS absent
            try {
                userCreatedProducer.sendUserCreatedEvent(created);
            } catch (Exception e) {
                System.err.println("JMS user-created skipped: " + e.getMessage());
            }
            return Response.status(Response.Status.CREATED)
                    .entity(AuthResource.UserResponse.from(created))
                    .build();
        } catch (IllegalArgumentException e) {
            String msg = e.getMessage() == null ? "Invalid request" : e.getMessage();
            Response.Status status = msg.toLowerCase().contains("email") && msg.toLowerCase().contains("deja")
                    ? Response.Status.CONFLICT
                    : Response.Status.BAD_REQUEST;
            return Response.status(status).entity(msg).build();
        }
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") Long id, UpdateUserRequest req) {
        if (id == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("id is required").build();
        }
        if (req == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Invalid payload").build();
        }
        if (!hasUpdateFields(req)) {
            return Response.status(Response.Status.BAD_REQUEST).entity("No fields to update").build();
        }

        try {
            User updated = userService.updateUser(
                    id, req.firstName, req.lastName, req.email, req.phone, req.password, req.address
            );
            if (updated == null) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
            return Response.ok(AuthResource.UserResponse.from(updated)).build();
        } catch (IllegalArgumentException e) {
            String msg = e.getMessage() == null ? "Invalid request" : e.getMessage();
            Response.Status status = msg.toLowerCase().contains("email") && msg.toLowerCase().contains("deja")
                    ? Response.Status.CONFLICT
                    : Response.Status.BAD_REQUEST;
            return Response.status(status).entity(msg).build();
        }
    }

    private boolean hasUpdateFields(UpdateUserRequest req) {
        return req.firstName != null
                || req.lastName != null
                || req.email != null
                || req.phone != null
                || req.password != null
                || req.address != null;
    }
}
