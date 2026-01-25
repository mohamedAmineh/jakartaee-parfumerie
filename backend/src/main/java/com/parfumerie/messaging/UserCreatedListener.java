package com.parfumerie.messaging;



import jakarta.jms.Message;
import jakarta.jms.MessageListener;





/**
 * Message listener stub for JMS; currently disabled.
 */
public class UserCreatedListener implements MessageListener {

    @Override
    public void onMessage(Message message) {
        System.out.println("Received JMS message: " + message);
    }
}
