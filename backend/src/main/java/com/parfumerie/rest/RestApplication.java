package com.parfumerie.rest;

import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;

/**
 * JAX-RS application root at /api.
 */
@ApplicationPath("api")
public class RestApplication extends Application { }