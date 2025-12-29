package com.parfumerie.service;

import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.mindrot.jbcrypt.BCrypt;
import com.parfumerie.domain.User;

@Stateless
public class UserService {

    @PersistenceContext(unitName = "parfumeriePU")
    private EntityManager em;

    public User createUser(String firstName, String lastName, String email, String phone, String plainPassword, String address) {
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

        String passwordHash = BCrypt.hashpw(plainPassword, BCrypt.gensalt(12));

        User u = new User();
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setEmail(email);
        u.setPhone(phone);
        u.setPassword(passwordHash);
        u.setAddress(address); // peut être null

        em.persist(u);
        return u;
    }

    public User findUser(Long id) {
        return em.find(User.class, id);
    }
}
