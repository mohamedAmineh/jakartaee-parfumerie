package com.parfumerie.filter;

import com.parfumerie.domain.Role;
import com.parfumerie.domain.User;
import com.parfumerie.service.UserService;
import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;

import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.Base64;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class BasicAuthFilter implements ContainerRequestFilter {

    @Inject
    private UserService userService;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        String auth = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);
        if (auth == null || !auth.startsWith("Bearer ")) {
            return;
        }

        String encoded = auth.substring("Bearer ".length()).trim();
        String decoded;
        try {
            byte[] bytes = Base64.getDecoder().decode(encoded);
            decoded = new String(bytes, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ex) {
            requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
            return;
        }

        int sep = decoded.indexOf(':');
        if (sep < 0) {
            requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
            return;
        }

        String email = decoded.substring(0, sep);
        String password = decoded.substring(sep + 1);
        User user = userService.authenticate(email, password);
        if (user == null) {
            requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
            return;
        }

        Role role = user.getRole();
        SecurityContext current = requestContext.getSecurityContext();
        requestContext.setSecurityContext(new SecurityContext() {
            @Override
            public Principal getUserPrincipal() {
                return () -> user.getEmail();
            }

            @Override
            public boolean isUserInRole(String roleName) {
                return role != null && role.name().equalsIgnoreCase(roleName);
            }

            @Override
            public boolean isSecure() {
                return current != null && current.isSecure();
            }

            @Override
            public String getAuthenticationScheme() {
                return "Bearer";
            }
        });
    }
}
