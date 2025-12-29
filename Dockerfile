FROM payara/micro:latest

COPY target/starter.war /opt/payara/deployments/starter.war
COPY postboot.asadmin /opt/payara/postboot.asadmin

EXPOSE 8080

CMD ["--postbootcommandfile", "/opt/payara/postboot.asadmin", "--deploy", "/opt/payara/deployments/starter.war"]
