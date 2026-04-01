package com.spbs.config;
import com.spbs.entity.User;
import com.spbs.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepo;
    public CustomUserDetailsService(UserRepository userRepo){this.userRepo=userRepo;}
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = userRepo.findByUsername(username)
                .orElseThrow(()->new UsernameNotFoundException("User not found: "+username));
        return new org.springframework.security.core.userdetails.User(
                u.getUsername(), u.getPassword(), u.isActive(), true, true, true,
                List.of(new SimpleGrantedAuthority("ROLE_"+u.getRole().name())));
    }
}
