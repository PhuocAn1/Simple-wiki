package com.phuocan.simple_wiki.repository;

import com.phuocan.simple_wiki.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByUsername(String username);

    // Basic partial match
    List<User> findByUsernameContainingIgnoreCase(String query);

    // Optional: Order by similarity length (shorter match = more relevant)
    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY LENGTH(u.username)")
    List<User> searchUsernames(@Param("query") String query);
}
