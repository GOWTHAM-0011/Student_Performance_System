package com.spbs.dto;
import jakarta.validation.constraints.NotNull;
public class AssignmentDto {
    public static class Request {
        @NotNull private Long facultyId; @NotNull private Long studentId;
        public Request(){}
        public Long getFacultyId(){return facultyId;} public void setFacultyId(Long f){this.facultyId=f;}
        public Long getStudentId(){return studentId;} public void setStudentId(Long s){this.studentId=s;}
    }
    public static class Response {
        private Long id; private Long facultyId; private String facultyName; private String employeeCode;
        private Long studentId; private String studentName; private String rollNumber;
        public Response(){}
        public Long getId(){return id;} public void setId(Long id){this.id=id;}
        public Long getFacultyId(){return facultyId;} public void setFacultyId(Long f){this.facultyId=f;}
        public String getFacultyName(){return facultyName;} public void setFacultyName(String f){this.facultyName=f;}
        public String getEmployeeCode(){return employeeCode;} public void setEmployeeCode(String e){this.employeeCode=e;}
        public Long getStudentId(){return studentId;} public void setStudentId(Long s){this.studentId=s;}
        public String getStudentName(){return studentName;} public void setStudentName(String s){this.studentName=s;}
        public String getRollNumber(){return rollNumber;} public void setRollNumber(String r){this.rollNumber=r;}
    }
}
