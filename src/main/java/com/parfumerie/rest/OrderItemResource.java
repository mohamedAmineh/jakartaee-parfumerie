package com.parfumerie.rest;

import com.parfumerie.domain.Order;
import com.parfumerie.domain.OrderItem;
import com.parfumerie.domain.Perfume;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.math.BigDecimal;
import java.util.List;

@Path("orderitems")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Transactional
public class OrderItemResource {

    @PersistenceContext(unitName = "parfumeriePU")
    private EntityManager em;

    public static class CreateOrderItemRequest {
        public Long orderId;
        public Long perfumeId;
        public Integer quantity;
        public BigDecimal unitPrice;
    }

    @GET
    public List<OrderItem> getAll() {
        return em.createQuery("SELECT oi FROM OrderItem oi", OrderItem.class).getResultList();
    }

    @GET
    @Path("{id}")
    public Response getById(@PathParam("id") Long id) {
        OrderItem oi = em.find(OrderItem.class, id);
        if (oi == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(oi).build();
    }

    @POST
    public Response create(CreateOrderItemRequest req) {
        Order order = em.find(Order.class, req.orderId);
        if (order == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Order not found").build();
        }

        Perfume perfume = em.find(Perfume.class, req.perfumeId);
        if (perfume == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Perfume not found").build();
        }

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setPerfume(perfume);
        item.setQuantity(req.quantity);
        item.setUnitPrice(req.unitPrice);

        em.persist(item);
        
        // Recalculer le total de l'order
        recalculateOrderTotal(order);
        em.merge(order);
        
        return Response.status(Response.Status.CREATED).entity(item).build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") Long id, CreateOrderItemRequest req) {
        OrderItem existing = em.find(OrderItem.class, id);
        if (existing == null) return Response.status(Response.Status.NOT_FOUND).build();
        
        existing.setQuantity(req.quantity);
        existing.setUnitPrice(req.unitPrice);
        
        em.merge(existing);
        
        // Recalculer le total de l'order après modification
        Order order = existing.getOrder();
        recalculateOrderTotal(order);
        em.merge(order);
        
        return Response.ok(existing).build();
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") Long id) {
        OrderItem oi = em.find(OrderItem.class, id);
        if (oi == null) return Response.status(Response.Status.NOT_FOUND).build();
        
        Order order = oi.getOrder();
        em.remove(oi);
        
        // Recalculer le total après suppression
        recalculateOrderTotal(order);
        em.merge(order);
        
        return Response.noContent().build();
    }
    
    // Méthode utilitaire pour recalculer le total
    private void recalculateOrderTotal(Order order) {
        BigDecimal newTotal = order.getItems().stream()
            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalPrice(newTotal);
    }
}
