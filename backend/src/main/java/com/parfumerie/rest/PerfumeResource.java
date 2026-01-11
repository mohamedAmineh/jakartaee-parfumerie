package com.parfumerie.rest;

import com.parfumerie.domain.Perfume;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("perfumes")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Transactional
public class PerfumeResource {

    @PersistenceContext(unitName = "parfumeriePU")
    private EntityManager em;

    @GET
    public List<Perfume> getAll() {
        return em.createQuery("SELECT p FROM Perfume p", Perfume.class).getResultList();
    }

    @GET
    @Path("{id}")
    public Response getById(@PathParam("id") Long id) {
        Perfume p = em.find(Perfume.class, id);
        if (p == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(p).build();
    }

    @POST
    public Response create(Perfume perfume) {
        em.persist(perfume);
        return Response.status(Response.Status.CREATED).entity(perfume).build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") Long id, Perfume perfume) {
        Perfume existing = em.find(Perfume.class, id);
        if (existing == null) return Response.status(Response.Status.NOT_FOUND).build();
        
        existing.setName(perfume.getName());
        existing.setBrand(perfume.getBrand());
        existing.setPrice(perfume.getPrice());
        existing.setStock(perfume.getStock());
        existing.setAvailable(perfume.getAvailable());
        existing.setFormat(perfume.getFormat());
        
        em.merge(existing);
        return Response.ok(existing).build();
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") Long id) {
        Perfume p = em.find(Perfume.class, id);
        if (p == null) return Response.status(Response.Status.NOT_FOUND).build();
        em.remove(p);
        return Response.noContent().build();
    }
}
