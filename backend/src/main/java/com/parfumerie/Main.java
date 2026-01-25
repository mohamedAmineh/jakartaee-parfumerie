package com.parfumerie;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.parfumerie.config.PersistenceManager;
import com.parfumerie.domain.Order;
import com.parfumerie.domain.OrderItem;
import com.parfumerie.domain.Perfume;
import com.parfumerie.domain.User;

import jakarta.persistence.EntityManager;

/**
 * Standalone runner to exercise JPA outside the container for manual testing.
 */
public class Main {

    public static void main(String[] args) {

        
        EntityManager em = PersistenceManager.createEntityManager();

        try {
            em.getTransaction().begin();

            
            Perfume p = new Perfume();
            p.setName("Dior Sauvage");
            p.setBrand("Dior");
            p.setPrice(new BigDecimal("89.90"));
            p.setFormat("100ml");
            p.setAvailable(true);
            p.setStock(10);
            em.persist(p);

            
            User user = new User();
            user.setFirstName("Mohamed");
            user.setLastName("Ouberka");
            user.setEmail("mohamed@example.com");
            user.setPassword("secret");
            user.setAddress("Paris");
            user.setPhone("0600000000");
            em.persist(user);

            
            Order order = new Order();
            order.setUser(user);
            order.setOrderDate(LocalDateTime.now());
            order.setStatus("CREATED");
            order.setPaymentMethod("CARD");
            order.setShippingAddress("Paris");
            order.setTotalPrice(new BigDecimal("89.90"));
            em.persist(order);

            
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setPerfume(p);
            item.setQuantity(1);
            item.setUnitPrice(new BigDecimal("89.90"));
            em.persist(item);

            em.getTransaction().commit();

            System.out.println(" User, Order, OrderItem et Perfume insérés dans PostgreSQL !");
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            System.err.println("Error during database operations: " + e.getMessage());
            e.printStackTrace(System.err);
        } finally {
            em.close();
        }
    }
}
