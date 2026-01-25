package com.parfumerie.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

/**
 * Creates EntityManager instances for standalone usage.
 */
public class PersistenceManager {

    private static final EntityManagerFactory emf =
            Persistence.createEntityManagerFactory("parfumeriePU"); 

    public static EntityManager createEntityManager() {
        return emf.createEntityManager();
    }
}
