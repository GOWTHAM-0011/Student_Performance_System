package com.spbs.repository;
import com.spbs.entity.FacultyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface FacultyProfileRepository extends JpaRepository<FacultyProfile,Long> {
    Optional<FacultyProfile> findByUserId(Long userId);
    Optional<FacultyProfile> findByEmployeeCode(String code);
}
