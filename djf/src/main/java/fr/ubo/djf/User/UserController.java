package main.java.fr.ubo.djf.User;

//import lombok.RequiredArgsConstructor;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.http.ResponseEntity;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/users")
//@CrossOrigin(origins = "http://localhost:3000")
//@RequiredArgsConstructor
//public class UserController {
//
//    private final UserRepository userRepository;
//
//    @GetMapping
//    public List<User> getAllUsers() {
//        return userRepository.findAll();
//    }
//
//    @PostMapping
//    public User createUser(@RequestBody User user) {
//        return userRepository.save(user);
//    }
//
//    @PutMapping("/{id}")
//    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
//        return userRepository.findById(id)
//                .map(user -> {
//                    user.setUsername(userDetails.getUsername());
//                    user.setEmail(userDetails.getEmail());
//                    User updatedUser = userRepository.save(user);
//                    return ResponseEntity.ok(updatedUser);
//                })
//                .orElse(ResponseEntity.notFound().build());
//    }
//}


import lombok.extern.slf4j.Slf4j; // 1. Import Lombok pour les logs
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j //Active la variable 'log'
public class UserController {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            log.info("Récupération de tous les utilisateurs...");
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des utilisateurs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur serveur");
        }
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        // 3. Loguer les variables d'entrée (CONTEXTE)
        log.info("Tentative de création d'un utilisateur : [Username: {}, Email: {}]", user.getUsername(), user.getEmail());

        try {

            String encodedPassword = passwordEncoder.encode(user.getPassword());
            user.setPassword(encodedPassword);

            User savedUser = userRepository.save(user);
            log.debug("Utilisateur créé avec succès avec l'ID : {}", savedUser.getId());
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {

            log.error("Echec de la création pour l'utilisateur : {}", user, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Impossible de créer l'utilisateur");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {

        log.info("Requête UPDATE pour ID: {} avec données : {}", id, userDetails);

        try {
            Optional<User> userOptional = userRepository.findById(id);

            if (userOptional.isEmpty()) {
                log.warn("Update impossible : L'utilisateur avec l'ID {} n'existe pas.", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur introuvable");
            }

            User userToUpdate = userOptional.get();
            userToUpdate.setUsername(userDetails.getUsername());
            userToUpdate.setEmail(userDetails.getEmail());
            userToUpdate.setPhoneNumber(userDetails.getPhoneNumber());

            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                String encodedPassword = passwordEncoder.encode(userDetails.getPassword());
                userToUpdate.setPassword(encodedPassword);
            }

            User updatedUser = userRepository.save(userToUpdate);

            log.info("Utilisateur ID {} mis à jour avec succès.", id);
            return ResponseEntity.ok(updatedUser);

        } catch (Exception e) {
            log.error("ERREUR CRITIQUE lors de la mise à jour de l'ID : {}", id, e);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Une erreur technique est survenue lors de la mise à jour.");
        }
    }
}
