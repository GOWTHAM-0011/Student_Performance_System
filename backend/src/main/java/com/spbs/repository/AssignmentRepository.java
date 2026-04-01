package com.spbs.repository;
import com.spbs.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface AssignmentRepository extends JpaRepository<Assignment,Long> {
    List<Assignment> findByFacultyId(Long facultyId);
    List<Assignment> findByStudentId(Long studentId);
    Optional<Assignment> findByFacultyIdAndStudentId(Long facultyId, Long studentId);
    boolean existsByFacultyIdAndStudentId(Long facultyId, Long studentId);
    void deleteByFacultyIdAndStudentId(Long facultyId, Long studentId);
}
