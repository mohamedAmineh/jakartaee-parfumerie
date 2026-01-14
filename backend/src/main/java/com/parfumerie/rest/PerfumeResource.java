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

    private Response validateAndApplyStockRules(Perfume p) {
        if (p == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Body is required").build();
        }
        if (p.getName() == null || p.getName().isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("name is required").build();
        }

        Integer stock = p.getStock();

        // Interdire stock négatif
        if (stock != null && stock < 0) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("stock must be >= 0").build();
        }

        if (p.getAvailable() == null) {
            p.setAvailable(true);
        }

        return null; // OK
    }

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
        Response validation = validateAndApplyStockRules(perfume);
        if (validation != null) return validation;

        em.persist(perfume);
        return Response.status(Response.Status.CREATED).entity(perfume).build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") Long id, Perfume data) {
        Perfume existing = em.find(Perfume.class, id);
        if (existing == null) return Response.status(Response.Status.NOT_FOUND).build();

        if (data.getName() != null) existing.setName(data.getName());
        if (data.getBrand() != null) existing.setBrand(data.getBrand());
        if (data.getPrice() != null) existing.setPrice(data.getPrice());
        if (data.getStock() != null) existing.setStock(data.getStock());
        if (data.getFormat() != null) existing.setFormat(data.getFormat());
        if (data.getDescription() != null) existing.setDescription(data.getDescription());
        if (data.getGender() != null) existing.setGender(data.getGender());
        if (data.getType() != null) existing.setType(data.getType());
        if (data.getComment() != null) existing.setComment(data.getComment());
        if (data.getAvailable() != null) existing.setAvailable(data.getAvailable());

        Response validation = validateAndApplyStockRules(existing);
        if (validation != null) return validation;

        // existing est managé, pas besoin de merge
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
