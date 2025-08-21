package com.phuocan.simple_wiki.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.phuocan.simple_wiki.apiResponse.ApiResponse;
import com.phuocan.simple_wiki.model.User;
import com.phuocan.simple_wiki.repository.UserRepository;
import com.phuocan.simple_wiki.request.VerifyRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);
    private final PasswordEncoder encoder;

    @Autowired
    public AuthenticationService(UserRepository userRepository) {
        this.userRepository = userRepository;
        encoder = new BCryptPasswordEncoder(10);
    }

    public String authenticate(String username, String password) throws AuthenticationException {
        logger.info("Authenticating user: {}", username);
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isEmpty()) {
            logger.warn("No account found for username: {}", username);
            throw new BadCredentialsException("Unable to find account with username: " + username);
        }

        //PasswordEncoder encoder = new BCryptPasswordEncoder(10);
        boolean isAuthenticated = encoder.matches(password, user.get().getPasswordHash());

        if (!isAuthenticated) {
            logger.warn("Incorrect password for username: {}", username);
            throw new BadCredentialsException("Password is incorrect.");
        }

        logger.info("Authentication successful for username: {}", username);
        return generateToken(user.get());
    }

    public String generateToken(User user) {
        //1. Create a header
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        //2. Create claims

        // TODO: 6/21/2025 Change this time to something else later 
        // Calculate expiration time (1 hour = 3600000 milliseconds)
        Date now = new Date();//Current time
        Date expirationDate = new Date(now.getTime() + 3600000); // 1 hour in milliseconds

        // Build claims
        JWTClaimsSet.Builder claimsBuilder = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("service.com")
                .issueTime(now)
                .expirationTime(expirationDate)
                .claim("userId", user.getUserId());

        JWTClaimsSet jwtClaimsSet = claimsBuilder.build();

        //3. Create a payload
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        //4. Create token
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            logger.error("Cannot create token", e);
            throw new IllegalStateException("Cannot generate JWT", e);
        }
    }

    public boolean validateToken(String token) throws AuthenticationException {
        logger.info("Validating token for user");
        try {
            // Parse the token
            JWSObject jwsObject = JWSObject.parse(token);

            // Verify the signature
            MACVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
            if (!jwsObject.verify(verifier)) {
                logger.warn("Token signature verification failed");
                throw new BadCredentialsException("Invalid token signature");
            }

            // Extract claims
            JWTClaimsSet claims = JWTClaimsSet.parse(jwsObject.getPayload().toJSONObject());
            Date now = new Date();

            // Check expiration
            if (claims.getExpirationTime().before(now)) {
                logger.warn("Token has expired");
                throw new BadCredentialsException("Token has expired");
            }

            // Check issuer
            if (!"service.com".equals(claims.getIssuer())) {
                logger.warn("Invalid token issuer: {}", claims.getIssuer());
                throw new BadCredentialsException("Invalid token issuer");
            }

            // Optional: Verify user exists (e.g., using userId claim)
            String username = claims.getSubject();
            Optional<User> user = userRepository.findByUsername(username);
            if (user.isEmpty()) {
                logger.warn("No user found for token subject: {}", username);
                throw new BadCredentialsException("User not found");
            }

            logger.info("Token validation successful for username: {}", username);
            return true;
        } catch (JOSEException | java.text.ParseException e) {
            logger.error("Token validation failed", e);
            throw new BadCredentialsException("Invalid token: " + e.getMessage());
        }
    }

    public User findUserByToken(String token) throws AuthenticationException {
        logger.info("Finding user by token");
        try {
            JWSObject jwsObject = JWSObject.parse(token);
            MACVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
            if (!jwsObject.verify(verifier)) {
                logger.warn("Token signature verification failed");
                throw new BadCredentialsException("Invalid token signature");
            }

            JWTClaimsSet claims = JWTClaimsSet.parse(jwsObject.getPayload().toJSONObject());
            Date now = new Date();

            if (claims.getExpirationTime().before(now)) {
                logger.warn("Token has expired");
                throw new BadCredentialsException("Token has expired");
            }

            if (!"service.com".equals(claims.getIssuer())) {
                logger.warn("Invalid token issuer: {}", claims.getIssuer());
                throw new BadCredentialsException("Invalid token issuer");
            }

            String username = claims.getSubject();
            Optional<User> user = userRepository.findByUsername(username);
            if (user.isEmpty()) {
                logger.warn("No user found for token subject: {}", username);
                throw new BadCredentialsException("User not found");
            }

            logger.info("User found for token: {}", username);
            return user.get();
        } catch (JOSEException | java.text.ParseException e) {
            logger.error("Token parsing failed", e);
            throw new BadCredentialsException("Invalid token: " + e.getMessage());
        }
    }

    public ResponseEntity<ApiResponse<String>> verifyID(VerifyRequest request) {
        try  {
            String username = request.getUsername().trim();
            if (!userRepository.existsByUsername(username)) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "Unable to find user with username: " + username);
            }
            User user = userRepository.findByUsername(username).get();

            if (!user.getUserId().equals(request.getUserId())) {
                return ApiResponse.error(HttpStatus.UNAUTHORIZED, "Invalid credential");
            }

            String password = request.getPassword().trim();
            boolean isVerified = encoder.matches(password, user.getPasswordHash());
            if (!isVerified) {
                return ApiResponse.error(HttpStatus.UNAUTHORIZED, "Incorrect password.");
            }

            return ApiResponse.success(HttpStatus.OK, "User ID is verified");
        } catch (Exception e) {
            logger.error("Unable to verify the ID: ", e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to verify the ID: " + e.getMessage());
        }
    }
}
