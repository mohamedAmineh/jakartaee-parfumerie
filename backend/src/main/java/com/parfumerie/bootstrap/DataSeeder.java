package com.parfumerie.bootstrap;

import java.math.BigDecimal;

import com.parfumerie.domain.Perfume;
import com.parfumerie.domain.Role;
import com.parfumerie.domain.User;

import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

/**
 * Seeds demo users and perfumes on startup when the database is empty.
 */
@Singleton
@Startup
public class DataSeeder {

  @PersistenceContext(unitName = "parfumeriePU")
  private EntityManager em;

  @PostConstruct
  @Transactional
  public void init() {

    
    Long users = em.createQuery("SELECT COUNT(u) FROM User u", Long.class).getSingleResult();
    if (users == 0) {

      User admin = new User();
      admin.setFirstName("Admin");
      admin.setLastName("Parfumerie");
      admin.setEmail("admin@parfumerie.local");
      admin.setPhone("0600000000");
      admin.setAddress("Backoffice");
      admin.setPassword("$2a$12$NgRNS2F/NXHt6MQ/oSkHyeU3/nGPz/hqfp0xG2IojXvpQhBl7wVUC"); 
      admin.setRole(Role.ADMIN);
      em.persist(admin);

      User client = new User();
      client.setFirstName("Client");
      client.setLastName("Demo");
      client.setEmail("client@parfumerie.local");
      client.setPhone("0611111111");
      client.setAddress("Paris");
      client.setPassword("$2a$12$NgRNS2F/NXHt6MQ/oSkHyeU3/nGPz/hqfp0xG2IojXvpQhBl7wVUC");
      client.setRole(Role.CLIENT);
      em.persist(client);
    }

    
    Long perfumes = em.createQuery("SELECT COUNT(p) FROM Perfume p", Long.class).getSingleResult();
    if (perfumes == 0) {

      em.persist(perfume("Vanille Rouge", "Maison Demo", "100ml", "EDP", "UNISEX", 12, true, "59.90",
        "Vanille ambrée, douce et moderne.", "Best-seller demo"));

      em.persist(perfume("Bois Noir", "Maison Demo", "100ml", "EDP", "HOMME", 5, true, "79.90",
        "Boisé fumé, élégant, tenue longue.", "Idéal hiver"));

      em.persist(perfume("Fleur de Coton", "Atelier Paris", "50ml", "EDT", "FEMME", 18, true, "39.90",
        "Propre, musqué, frais.", "Quotidien"));

      em.persist(perfume("Citrus Splash", "Atelier Paris", "100ml", "EDT", "UNISEX", 22, true, "44.90",
        "Agrumes + gingembre, très frais.", "Été"));

      em.persist(perfume("Oud & Rose", "Oriental Lab", "50ml", "PARFUM", "UNISEX", 7, true, "99.90",
        "Oud doux, rose sombre, intense.", "Soirée"));

      em.persist(perfume("Ambre Solaire", "Oriental Lab", "100ml", "EDP", "FEMME", 9, true, "69.90",
        "Ambre, coco, solaire.", "Vacances"));

      em.persist(perfume("Menthe Glacée", "Fresh Co", "100ml", "EDT", "HOMME", 14, true, "34.90",
        "Menthe, notes aquatiques, propre.", "Sport"));

      em.persist(perfume("Patchouli Chic", "Niche Studio", "50ml", "EDP", "UNISEX", 3, true, "89.90",
        "Patchouli moderne, cacao léger.", "Stock faible"));
      
      em.persist(perfume("Étoile d'Ambre", "Maison Lumière", "100ml", "EDP", "UNISEX", 19, true, "129",
        "Ambre, vanille, bois doux, sillage chaleureux.", "Parfait en soirée."));

    }
  }

  private Perfume perfume(
      String name,
      String brand,
      String format,
      String type,
      String gender,
      int stock,
      boolean available,
      String price,
      String description,
      String comment
  ) {
    Perfume p = new Perfume();
    p.setName(name);
    p.setBrand(brand);
    p.setFormat(format);
    p.setType(type);
    p.setGender(gender);
    p.setStock(stock);
    p.setAvailable(available);
    p.setPrice(new BigDecimal(price));
    p.setDescription(description);
    p.setComment(comment);
    return p;
  }
}