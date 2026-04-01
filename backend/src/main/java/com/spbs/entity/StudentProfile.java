package com.spbs.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity @Table(name="student_profiles")
public class StudentProfile {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch=FetchType.EAGER) @JoinColumn(name="user_id",nullable=false,unique=true) private User user;
    @Column(name="roll_number",unique=true,length=20) private String rollNumber;
    @Column(length=100) private String department;
    private Integer semester;
    @Column(length=5) private String section;
    @Column(name="date_of_birth") private LocalDate dateOfBirth;
    public StudentProfile(){}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public User getUser(){return user;} public void setUser(User u){this.user=u;}
    public String getRollNumber(){return rollNumber;} public void setRollNumber(String r){this.rollNumber=r;}
    public String getDepartment(){return department;} public void setDepartment(String d){this.department=d;}
    public Integer getSemester(){return semester;} public void setSemester(Integer s){this.semester=s;}
    public String getSection(){return section;} public void setSection(String s){this.section=s;}
    public LocalDate getDateOfBirth(){return dateOfBirth;} public void setDateOfBirth(LocalDate d){this.dateOfBirth=d;}
}
