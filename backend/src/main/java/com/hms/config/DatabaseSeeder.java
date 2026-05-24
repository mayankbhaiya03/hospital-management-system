package com.hms.config;

import com.hms.model.Bed;
import com.hms.model.OperationTheater;
import com.hms.repository.BedRepository;
import com.hms.repository.OperationTheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private OperationTheaterRepository operationTheaterRepository;

    @Override
    public void run(String... args) throws Exception {
        if (bedRepository.count() == 0) {
            System.out.println("Seeding default beds...");
            bedRepository.saveAll(Arrays.asList(
                    new Bed("ICU-101", "ICU", "AVAILABLE", 2500.00),
                    new Bed("ICU-102", "ICU", "AVAILABLE", 2500.00),
                    new Bed("ICU-103", "ICU", "AVAILABLE", 2500.00),
                    new Bed("GEN-201", "GENERAL_WARD", "AVAILABLE", 500.00),
                    new Bed("GEN-202", "GENERAL_WARD", "AVAILABLE", 500.00),
                    new Bed("GEN-203", "GENERAL_WARD", "AVAILABLE", 500.00),
                    new Bed("PVT-301", "PRIVATE", "AVAILABLE", 1200.00),
                    new Bed("PVT-302", "PRIVATE", "AVAILABLE", 1200.00)
            ));
            System.out.println("Beds seeded successfully!");
        }

        if (operationTheaterRepository.count() == 0) {
            System.out.println("Seeding default operation theaters...");
            operationTheaterRepository.saveAll(Arrays.asList(
                    new OperationTheater("OT-1", "AVAILABLE", 1500.00),
                    new OperationTheater("OT-2", "AVAILABLE", 1500.00)
            ));
            System.out.println("Operation theaters seeded successfully!");
        }
    }
}
