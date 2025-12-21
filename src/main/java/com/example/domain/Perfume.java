package com.example.domain;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "perfumes")
public class Perfume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String format;        // 50ml, 100ml...
    private String description;
    private String brand;
    private String gender;        // FEMME / HOMME / UNISEX
    private String type;          // EDT / EDP / PARFUM

    private Integer stock;
    private Boolean available;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    private String comment;

    @OneToMany(mappedBy = "perfume")
    private List<OrderItem> orderItems = new ArrayList<>();

    public Perfume() {}

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getFormat() {
        return format;
    }

    public String getDescription() {
        return description;
    }

    public String getBrand() {
        return brand;
    }

    public String getGender() {
        return gender;
    }

    public String getType() {
        return type;
    }

    public Integer getStock() {
        return stock;
    }

    public Boolean getAvailable() {
        return available;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getComment() {
        return comment;
    }

    public List<OrderItem> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }

    public void setName(String name) {
        this.name = name;
    }
    public void setFormat(String format) {
        this.format = format;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public void setBrand(String brand) {
        this.brand = brand;
    }
    public void setGender(String gender) {
        this.gender = gender;   
    }
    public void setType(String type) {
        this.type = type;
    }
    public void setStock(Integer stock) {
        this.stock = stock;
    }
    public void setAvailable(Boolean available) {
        this.available = available;
    }
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    public void setComment(String comment) {
        this.comment = comment;
    }
    
    
}
