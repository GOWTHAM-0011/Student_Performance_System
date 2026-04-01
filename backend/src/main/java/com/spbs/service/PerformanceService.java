package com.spbs.service;
import com.spbs.dto.PerformanceDto;
import com.spbs.entity.*;
import com.spbs.exception.ResourceNotFoundException;
import com.spbs.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PerformanceService {
    private final PerformanceRepository perfRepo;
    private final StudentProfileRepository studentRepo;
    private final FacultyProfileRepository facultyRepo;

    public PerformanceService(PerformanceRepository p, StudentProfileRepository s, FacultyProfileRepository f){
        perfRepo=p; studentRepo=s; facultyRepo=f;
    }

    public List<PerformanceDto.Response> getAll(){ return perfRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList()); }
    public List<PerformanceDto.Response> getByStudent(Long sid){ return perfRepo.findByStudentId(sid).stream().map(this::toResponse).collect(Collectors.toList()); }

    @Transactional
    public PerformanceDto.Response add(PerformanceDto.Request req){
        StudentProfile sp = studentRepo.findById(req.getStudentId()).orElseThrow(()->new ResourceNotFoundException("Student not found: "+req.getStudentId()));
        Performance p=new Performance();
        p.setStudent(sp); p.setSubject(req.getSubject()); p.setSubjectCode(req.getSubjectCode());
        p.setMarksObtained(req.getMarksObtained()); p.setMaxMarks(req.getMaxMarks()!=null?req.getMaxMarks():100.0);
        if(req.getExamType()!=null) p.setExamType(req.getExamType()); else p.setExamType(Performance.ExamType.MID_TERM);
        if(req.getExamDate()!=null && !req.getExamDate().isBlank()) p.setExamDate(LocalDate.parse(req.getExamDate()));
        p.setSemester(req.getSemester()); p.setGrade(req.getGrade()); p.setRemarks(req.getRemarks());
        return toResponse(perfRepo.save(p));
    }

    @Transactional
    public PerformanceDto.Response update(Long id, PerformanceDto.Request req){
        Performance p=perfRepo.findById(id).orElseThrow(()->new ResourceNotFoundException("Record not found: "+id));
        if(req.getSubject()!=null) p.setSubject(req.getSubject());
        if(req.getSubjectCode()!=null) p.setSubjectCode(req.getSubjectCode());
        if(req.getMarksObtained()!=null) p.setMarksObtained(req.getMarksObtained());
        if(req.getMaxMarks()!=null) p.setMaxMarks(req.getMaxMarks());
        if(req.getExamType()!=null) p.setExamType(req.getExamType());
        if(req.getExamDate()!=null && !req.getExamDate().isBlank()) p.setExamDate(LocalDate.parse(req.getExamDate()));
        if(req.getSemester()!=null) p.setSemester(req.getSemester());
        if(req.getGrade()!=null) p.setGrade(req.getGrade());
        if(req.getRemarks()!=null) p.setRemarks(req.getRemarks());
        return toResponse(perfRepo.save(p));
    }

    @Transactional
    public void delete(Long id){
        if(!perfRepo.existsById(id)) throw new ResourceNotFoundException("Record not found: "+id);
        perfRepo.deleteById(id);
    }

    @Transactional(readOnly=true)
    public PerformanceDto.Analytics getAnalytics(Long studentId){
        StudentProfile sp = studentRepo.findById(studentId).orElseThrow(()->new ResourceNotFoundException("Student not found: "+studentId));
        List<Performance> recs = perfRepo.findByStudentId(studentId);
        Map<String,Double> subjectPct = buildSubjectPct(recs);
        Map<String,Double> classAvg   = buildClassAvg();
        double overall = subjectPct.values().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        List<String> strengths  = subjectPct.entrySet().stream().filter(e->e.getValue()>=75).map(Map.Entry::getKey).collect(Collectors.toList());
        List<String> weaknesses = subjectPct.entrySet().stream().filter(e->e.getValue()<55).map(Map.Entry::getKey).collect(Collectors.toList());
        List<StudentProfile> all = studentRepo.findAll();
        int rank = 1;
        for(StudentProfile s: all){
            if(!s.getId().equals(studentId) && avgFor(s.getId()) > overall) rank++;
        }
        PerformanceDto.Analytics a=new PerformanceDto.Analytics();
        a.setStudentId(studentId); a.setStudentName(sp.getUser().getFullName()); a.setRollNumber(sp.getRollNumber());
        a.setOverallPct(round1(overall)); a.setOverallGrade(gradeFor(overall)); a.setRank(rank); a.setTotalStudents(all.size());
        a.setCategory(categoryFor(overall)); a.setSubjectPct(subjectPct); a.setClassAvg(classAvg);
        a.setStrengths(strengths); a.setWeaknesses(weaknesses);
        a.setRecords(recs.stream().map(this::toResponse).collect(Collectors.toList()));
        return a;
    }

    @Transactional(readOnly=true)
    public PerformanceDto.DashboardStats getDashboardStats(){
        List<StudentProfile> all = studentRepo.findAll();
        Map<String,Double> classAvg = buildClassAvg();
        double overallAvg = all.stream().mapToDouble(s->avgFor(s.getId())).average().orElse(0.0);
        long top = all.stream().filter(s->avgFor(s.getId())>=75).count();
        long low = all.stream().filter(s->avgFor(s.getId())<50).count();
        Map<String,Long> gradeDist = new LinkedHashMap<>();
        gradeDist.put("A+(>=90)", all.stream().filter(s->avgFor(s.getId())>=90).count());
        gradeDist.put("A(80-89)", all.stream().filter(s->{double v=avgFor(s.getId());return v>=80&&v<90;}).count());
        gradeDist.put("B(70-79)", all.stream().filter(s->{double v=avgFor(s.getId());return v>=70&&v<80;}).count());
        gradeDist.put("C(60-69)", all.stream().filter(s->{double v=avgFor(s.getId());return v>=60&&v<70;}).count());
        gradeDist.put("F(<60)",   all.stream().filter(s->avgFor(s.getId())<60).count());
        List<PerformanceDto.Analytics> sorted = all.stream()
                .sorted((a,b)->Double.compare(avgFor(b.getId()),avgFor(a.getId())))
                .map(s->getAnalytics(s.getId())).collect(Collectors.toList());
        PerformanceDto.DashboardStats stats=new PerformanceDto.DashboardStats();
        stats.setTotalStudents(all.size()); stats.setClassAvg(round1(overallAvg));
        stats.setTopPerformers(top); stats.setNeedsAttention(low);
        stats.setSubjectAvg(classAvg); stats.setGradeDist(gradeDist);
        stats.setTopStudents(sorted.stream().limit(5).collect(Collectors.toList()));
        stats.setLowStudents(sorted.stream().filter(a->a.getOverallPct()<60).collect(Collectors.toList()));
        return stats;
    }

    private double avgFor(Long sid){
        List<Performance> r=perfRepo.findByStudentId(sid);
        if(r.isEmpty()) return 0.0;
        return r.stream().mapToDouble(p->p.getMarksObtained()/p.getMaxMarks()*100.0).average().orElse(0.0);
    }

    private Map<String,Double> buildSubjectPct(List<Performance> recs){
        Map<String,List<Double>> g=new LinkedHashMap<>();
        for(Performance r:recs) g.computeIfAbsent(r.getSubject(),k->new ArrayList<>()).add(r.getMarksObtained()/r.getMaxMarks()*100.0);
        Map<String,Double> out=new LinkedHashMap<>();
        g.forEach((k,v)->out.put(k,round1(v.stream().mapToDouble(Double::doubleValue).average().orElse(0.0))));
        return out;
    }

    private Map<String,Double> buildClassAvg(){
        List<Object[]> rows=perfRepo.findClassAverageBySubject();
        Map<String,Double> m=new LinkedHashMap<>();
        for(Object[] row:rows) m.put((String)row[0], round1(((Number)row[1]).doubleValue()));
        return m;
    }

    private double round1(double v){ return Math.round(v*10.0)/10.0; }

    private String gradeFor(double p){
        if(p>=90) return "A+"; if(p>=80) return "A"; if(p>=70) return "B+";
        if(p>=60) return "B";  if(p>=50) return "C"; return "F";
    }
    private String categoryFor(double p){
        if(p>=85) return "Outstanding"; if(p>=75) return "Excellent";
        if(p>=65) return "Good"; if(p>=50) return "Average"; return "Needs Improvement";
    }

    public PerformanceDto.Response toResponse(Performance p){
        PerformanceDto.Response r=new PerformanceDto.Response();
        r.setId(p.getId()); r.setStudentId(p.getStudent().getId());
        r.setStudentName(p.getStudent().getUser().getFullName()); r.setRollNumber(p.getStudent().getRollNumber());
        r.setSubject(p.getSubject()); r.setSubjectCode(p.getSubjectCode());
        r.setMarksObtained(p.getMarksObtained()); r.setMaxMarks(p.getMaxMarks());
        r.setPercentage(round1(p.getMarksObtained()/p.getMaxMarks()*100.0));
        r.setExamType(p.getExamType()); r.setExamDate(p.getExamDate());
        r.setSemester(p.getSemester()); r.setGrade(p.getGrade()); r.setRemarks(p.getRemarks());
        return r;
    }
}
