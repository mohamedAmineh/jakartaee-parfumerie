package com.parfumerie.messaging;

import jakarta.ejb.Schedule;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.jms.ConnectionFactory;
import jakarta.jms.JMSConsumer;
import jakarta.jms.JMSContext;
import jakarta.jms.Message;
import jakarta.jms.Queue;

import javax.naming.InitialContext;
import javax.naming.NamingException;

@Singleton
@Startup
public class UserCreatedPollingConsumer {

    private static final int MAX_PER_POLL = 10;

    @Schedule(second = "*/5", minute = "*", hour = "*", persistent = false)
    public void poll() {
        try {
            InitialContext ctx = new InitialContext();
            ConnectionFactory factory =
                    (ConnectionFactory) ctx.lookup("java:comp/DefaultJMSConnectionFactory");

            try (JMSContext jms = factory.createContext()) {
                Queue queue = jms.createQueue("UserCreatedQueue");
                JMSConsumer consumer = jms.createConsumer(queue);

                for (int i = 0; i < MAX_PER_POLL; i++) {
                    Message msg = consumer.receiveNoWait();
                    if (msg == null) break;
                    System.out.println("Received JMS message: " + msg);
                }
            }
        } catch (NamingException ex) {
            // JMS non configuré : on skip sans bloquer le déploiement
        } catch (Exception ex) {
            System.err.println("JMS poll error: " + ex.getMessage());
        }
    }
}
