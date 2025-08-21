package com.phuocan.simple_wiki.repository;

import com.phuocan.simple_wiki.model.Multimedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MultimediaRepository extends JpaRepository<Multimedia, Long> {
    boolean existsByFileName(String fileName);
    Optional<Multimedia> findByFileName(String fileName);
    @Query("SELECT m FROM Multimedia m ORDER BY m.uploadedAt DESC")
    List<Multimedia> findAllOrderedByUploadedAtDesc();
    @Query("SELECT m FROM Multimedia m JOIN m.user u WHERE u.username = :username ORDER BY m.uploadedAt DESC")
    List<Multimedia> findAllByUsernameOrderedByUploadedAtDesc(@Param("username") String username);

}
