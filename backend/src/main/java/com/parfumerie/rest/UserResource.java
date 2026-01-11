package com.parfumerie.rest;

import com.parfumerie.domain.User;
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
        User created = userService.createUser(
                req.firstName, req.lastName, req.email, req.phone, req.password, req.address, null
        );
        return Response.status(Response.Status.CREATED).entity(created).build();
    }
}
