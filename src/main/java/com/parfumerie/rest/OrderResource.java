package com.parfumerie.rest;

import com.parfumerie.domain.Order;
import com.parfumerie.domain.OrderItem;
import com.parfumerie.domain.Perfume;
import com.parfumerie.domain.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Path("orders")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Transactional
public class OrderResource {

    @PersistenceContext(unitName = "parfumeriePU")
    private EntityManager em;

    public static class OrderItemDto {
        public Long perfumeId;
        public Integer quantity;
        public BigDecimal unitPrice;
    }

    public static class CreateOrderRequest {
        public Long userId;
        public String status;
        public List<OrderItemDto> items;
    }

    @GET
    public List<Order> getAll() {
        return em.createQuery("SELECT o FROM Order o", Order.class).getResultList();
    }

    @GET
    @Path("{id}")
    public Response getById(@PathParam("id") Long id) {
        Order o = em.find(Order.class, id);
        if (o == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(o).build();
    }

    @POST
    public Response create(CreateOrderRequest req) {
        User user = em.find(User.class, req.userId);
        if (user == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("User not found").build();
        }

        if (req.items == null || req.items.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Order must have at least one item").build();
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(req.status != null ? req.status : "PENDING");
        order.setItems(new ArrayList<>());

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemDto itemDto : req.items) {
            Perfume perfume = em.find(Perfume.class, itemDto.perfumeId);
            if (perfume == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("Perfume " + itemDto.perfumeId + " not found").build();
            }

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setPerfume(perfume);
            item.setQuantity(itemDto.quantity);
            item.setUnitPrice(itemDto.unitPrice);

            order.getItems().add(item);
            
            total = total.add(itemDto.unitPrice.multiply(BigDecimal.valueOf(itemDto.quantity)));
        }

        order.setTotalPrice(total);
        em.persist(order);

        return Response.status(Response.Status.CREATED).entity(order).build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") Long id, CreateOrderRequest req) {
        Order existing = em.find(Order.class, id);
        if (existing == null) return Response.status(Response.Status.NOT_FOUND).build();
        
        if (req.status != null) {
            existing.setStatus(req.status);
        }
        
        em.merge(existing);
        return Response.ok(existing).build();
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") Long id) {
        Order o = em.find(Order.class, id);
        if (o == null) return Response.status(Response.Status.NOT_FOUND).build();
        em.remove(o);
        return Response.noContent().build();
    }
}
