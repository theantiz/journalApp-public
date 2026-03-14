package com.antiz.journalApp.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition
public class SwaggerConfig {  // ❌ Remove @SecurityScheme annotation

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Journal App APIs")
                        .description("Crafted by Antiz")
                        .version("1.0.0"))
                .addServersItem(new Server().url("http://localhost:8080/journal").description("Development"))
                .addServersItem(new Server().url("http://localhost:8081").description("Local Testing"))
                .addServersItem(new Server().url("http://localhost:8082").description("Production"))
                .addTagsItem(new Tag().name("Public APIs").description("Public endpoints"))
                .addTagsItem(new Tag().name("User APIs").description("User management"))
                .addTagsItem(new Tag().name("Journal APIs").description("Journal entries"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()  // ✅ Only programmatic SecurityScheme
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
