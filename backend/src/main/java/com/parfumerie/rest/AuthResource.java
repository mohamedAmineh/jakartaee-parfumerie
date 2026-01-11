package com.parfumerie.rest;

import com.parfumerie.domain.User;
import com.parfumerie.service.UserService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Transactional
public class AuthResource {

    @Inject
    private UserService userService;

    public static class LoginRequest {
        public String email;
        public String password;
    }

    // petite DTO pour ne pas renvoyer le hash du password
    public static class UserResponse {
        public Long id;
        public String firstName;
        public String lastName;
        public String email;
        public String phone;
        public String address;
        public Object role;

        public static UserResponse from(User u) {
            UserResponse r = new UserResponse();
            r.id = u.getId();
            r.firstName = u.getFirstName();
            r.lastName = u.getLastName();
            r.email = u.getEmail();
            r.phone = u.getPhone();
            r.address = u.getAddress();
            r.role = u.getRole();
            return r;
        }
    }

    @POST
    @Path("login")
    public Response login(LoginRequest req) {
        if (req == null || req.email == null || req.password == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("email/password required").build();
        }

        User u = userService.authenticate(req.email, req.password);
        if (u == null) {
            return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid credentials").build();
        }

        return Response.ok(UserResponse.from(u)).build();
    }
}
