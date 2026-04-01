package com.spbs.entity;
import jakarta.persistence.*;
@Entity @Table(name="assignments", uniqueConstraints=@UniqueConstraint(columnNames={"faculty_id","student_id"}))
public class Assignment {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="faculty_id",nullable=false) private FacultyProfile faculty;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="student_id",nullable=false) private StudentProfile student;
    public Assignment(){}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public FacultyProfile getFaculty(){return faculty;} public void setFaculty(FacultyProfile f){this.faculty=f;}
    public StudentProfile getStudent(){return student;} public void setStudent(StudentProfile s){this.student=s;}
}
