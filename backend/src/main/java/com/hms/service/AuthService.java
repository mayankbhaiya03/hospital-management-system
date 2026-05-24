package com.hms.service;

import com.hms.dto.AuthResponse;
import com.hms.dto.LoginRequest;
import com.hms.dto.RegistrationRequest;
import com.hms.model.Doctor;
import com.hms.model.Patient;
import com.hms.model.User;
import com.hms.repository.DoctorRepository;
import com.hms.repository.PatientRepository;
import com.hms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    public AuthResponse login(LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByUsername(request.getUsername());

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("Invalid username or password");
        }

        User user = optionalUser.get();

        // Plain-text password comparison (matches how passwords are stored in seed.sql)
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        return buildAuthResponse(user, "Login Successful");
    }

    @Transactional
    public AuthResponse registerPatient(RegistrationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Create the User entity
        User user = new User(
                request.getUsername(),
                request.getPassword(),
                request.getRole() != null ? request.getRole() : "PATIENT",
                request.getFullName(),
                request.getEmail(),
                request.getPhone()
        );
        user = userRepository.save(user);

        // Create role-specific entity
        switch (user.getRole()) {
            case "DOCTOR":
                Doctor doctor = new Doctor(
                        user,
                        request.getSpecialization(),
                        request.getDepartment(),
                        null, // experience not collected during registration
                        null, // consultation fee not collected during registration
                        "AVAILABLE"
                );
                doctorRepository.save(doctor);
                break;

            case "PATIENT":
                Patient patient = new Patient(
                        user,
                        request.getDateOfBirth(),
                        request.getGender(),
                        request.getBloodGroup(),
                        request.getAddress(),
                        "No previous medical history recorded."
                );
                patientRepository.save(patient);
                break;

            // ADMIN and RECEPTIONIST only need a User record
            default:
                break;
        }

        return buildAuthResponse(user, "Registration Successful");
    }

    /**
     * Builds a full AuthResponse with user details and the role-specific entity ID.
     */
    private AuthResponse buildAuthResponse(User user, String message) {
        AuthResponse response = new AuthResponse();
        response.setMessage(message);
        response.setSuccess(true);
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setRole(user.getRole());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());

        // Attach the doctor/patient entity ID so dashboards can fetch role-specific data
        switch (user.getRole()) {
            case "DOCTOR":
                doctorRepository.findByUserId(user.getId())
                        .ifPresent(doc -> response.setEntityId(doc.getId()));
                break;
            case "PATIENT":
                patientRepository.findByUserId(user.getId())
                        .ifPresent(pat -> response.setEntityId(pat.getId()));
                break;
            default:
                break;
        }

        return response;
    }
}