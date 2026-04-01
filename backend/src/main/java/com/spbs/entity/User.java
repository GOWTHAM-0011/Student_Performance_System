package com.spbs.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name = "users")
public class User {
    public enum Role { ADMIN, FACULTY, STUDENT }
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique=true,nullable=false,length=50) private String username;
    @Column(unique=true,nullable=false,length=100) private String email;
    @Column(nullable=false) private String password;
    @Column(name="full_name",nullable=false,length=100) private String fullName;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Role role;
    @Column(nullable=false) private boolean active=true;
    @Column(name="created_at",updatable=false) private LocalDateTime createdAt;
    @PrePersist protected void onCreate(){this.createdAt=LocalDateTime.now();}
    public User(){}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getUsername(){return username;} public void setUsername(String u){this.username=u;}
    public String getEmail(){return email;} public void setEmail(String e){this.email=e;}
    public String getPassword(){return password;} public void setPassword(String p){this.password=p;}
    public String getFullName(){return fullName;} public void setFullName(String f){this.fullName=f;}
    public Role getRole(){return role;} public void setRole(Role r){this.role=r;}
    public boolean isActive(){return active;} public void setActive(boolean a){this.active=a;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime c){this.createdAt=c;}
}
