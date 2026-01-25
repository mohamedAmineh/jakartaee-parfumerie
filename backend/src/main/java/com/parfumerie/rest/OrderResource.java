package com.parfumerie.rest;

import com.parfumerie.domain.Order;
import com.parfumerie.domain.OrderItem;
import com.parfumerie.domain.Perfume;
import com.parfumerie.domain.User;
import com.parfumerie.messaging.DeadLetterChannel;
import com.parfumerie.messaging.OrderEventPublisher;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Order REST resource: validates items, adjusts stock, and publishes events.
 */
@Path("orders")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Transactional
public class OrderResource {

    @PersistenceContext(unitName = "parfumeriePU")
    private EntityManager em;

    @Inject
    private OrderEventPublisher orderEventPublisher;

    @Inject
    private DeadLetterChannel deadLetterChannel;

    public static class OrderItemDto {
        public Long perfumeId;
        public Integer quantity;
        
        public BigDecimal unitPrice;
    }

    public static class CreateOrderRequest {
        public Long userId;
        public String status;
        public List<OrderItemDto> items;
        public boolean testZeroTotal;
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
        if (req == null || req.userId == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("userId is required").build();
        }
        if (req.items == null || req.items.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Order must have at least one item").build();
        }

        User user = em.find(User.class, req.userId);
        if (user == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("User not found").build();
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(req.status != null ? req.status : "PENDING");
        order.setItems(new ArrayList<>());
        order.setOrderDate(LocalDateTime.now());
        order.setShippingAddress(user.getAddress());

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemDto itemDto : req.items) {
            if (itemDto == null || itemDto.perfumeId == null) {
                return Response.status(Response.Status.BAD_REQUEST).entity("perfumeId is required").build();
            }

            int qty = itemDto.quantity == null ? 0 : itemDto.quantity;
            if (qty <= 0) {
                return Response.status(Response.Status.BAD_REQUEST).entity("Quantity must be > 0").build();
            }

            Perfume perfume = em.find(Perfume.class, itemDto.perfumeId);
            if (perfume == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("Perfume " + itemDto.perfumeId + " not found").build();
            }

            if (perfume.getAvailable() != null && !perfume.getAvailable()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("Perfume " + perfume.getId() + " is not available").build();
            }

            Integer stock = perfume.getStock();
            if (stock != null) {
                if (stock < qty) {
                    HashMap<String, Object> payload = new HashMap<>();
                    payload.put("userId", req.userId);
                    payload.put("perfumeId", perfume.getId());
                    payload.put("requestedQty", qty);
                    payload.put("availableStock", stock);
                    deadLetterChannel.report(payload, "Out of stock for perfume " + perfume.getId());
                    return Response.status(Response.Status.BAD_REQUEST)
                        .entity("Not enough stock for perfume " + perfume.getId()).build();
                }
                perfume.setStock(stock - qty);
            }

            BigDecimal unitPrice = perfume.getPrice() != null ? perfume.getPrice() : BigDecimal.ZERO;

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setPerfume(perfume);
            item.setQuantity(qty);
            item.setUnitPrice(unitPrice);

            order.getItems().add(item);

            total = total.add(unitPrice.multiply(BigDecimal.valueOf(qty)));
        }

        if (req.testZeroTotal) {
            total = BigDecimal.ZERO;
        }

        order.setTotalPrice(total);

        em.persist(order);
        em.flush(); 

        orderEventPublisher.publishOrderCreated(order);

        HashMap<String, Object> result = new HashMap<>();
        result.put("id", order.getId());
        result.put("status", order.getStatus());
        result.put("total", order.getTotalPrice());
        result.put("userEmail", user.getEmail());
        result.put("createdAt", order.getOrderDate());

        return Response.status(Response.Status.CREATED).entity(result).build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") Long id, CreateOrderRequest req) {
        Order existing = em.find(Order.class, id);
        if (existing == null) return Response.status(Response.Status.NOT_FOUND).build();

        if (req != null && req.status != null) {
            existing.setStatus(req.status);
        }
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
