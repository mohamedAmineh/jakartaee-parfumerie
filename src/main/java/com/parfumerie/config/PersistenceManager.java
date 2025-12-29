package com.parfumerie.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

public class PersistenceManager {

    private static final EntityManagerFactory emf =
            Persistence.createEntityManagerFactory("parfumeriePU"); 

    public static EntityManager createEntityManager() {
        return emf.createEntityManager();
    }
}
