package com.smartcampus.config;

import com.smartcampus.model.Facility;
import com.smartcampus.model.User;
import com.smartcampus.repository.FacilityRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FacilityRepository facilityRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create default admin
        if (!userRepository.existsByEmail("admin@smartcampus.com")) {
            User admin = User.builder()
                    .email("admin@smartcampus.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("System")
                    .lastName("Admin")
                    .role(User.Role.ADMIN)
                    .department("Administration")
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created: admin@smartcampus.com / admin123");
        }

        // Create sample facilities if none exist
        if (facilityRepository.count() == 0) {
            Facility hall = Facility.builder()
                    .name("Main Auditorium")
                    .description("Large auditorium with stage and AV equipment")
                    .location("Block A, Ground Floor")
                    .building("Block A")
                    .floor(0)
                    .capacity(500)
                    .type(Facility.FacilityType.AUDITORIUM)
                    .amenities(Arrays.asList("Projector", "Microphone", "AC", "Wi-Fi"))
                    .operatingHours("8:00 AM - 8:00 PM")
                    .contactPerson("Admin Office")
                    .contactEmail("admin@smartcampus.com")
                    .build();

            Facility lab = Facility.builder()
                    .name("Computer Lab 1")
                    .description("Fully equipped computer lab with 60 workstations")
                    .location("Block B, 2nd Floor")
                    .building("Block B")
                    .floor(2)
                    .capacity(60)
                    .type(Facility.FacilityType.LAB)
                    .amenities(Arrays.asList("Computers", "Projector", "AC", "Wi-Fi", "Whiteboard"))
                    .operatingHours("8:00 AM - 6:00 PM")
                    .contactPerson("Lab Admin")
                    .contactEmail("lab@smartcampus.com")
                    .build();

            Facility meetingRoom = Facility.builder()
                    .name("Conference Room A")
                    .description("Modern meeting room with video conferencing")
                    .location("Block A, 3rd Floor")
                    .building("Block A")
                    .floor(3)
                    .capacity(20)
                    .type(Facility.FacilityType.MEETING_ROOM)
                    .amenities(Arrays.asList("Video Conference", "Whiteboard", "AC", "Wi-Fi"))
                    .operatingHours("8:00 AM - 6:00 PM")
                    .contactPerson("Admin Office")
                    .contactEmail("admin@smartcampus.com")
                    .build();

            Facility lectureHall = Facility.builder()
                    .name("Lecture Hall 101")
                    .description("Spacious lecture hall with tiered seating")
                    .location("Block C, 1st Floor")
                    .building("Block C")
                    .floor(1)
                    .capacity(150)
                    .type(Facility.FacilityType.LECTURE_HALL)
                    .amenities(Arrays.asList("Projector", "Microphone", "AC", "Wi-Fi", "Podium"))
                    .operatingHours("7:00 AM - 9:00 PM")
                    .contactPerson("Academic Office")
                    .contactEmail("academic@smartcampus.com")
                    .build();

            Facility studyRoom = Facility.builder()
                    .name("Study Room - Library")
                    .description("Quiet study room in the main library")
                    .location("Library Building, 1st Floor")
                    .building("Library")
                    .floor(1)
                    .capacity(30)
                    .type(Facility.FacilityType.STUDY_ROOM)
                    .amenities(Arrays.asList("Wi-Fi", "Power Outlets", "AC", "Quiet Zone"))
                    .operatingHours("7:00 AM - 10:00 PM")
                    .contactPerson("Library Staff")
                    .contactEmail("library@smartcampus.com")
                    .build();

            facilityRepository.saveAll(Arrays.asList(hall, lab, meetingRoom, lectureHall, studyRoom));
            log.info("Sample facilities created");
        }
    }
}
