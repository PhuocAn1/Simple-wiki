package com.phuocan.simple_wiki.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Value("${jwt.signerKey}")
    private String signerKey;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login/**").permitAll()
                        .requestMatchers("/log/**").permitAll()

                        .requestMatchers(HttpMethod.GET,"/users/search").permitAll()
                        .requestMatchers("/users/**").authenticated()

                        .requestMatchers(HttpMethod.GET,"/pages/search").permitAll()
                        .requestMatchers(HttpMethod.GET,"/pages/raw/*").permitAll()
                        .requestMatchers(HttpMethod.GET,"/pages/*").permitAll()
                        .requestMatchers(HttpMethod.POST, "/pages").authenticated()
                        .requestMatchers(HttpMethod.PUT,"/pages/*").authenticated()
                        .requestMatchers(HttpMethod.DELETE,"/pages/*").authenticated()
                        .requestMatchers("/pages/**").authenticated()

                        .requestMatchers("/page-revisions").authenticated()

                        .requestMatchers(HttpMethod.POST,"/media/check-filenames").permitAll()
                        .requestMatchers(HttpMethod.GET, "/media/all").permitAll()
                        .requestMatchers(HttpMethod.GET, "/media/all/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/media/*").permitAll()
                        .requestMatchers("/media/**").authenticated()

                        .requestMatchers("/wiki-markup/**").permitAll()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt((jwt -> jwt
                                .decoder(jwtDecoder())
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())))
                        .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
                );
        http.cors(Customizer.withDefaults());
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("ROLE_"); //Instead of SCOPE_"smt" we will convert it to ROLE_"smt"

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return  jwtAuthenticationConverter;
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }

    @Bean
    JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");

        return NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }
}
