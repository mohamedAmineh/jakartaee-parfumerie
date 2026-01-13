package com.parfumerie.messaging;

import jakarta.enterprise.context.ApplicationScoped;

import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

/**
 * Dead Letter Channel (EIP): stocke les messages qui n'ont pas pu être routés/traités.
 */
@ApplicationScoped
public class DeadLetterChannel {

    public static class DeadLetter {
        public String type;
        public Object payload;
        public String reason;
        public LocalDateTime createdAt;
    }

    private static final int MAX = 50;
    private final Deque<DeadLetter> entries = new ArrayDeque<>();

    public synchronized void report(Object payload, String reason) {
        DeadLetter dl = new DeadLetter();
        dl.type = payload != null ? payload.getClass().getSimpleName() : "Unknown";
        dl.payload = payload;
        dl.reason = reason;
        dl.createdAt = LocalDateTime.now();

        entries.addFirst(dl);
        while (entries.size() > MAX) {
            entries.removeLast();
        }
    }

    public synchronized List<DeadLetter> getAll() {
        return new ArrayList<>(entries);
    }
}
