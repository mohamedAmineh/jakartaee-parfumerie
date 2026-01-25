package com.parfumerie.service;

import com.parfumerie.domain.Order;
import com.parfumerie.domain.OrderItem;
import com.parfumerie.domain.Perfume;
import com.parfumerie.domain.User;

import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for simple order creation with stock checks.
 */
@Stateless
public class OrderService {

    @PersistenceContext(unitName = "parfumeriePU")
    private EntityManager em;

    public Order findById(Long id) {
        return em.find(Order.class, id);
    }

    public List<Order> findAll() {
        return em.createQuery("SELECT o FROM Order o", Order.class)
                 .getResultList();
    }

    
    public Order createOrder(Long userId, Long perfumeId, int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("quantity must be > 0");

        User user = em.find(User.class, userId);
        if (user == null) throw new IllegalArgumentException("User not found: " + userId);

        Perfume perfume = em.find(Perfume.class, perfumeId);
        if (perfume == null) throw new IllegalArgumentException("Perfume not found: " + perfumeId);

        if (perfume.getStock() != null && perfume.getStock() < quantity) {
            throw new IllegalArgumentException("Not enough stock");
        }

        
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("CREATED");
        order.setPaymentMethod("CARD");
        order.setShippingAddress(user.getAddress());

        em.persist(order);

        
        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setPerfume(perfume);
        item.setQuantity(quantity);
        item.setUnitPrice(perfume.getPrice());

        em.persist(item);

        
        if (perfume.getStock() != null) {
            perfume.setStock(perfume.getStock() - quantity);
        }

        BigDecimal total = (perfume.getPrice() == null)
                ? BigDecimal.ZERO
                : perfume.getPrice().multiply(BigDecimal.valueOf(quantity));
        order.setTotalPrice(total);

        return order;
    }

    public boolean delete(Long id) {
        Order existing = em.find(Order.class, id);
        if (existing == null) return false;
        em.remove(existing);
        return true;
    }
}
