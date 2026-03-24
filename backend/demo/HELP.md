# Getting Started

### Reference Documentation
For further reference, please consider the following sections:

* [Official Apache Maven documentation](https://maven.apache.org/guides/index.html)
* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/3.5.7/maven-plugin)
* [Create an OCI image](https://docs.spring.io/spring-boot/3.5.7/maven-plugin/build-image.html)
* [Spring Integration JDBC Module Reference Guide](https://docs.spring.io/spring-integration/reference/jdbc.html)
* [Spring Integration JPA Module Reference Guide](https://docs.spring.io/spring-integration/reference/jpa.html)
* [Spring Integration MongoDB Module Reference Guide](https://docs.spring.io/spring-integration/reference/mongodb.html)
* [Spring Integration Test Module Reference Guide](https://docs.spring.io/spring-integration/reference/testing.html)
* [Spring Integration Security Module Reference Guide](https://docs.spring.io/spring-integration/reference/security.html)
* [Spring Integration HTTP Module Reference Guide](https://docs.spring.io/spring-integration/reference/http.html)
* [Spring Web](https://docs.spring.io/spring-boot/3.5.7/reference/web/servlet.html)
* [Spring Boot DevTools](https://docs.spring.io/spring-boot/3.5.7/reference/using/devtools.html)
* [Docker Compose Support](https://docs.spring.io/spring-boot/3.5.7/reference/features/dev-services.html#features.dev-services.docker-compose)
* [Spring Security](https://docs.spring.io/spring-boot/3.5.7/reference/web/spring-security.html)
* [Spring Data JPA](https://docs.spring.io/spring-boot/3.5.7/reference/data/sql.html#data.sql.jpa-and-spring-data)
* [Spring Session for Spring Data MongoDB](https://docs.spring.io/spring-session/reference/)
* [Spring Session for Spring Data Redis](https://docs.spring.io/spring-session/reference/)
* [Netflix DGS](https://netflix.github.io/dgs/)
* [Thymeleaf](https://docs.spring.io/spring-boot/3.5.7/reference/web/servlet.html#web.servlet.spring-mvc.template-engines)
* [Spring Data MongoDB](https://docs.spring.io/spring-boot/3.5.7/reference/data/nosql.html#data.nosql.mongodb)
* [JDBC API](https://docs.spring.io/spring-boot/3.5.7/reference/data/sql.html)
* [Spring Integration](https://docs.spring.io/spring-boot/3.5.7/reference/messaging/spring-integration.html)
* [Spring Boot Actuator](https://docs.spring.io/spring-boot/3.5.7/reference/actuator/index.html)
* [OAuth2 Authorization Server](https://docs.spring.io/spring-boot/3.5.7/reference/web/spring-security.html#web.security.oauth2.authorization-server)

### Guides
The following guides illustrate how to use some features concretely:

* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/rest/)
* [Securing a Web Application](https://spring.io/guides/gs/securing-web/)
* [Spring Boot and OAuth2](https://spring.io/guides/tutorials/spring-boot-oauth2/)
* [Authenticating a User with LDAP](https://spring.io/guides/gs/authenticating-ldap/)
* [Accessing Data with JPA](https://spring.io/guides/gs/accessing-data-jpa/)
* [Handling Form Submission](https://spring.io/guides/gs/handling-form-submission/)
* [Accessing Data with MongoDB](https://spring.io/guides/gs/accessing-data-mongodb/)
* [Accessing Relational Data using JDBC with Spring](https://spring.io/guides/gs/relational-data-access/)
* [Managing Transactions](https://spring.io/guides/gs/managing-transactions/)
* [Integrating Data](https://spring.io/guides/gs/integration/)
* [Building a RESTful Web Service with Spring Boot Actuator](https://spring.io/guides/gs/actuator-service/)

### Docker Compose support
This project contains a Docker Compose file named `compose.yaml`.
In this file, the following services have been defined:

* mongodb: [`mongo:latest`](https://hub.docker.com/_/mongo)
* postgres: [`postgres:latest`](https://hub.docker.com/_/postgres)

Please review the tags of the used images and set them to the same as you're running in production.

### Maven Parent overrides

Due to Maven's design, elements are inherited from the parent POM to the project POM.
While most of the inheritance is fine, it also inherits unwanted elements like `<license>` and `<developers>` from the parent.
To prevent this, the project POM contains empty overrides for these elements.
If you manually switch to a different parent and actually want the inheritance, you need to remove those overrides.

