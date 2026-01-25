package com.parfumerie.service;

import com.parfumerie.domain.Perfume;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;

/**
 * CRUD service for perfume catalog entries.
 */
@Stateless
public class PerfumeService {

    @PersistenceContext(unitName = "parfumeriePU")
    private EntityManager em;

    public Perfume create(Perfume perfume) {
        em.persist(perfume);
        return perfume;
    }

    public Perfume findById(Long id) {
        return em.find(Perfume.class, id);
    }

    public List<Perfume> findAll() {
        return em.createQuery("SELECT p FROM Perfume p", Perfume.class)
                 .getResultList();
    }

    public Perfume update(Long id, Perfume data) {
        Perfume existing = em.find(Perfume.class, id);
        if (existing == null) return null;

        existing.setName(data.getName());
        existing.setFormat(data.getFormat());
        existing.setDescription(data.getDescription());
        existing.setBrand(data.getBrand());
        existing.setGender(data.getGender());
        existing.setType(data.getType());
        existing.setStock(data.getStock());
        existing.setAvailable(data.getAvailable());
        existing.setPrice(data.getPrice());
        existing.setComment(data.getComment());

        return existing; 
    }

    public boolean delete(Long id) {
        Perfume existing = em.find(Perfume.class, id);
        if (existing == null) return false;
        em.remove(existing);
        return true;
    }
}
