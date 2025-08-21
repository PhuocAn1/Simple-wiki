package com.phuocan.simple_wiki.repository;

import com.phuocan.simple_wiki.model.PageRevision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PageRevisionRepository extends JpaRepository<PageRevision, Long> {
    @Query("SELECT pr FROM PageRevision pr WHERE pr.page.pageId = :pageId ORDER BY pr.createdAt DESC LIMIT 1")
    Optional<PageRevision> findTopByPageIdOrderByCreatedAtDesc(Long pageId);
}
