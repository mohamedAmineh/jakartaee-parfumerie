package com.parfumerie.messaging;

import com.parfumerie.domain.User;
import jakarta.ejb.Stateless;
import jakarta.jms.ConnectionFactory;
import jakarta.jms.JMSContext;
import jakarta.jms.Queue;

import javax.naming.InitialContext;
import javax.naming.NamingException;

@Stateless
public class UserCreatedProducer {

    public void sendUserCreatedEvent(User user) {
        if (user == null || user.getId() == null) return;

        try {
            InitialContext ctx = new InitialContext();
            ConnectionFactory factory =
                    (ConnectionFactory) ctx.lookup("java:comp/DefaultJMSConnectionFactory");

            try (JMSContext jms = factory.createContext()) {
                Queue queue = jms.createQueue("UserCreatedQueue");
                String payload = "UserCreated:" + user.getId();
                jms.createProducer().send(queue, payload);
                System.out.println("Sent JMS message: " + payload);
            }
        } catch (NamingException ex) {
            System.out.println("JMS unavailable (no ConnectionFactory) - skip UserCreated event");
        } catch (Exception ex) {
            System.err.println("Failed to send JMS UserCreated event: " + ex.getMessage());
        }
    }
}
