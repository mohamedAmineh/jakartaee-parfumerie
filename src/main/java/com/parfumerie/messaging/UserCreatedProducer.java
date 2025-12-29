package com.parfumerie.messaging;

import com.parfumerie.domain.User;
// import jakarta.annotation.Resource;
import jakarta.ejb.Stateless;
// import jakarta.jms.*;

@Stateless
public class UserCreatedProducer {

    // @Resource(lookup = "java:comp/DefaultJMSConnectionFactory")
    // private ConnectionFactory factory;

    // @Resource(lookup = "java:app/jms/UserCreatedQueue")
    // private Queue queue;

    public void sendUserCreatedEvent(User user) {
        // TODO: réactiver JMS plus tard
        System.out.println("JMS disabled - would send: UserCreated:" + user.getId());
        
        /*
        try (JMSContext ctx = factory.createContext()) {
            String payload = "UserCreated:" + user.getId();
            ctx.createProducer().send(queue, payload);
            System.out.println("Sent JMS message: " + payload);
        }
        */
    }
}
