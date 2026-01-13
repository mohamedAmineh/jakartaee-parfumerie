package com.parfumerie.filter;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;

@Provider
@Priority(Priorities.AUTHORIZATION)
public class AdminGuardFilter implements ContainerRequestFilter {

    @Override
    public void filter(ContainerRequestContext requestContext) {
        String method = requestContext.getMethod();
        if (!isWriteMethod(method)) {
            return;
        }

        String path = requestContext.getUriInfo().getPath();
        if (!path.startsWith("perfumes")) {
            return;
        }

        var security = requestContext.getSecurityContext();
        if (security == null || security.getUserPrincipal() == null) {
            requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
            return;
        }

        if (!security.isUserInRole("ADMIN")) {
            requestContext.abortWith(Response.status(Response.Status.FORBIDDEN).build());
        }
    }

    private boolean isWriteMethod(String method) {
        return "POST".equalsIgnoreCase(method)
                || "PUT".equalsIgnoreCase(method)
                || "DELETE".equalsIgnoreCase(method);
    }
}
