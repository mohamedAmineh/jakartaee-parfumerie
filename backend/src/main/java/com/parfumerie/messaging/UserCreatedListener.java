package com.parfumerie.messaging;

// import jakarta.ejb.ActivationConfigProperty;
// import jakarta.ejb.MessageDriven;
import jakarta.jms.Message;
import jakarta.jms.MessageListener;

// @MessageDriven(activationConfig = {
//     @ActivationConfigProperty(propertyName = "destinationLookup", propertyValue = "jms/UserCreatedQueue"),
//     @ActivationConfigProperty(propertyName = "destinationType", propertyValue = "jakarta.jms.Queue")
// })
public class UserCreatedListener implements MessageListener {

    @Override
    public void onMessage(Message message) {
        System.out.println("Received JMS message: " + message);
    }
}
