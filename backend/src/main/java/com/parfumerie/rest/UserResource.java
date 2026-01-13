package com.parfumerie.rest;

import com.parfumerie.domain.User;
import com.parfumerie.messaging.UserCreatedProducer;
import com.parfumerie.service.UserService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
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
}
