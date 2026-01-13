package com.parfumerie.service;

import com.parfumerie.domain.Role;
import com.parfumerie.domain.User;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.mindrot.jbcrypt.BCrypt;

@Stateless
public class UserService {

    @PersistenceContext(unitName = "parfumeriePU")
    private EntityManager em;

    public User createUser(String firstName, String lastName, String email, String phone,
                           String plainPassword, String address, Role role) {

        email = normalizeEmail(email);

        if (firstName == null || firstName.isBlank())
            throw new IllegalArgumentException("firstName is required");
        if (lastName == null || lastName.isBlank())
            throw new IllegalArgumentException("lastName is required");
        if (email == null || email.isBlank())
            throw new IllegalArgumentException("email is required");
        if (phone == null || phone.isBlank())
            throw new IllegalArgumentException("phone is required");
        if (plainPassword == null || plainPassword.isBlank())
            throw new IllegalArgumentException("password is required");

        if (findByEmail(email) != null)
            throw new IllegalArgumentException("email deja utilise");

        String passwordHash = BCrypt.hashpw(plainPassword, BCrypt.gensalt(12));

        User u = new User();
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setEmail(email);
        u.setPhone(phone);
        u.setPassword(passwordHash);
        u.setAddress(address);
        u.setRole(role != null ? role : Role.CLIENT);

        em.persist(u);
        return u;
    }

    public User findUser(Long id) {
        return em.find(User.class, id);
    }

    public User findByEmail(String email) {
        email = normalizeEmail(email);
        if (email == null || email.isBlank()) return null;
        TypedQuery<User> q = em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class);
        q.setParameter("email", email);
        User u = q.getResultStream().findFirst().orElse(null);
        if (u != null) {
            // Reload from DB in case the row was updated outside JPA (eg. manual SQL update).
            em.refresh(u);
        }
        return u;
    }

    public User authenticate(String email, String plainPassword) {
        email = normalizeEmail(email);
        User u = findByEmail(email);
        if (u == null) return null;
        if (u.getPassword() == null || u.getPassword().isBlank()) return null;
        if (!BCrypt.checkpw(plainPassword, u.getPassword())) return null;
        return u;
    }

    public User updateUser(Long id, String firstName, String lastName, String email, String phone,
                           String plainPassword, String address) {
        if (id == null) return null;

        User u = em.find(User.class, id);
        if (u == null) return null;

        String normalizedEmail = null;
        if (email != null) {
            normalizedEmail = normalizeEmail(email);
            if (normalizedEmail.isBlank()) {
                throw new IllegalArgumentException("email is required");
            }
            User existingByEmail = findByEmail(normalizedEmail);
            if (existingByEmail != null && !existingByEmail.getId().equals(u.getId())) {
                throw new IllegalArgumentException("email deja utilise");
            }
        }

        boolean changed = false;

        if (firstName != null) {
            if (firstName.isBlank()) throw new IllegalArgumentException("firstName is required");
            u.setFirstName(firstName);
            changed = true;
        }
        if (lastName != null) {
            if (lastName.isBlank()) throw new IllegalArgumentException("lastName is required");
            u.setLastName(lastName);
            changed = true;
        }
        if (normalizedEmail != null) {
            u.setEmail(normalizedEmail);
            changed = true;
        }
        if (phone != null) {
            if (phone.isBlank()) throw new IllegalArgumentException("phone is required");
            u.setPhone(phone);
            changed = true;
        }
        if (plainPassword != null) {
            if (plainPassword.isBlank()) throw new IllegalArgumentException("password is required");
            String passwordHash = BCrypt.hashpw(plainPassword, BCrypt.gensalt(12));
            u.setPassword(passwordHash);
            changed = true;
        }
        if (address != null) {
            u.setAddress(address);
            changed = true;
        }

        if (!changed) {
            throw new IllegalArgumentException("No fields to update");
        }

        return u;
    }

    private String normalizeEmail(String email) {
        if (email == null) return null;
        return email.trim().toLowerCase();
    }
}
