package com.spbs.entity;
import jakarta.persistence.*;
@Entity @Table(name="faculty_profiles")
public class FacultyProfile {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch=FetchType.EAGER) @JoinColumn(name="user_id",nullable=false,unique=true) private User user;
    @Column(name="employee_code",unique=true,length=20) private String employeeCode;
    @Column(length=100) private String department;
    @Column(length=100) private String specialization;
    public FacultyProfile(){}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public User getUser(){return user;} public void setUser(User u){this.user=u;}
    public String getEmployeeCode(){return employeeCode;} public void setEmployeeCode(String e){this.employeeCode=e;}
    public String getDepartment(){return department;} public void setDepartment(String d){this.department=d;}
    public String getSpecialization(){return specialization;} public void setSpecialization(String s){this.specialization=s;}
}
