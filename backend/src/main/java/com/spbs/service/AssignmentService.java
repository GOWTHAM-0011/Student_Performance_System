package com.spbs.service;
import com.spbs.dto.AssignmentDto;
import com.spbs.entity.*;
import com.spbs.exception.*;
import com.spbs.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssignmentService {
    private final AssignmentRepository assignRepo;
    private final FacultyProfileRepository facultyRepo;
    private final StudentProfileRepository studentRepo;

    public AssignmentService(AssignmentRepository a, FacultyProfileRepository f, StudentProfileRepository s){
        assignRepo=a; facultyRepo=f; studentRepo=s;
    }

    public List<AssignmentDto.Response> getAll(){ return assignRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList()); }
    public List<AssignmentDto.Response> getByFaculty(Long fid){ return assignRepo.findByFacultyId(fid).stream().map(this::toResponse).collect(Collectors.toList()); }

    @Transactional
    public AssignmentDto.Response assign(AssignmentDto.Request req){
        FacultyProfile fp = facultyRepo.findById(req.getFacultyId()).orElseThrow(()->new ResourceNotFoundException("Faculty not found: "+req.getFacultyId()));
        StudentProfile sp = studentRepo.findById(req.getStudentId()).orElseThrow(()->new ResourceNotFoundException("Student not found: "+req.getStudentId()));
        if(assignRepo.existsByFacultyIdAndStudentId(req.getFacultyId(),req.getStudentId())) throw new DuplicateResourceException("Already assigned");
        Assignment a=new Assignment(); a.setFaculty(fp); a.setStudent(sp);
        return toResponse(assignRepo.save(a));
    }

    @Transactional
    public void remove(Long id){
        if(!assignRepo.existsById(id)) throw new ResourceNotFoundException("Assignment not found: "+id);
        assignRepo.deleteById(id);
    }

    private AssignmentDto.Response toResponse(Assignment a){
        AssignmentDto.Response r=new AssignmentDto.Response();
        r.setId(a.getId()); r.setFacultyId(a.getFaculty().getId());
        r.setFacultyName(a.getFaculty().getUser().getFullName()); r.setEmployeeCode(a.getFaculty().getEmployeeCode());
        r.setStudentId(a.getStudent().getId()); r.setStudentName(a.getStudent().getUser().getFullName());
        r.setRollNumber(a.getStudent().getRollNumber());
        return r;
    }
}
