package com.spbs.dto;

import com.spbs.entity.User;
import jakarta.validation.constraints.*;

public class UserDto {

    public static class LoginRequest {
        @NotBlank private String username;
        @NotBlank private String password;
        public LoginRequest() {}
        public String getUsername() { return username; }
        public void setUsername(String u) { this.username = u; }
        public String getPassword() { return password; }
        public void setPassword(String p) { this.password = p; }
    }

    public static class CreateRequest {
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50, message = "Username must be 3-50 chars")
        private String username;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotNull(message = "Role is required")
        private User.Role role;

        // Student fields
        private String rollNumber;
        private String department;
        private Integer semester;
        private String section;
        private String dateOfBirth;

        // Faculty fields
        private String employeeCode;
        private String specialization;

        public CreateRequest() {}
        public String getUsername() { return username; }
        public void setUsername(String u) { this.username = u; }
        public String getEmail() { return email; }
        public void setEmail(String e) { this.email = e; }
        public String getPassword() { return password; }
        public void setPassword(String p) { this.password = p; }
        public String getFullName() { return fullName; }
        public void setFullName(String f) { this.fullName = f; }
        public User.Role getRole() { return role; }
        public void setRole(User.Role r) { this.role = r; }
        public String getRollNumber() { return rollNumber; }
        public void setRollNumber(String r) { this.rollNumber = r; }
        public String getDepartment() { return department; }
        public void setDepartment(String d) { this.department = d; }
        public Integer getSemester() { return semester; }
        public void setSemester(Integer s) { this.semester = s; }
        public String getSection() { return section; }
        public void setSection(String s) { this.section = s; }
        public String getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(String d) { this.dateOfBirth = d; }
        public String getEmployeeCode() { return employeeCode; }
        public void setEmployeeCode(String e) { this.employeeCode = e; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String s) { this.specialization = s; }
    }

    public static class UpdateRequest {
        private String email;
        private String fullName;
        private String password;
        private Boolean active;
        private String department;
        private Integer semester;
        private String section;
        private String specialization;

        public UpdateRequest() {}
        public String getEmail() { return email; }
        public void setEmail(String e) { this.email = e; }
        public String getFullName() { return fullName; }
        public void setFullName(String f) { this.fullName = f; }
        public String getPassword() { return password; }
        public void setPassword(String p) { this.password = p; }
        public Boolean getActive() { return active; }
        public void setActive(Boolean a) { this.active = a; }
        public String getDepartment() { return department; }
        public void setDepartment(String d) { this.department = d; }
        public Integer getSemester() { return semester; }
        public void setSemester(Integer s) { this.semester = s; }
        public String getSection() { return section; }
        public void setSection(String s) { this.section = s; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String s) { this.specialization = s; }
    }

    public static class Response {
        private Long id;          // user id
        private Long profileId;   // student/faculty profile id (for API calls that need it)
        private String username;
        private String email;
        private String fullName;
        private User.Role role;
        private boolean active;
        // Student extras
        private String rollNumber;
        private String department;
        private Integer semester;
        private String section;
        // Faculty extras
        private String employeeCode;
        private String specialization;

        public Response() {}
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getProfileId() { return profileId; }
        public void setProfileId(Long profileId) { this.profileId = profileId; }
        public String getUsername() { return username; }
        public void setUsername(String u) { this.username = u; }
        public String getEmail() { return email; }
        public void setEmail(String e) { this.email = e; }
        public String getFullName() { return fullName; }
        public void setFullName(String f) { this.fullName = f; }
        public User.Role getRole() { return role; }
        public void setRole(User.Role r) { this.role = r; }
        public boolean isActive() { return active; }
        public void setActive(boolean a) { this.active = a; }
        public String getRollNumber() { return rollNumber; }
        public void setRollNumber(String r) { this.rollNumber = r; }
        public String getDepartment() { return department; }
        public void setDepartment(String d) { this.department = d; }
        public Integer getSemester() { return semester; }
        public void setSemester(Integer s) { this.semester = s; }
        public String getSection() { return section; }
        public void setSection(String s) { this.section = s; }
        public String getEmployeeCode() { return employeeCode; }
        public void setEmployeeCode(String e) { this.employeeCode = e; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String s) { this.specialization = s; }
    }
}
