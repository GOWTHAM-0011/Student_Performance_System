package com.spbs.repository;
import com.spbs.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile,Long> {
    Optional<StudentProfile> findByUserId(Long userId);
    Optional<StudentProfile> findByRollNumber(String rollNumber);
    @Query(value="SELECT sp.* FROM student_profiles sp JOIN assignments a ON sp.id=a.student_id WHERE a.faculty_id=:fid", nativeQuery=true)
    List<StudentProfile> findByFacultyId(@Param("fid") Long facultyId);
}
