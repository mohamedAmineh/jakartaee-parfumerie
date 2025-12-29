package com.parfumerie.rest;

import com.parfumerie.domain.User;
import com.parfumerie.service.UserService;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("users")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Transactional
public class UserResource {

    @Inject
    private UserService userService;

    @PersistenceContext(unitName = "parfumeriePU")
    private EntityManager em;

    public static class CreateUserRequest {
        public String firstName;
        public String lastName;
        public String email;
        public String phone;
        public String password;
        public String address;
    }

    @GET
    public List<User> getAll() {
        return em.createQuery("SELECT u FROM User u", User.class).getResultList();
    }

    @GET
    @Path("{id}")
    public Response getById(@PathParam("id") Long id) {
        User u = userService.findUser(id);
        if (u == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(u).build();
    }

    @POST
    public Response create(CreateUserRequest req) {
        User created = userService.createUser(
            req.firstName, 
            req.lastName, 
            req.email, 
            req.phone, 
            req.password, 
            req.address
        );
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") Long id, CreateUserRequest req) {
        User existing = em.find(User.class, id);
        if (existing == null) return Response.status(Response.Status.NOT_FOUND).build();
        
        existing.setFirstName(req.firstName);
        existing.setLastName(req.lastName);
        existing.setEmail(req.email);
        existing.setPhone(req.phone);
        existing.setAddress(req.address);
        // Note: password update nécessite re-hashing, à gérer séparément
        
        em.merge(existing);
        return Response.ok(existing).build();
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") Long id) {
        User u = em.find(User.class, id);
        if (u == null) return Response.status(Response.Status.NOT_FOUND).build();
        em.remove(u);
        return Response.noContent().build();
    }
}
