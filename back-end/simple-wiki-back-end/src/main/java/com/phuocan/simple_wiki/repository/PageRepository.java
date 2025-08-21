package com.phuocan.simple_wiki.repository;

import com.phuocan.simple_wiki.model.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PageRepository extends JpaRepository<Page, Long> {
    boolean existsByTitle(String title);

    Optional<Page> findByTitle(String title);

    // Order by similarity length (shorter match = more relevant)
    @Query("SELECT p FROM Page p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY LENGTH(p.title)")
    List<Page> searchPagesByTitle(@Param("query") String query);

}
