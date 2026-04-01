package com.spbs.dto;
import com.spbs.entity.Performance;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
public class PerformanceDto {
    public static class Request {
        @NotNull private Long studentId;
        @NotBlank private String subject;
        private String subjectCode;
        @NotNull @Min(0) private Double marksObtained;
        @NotNull @Min(1) private Double maxMarks;
        private Performance.ExamType examType;
        private String examDate;
        private Integer semester;
        private String grade; private String remarks;
        public Request(){}
        public Long getStudentId(){return studentId;} public void setStudentId(Long s){this.studentId=s;}
        public String getSubject(){return subject;} public void setSubject(String s){this.subject=s;}
        public String getSubjectCode(){return subjectCode;} public void setSubjectCode(String s){this.subjectCode=s;}
        public Double getMarksObtained(){return marksObtained;} public void setMarksObtained(Double m){this.marksObtained=m;}
        public Double getMaxMarks(){return maxMarks;} public void setMaxMarks(Double m){this.maxMarks=m;}
        public Performance.ExamType getExamType(){return examType;} public void setExamType(Performance.ExamType e){this.examType=e;}
        public String getExamDate(){return examDate;} public void setExamDate(String d){this.examDate=d;}
        public Integer getSemester(){return semester;} public void setSemester(Integer s){this.semester=s;}
        public String getGrade(){return grade;} public void setGrade(String g){this.grade=g;}
        public String getRemarks(){return remarks;} public void setRemarks(String r){this.remarks=r;}
    }
    public static class Response {
        private Long id; private Long studentId; private String studentName; private String rollNumber;
        private String subject; private String subjectCode; private Double marksObtained; private Double maxMarks;
        private Double percentage; private Performance.ExamType examType; private LocalDate examDate;
        private Integer semester; private String grade; private String remarks;
        public Response(){}
        public Long getId(){return id;} public void setId(Long id){this.id=id;}
        public Long getStudentId(){return studentId;} public void setStudentId(Long s){this.studentId=s;}
        public String getStudentName(){return studentName;} public void setStudentName(String s){this.studentName=s;}
        public String getRollNumber(){return rollNumber;} public void setRollNumber(String r){this.rollNumber=r;}
        public String getSubject(){return subject;} public void setSubject(String s){this.subject=s;}
        public String getSubjectCode(){return subjectCode;} public void setSubjectCode(String s){this.subjectCode=s;}
        public Double getMarksObtained(){return marksObtained;} public void setMarksObtained(Double m){this.marksObtained=m;}
        public Double getMaxMarks(){return maxMarks;} public void setMaxMarks(Double m){this.maxMarks=m;}
        public Double getPercentage(){return percentage;} public void setPercentage(Double p){this.percentage=p;}
        public Performance.ExamType getExamType(){return examType;} public void setExamType(Performance.ExamType e){this.examType=e;}
        public LocalDate getExamDate(){return examDate;} public void setExamDate(LocalDate d){this.examDate=d;}
        public Integer getSemester(){return semester;} public void setSemester(Integer s){this.semester=s;}
        public String getGrade(){return grade;} public void setGrade(String g){this.grade=g;}
        public String getRemarks(){return remarks;} public void setRemarks(String r){this.remarks=r;}
    }
    public static class Analytics {
        private Long studentId; private String studentName; private String rollNumber;
        private Double overallPct; private String overallGrade; private Integer rank; private Integer totalStudents;
        private String category; private Map<String,Double> subjectPct; private Map<String,Double> classAvg;
        private List<String> strengths; private List<String> weaknesses; private List<Response> records;
        public Analytics(){}
        public Long getStudentId(){return studentId;} public void setStudentId(Long s){this.studentId=s;}
        public String getStudentName(){return studentName;} public void setStudentName(String s){this.studentName=s;}
        public String getRollNumber(){return rollNumber;} public void setRollNumber(String r){this.rollNumber=r;}
        public Double getOverallPct(){return overallPct;} public void setOverallPct(Double o){this.overallPct=o;}
        public String getOverallGrade(){return overallGrade;} public void setOverallGrade(String g){this.overallGrade=g;}
        public Integer getRank(){return rank;} public void setRank(Integer r){this.rank=r;}
        public Integer getTotalStudents(){return totalStudents;} public void setTotalStudents(Integer t){this.totalStudents=t;}
        public String getCategory(){return category;} public void setCategory(String c){this.category=c;}
        public Map<String,Double> getSubjectPct(){return subjectPct;} public void setSubjectPct(Map<String,Double> m){this.subjectPct=m;}
        public Map<String,Double> getClassAvg(){return classAvg;} public void setClassAvg(Map<String,Double> m){this.classAvg=m;}
        public List<String> getStrengths(){return strengths;} public void setStrengths(List<String> s){this.strengths=s;}
        public List<String> getWeaknesses(){return weaknesses;} public void setWeaknesses(List<String> w){this.weaknesses=w;}
        public List<Response> getRecords(){return records;} public void setRecords(List<Response> r){this.records=r;}
    }
    public static class DashboardStats {
        private long totalStudents; private long totalFaculty; private double classAvg;
        private long topPerformers; private long needsAttention;
        private Map<String,Double> subjectAvg; private Map<String,Long> gradeDist;
        private List<Analytics> topStudents; private List<Analytics> lowStudents;
        public DashboardStats(){}
        public long getTotalStudents(){return totalStudents;} public void setTotalStudents(long t){this.totalStudents=t;}
        public long getTotalFaculty(){return totalFaculty;} public void setTotalFaculty(long t){this.totalFaculty=t;}
        public double getClassAvg(){return classAvg;} public void setClassAvg(double c){this.classAvg=c;}
        public long getTopPerformers(){return topPerformers;} public void setTopPerformers(long t){this.topPerformers=t;}
        public long getNeedsAttention(){return needsAttention;} public void setNeedsAttention(long n){this.needsAttention=n;}
        public Map<String,Double> getSubjectAvg(){return subjectAvg;} public void setSubjectAvg(Map<String,Double> m){this.subjectAvg=m;}
        public Map<String,Long> getGradeDist(){return gradeDist;} public void setGradeDist(Map<String,Long> m){this.gradeDist=m;}
        public List<Analytics> getTopStudents(){return topStudents;} public void setTopStudents(List<Analytics> l){this.topStudents=l;}
        public List<Analytics> getLowStudents(){return lowStudents;} public void setLowStudents(List<Analytics> l){this.lowStudents=l;}
    }
}
