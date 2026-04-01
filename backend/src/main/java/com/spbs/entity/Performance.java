package com.spbs.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity @Table(name="performance")
public class Performance {
    public enum ExamType { MID_TERM, FINAL, QUIZ, ASSIGNMENT, PRACTICAL }
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="student_id",nullable=false) private StudentProfile student;
    @Column(nullable=false,length=100) private String subject;
    @Column(name="subject_code",length=20) private String subjectCode;
    @Column(name="marks_obtained",nullable=false) private Double marksObtained;
    @Column(name="max_marks",nullable=false) private Double maxMarks=100.0;
    @Enumerated(EnumType.STRING) @Column(name="exam_type",length=20) private ExamType examType=ExamType.MID_TERM;
    @Column(name="exam_date") private LocalDate examDate;
    private Integer semester;
    @Column(length=5) private String grade;
    @Column(length=255) private String remarks;
    public Performance(){}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public StudentProfile getStudent(){return student;} public void setStudent(StudentProfile s){this.student=s;}
    public String getSubject(){return subject;} public void setSubject(String s){this.subject=s;}
    public String getSubjectCode(){return subjectCode;} public void setSubjectCode(String s){this.subjectCode=s;}
    public Double getMarksObtained(){return marksObtained;} public void setMarksObtained(Double m){this.marksObtained=m;}
    public Double getMaxMarks(){return maxMarks;} public void setMaxMarks(Double m){this.maxMarks=m;}
    public ExamType getExamType(){return examType;} public void setExamType(ExamType e){this.examType=e;}
    public LocalDate getExamDate(){return examDate;} public void setExamDate(LocalDate d){this.examDate=d;}
    public Integer getSemester(){return semester;} public void setSemester(Integer s){this.semester=s;}
    public String getGrade(){return grade;} public void setGrade(String g){this.grade=g;}
    public String getRemarks(){return remarks;} public void setRemarks(String r){this.remarks=r;}
}
