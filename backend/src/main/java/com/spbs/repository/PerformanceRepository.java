package com.spbs.repository;
import com.spbs.entity.Performance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface PerformanceRepository extends JpaRepository<Performance,Long> {
    List<Performance> findByStudentId(Long studentId);
    List<Performance> findByStudentIdAndSemester(Long studentId, Integer semester);
    @Query("SELECT p.subject, AVG(p.marksObtained*100.0/p.maxMarks) FROM Performance p GROUP BY p.subject")
    List<Object[]> findClassAverageBySubject();
    @Query("SELECT p.subject, AVG(p.marksObtained*100.0/p.maxMarks) FROM Performance p WHERE p.student.id=:sid GROUP BY p.subject")
    List<Object[]> findSubjectAvgByStudent(@Param("sid") Long studentId);
    @Query("SELECT p FROM Performance p WHERE p.student.id IN :ids")
    List<Performance> findByStudentIdIn(@Param("ids") List<Long> ids);
}
