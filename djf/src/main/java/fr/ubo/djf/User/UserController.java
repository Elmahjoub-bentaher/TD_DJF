package main.java.fr.ubo.djf.User;

import lombok.extern.slf4j.Slf4j; // 1. Import Lombok pour les logs
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import java.util.Map;

import main.java.fr.ubo.djf.services.OtpService;

import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j //Active la variable 'log'
public class UserController {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final OtpService otpService;

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
        // Loguer les variables d'entrée (CONTEXTE)
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

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        log.info("Tentative d'inscription pour l'email : {}", user.getEmail());

        try {
            // Vérification : L'email existe-t-il déjà
            if (userRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Erreur : Cet email est déjà utilisé.");
            }

            // Hachage du mot de passe
            String encodedPassword = passwordEncoder.encode(user.getPassword());
            user.setPassword(encodedPassword);

            // Sauvegarde
            User savedUser = userRepository.save(user);

            // On évite de renvoyer le mot de passe haché au frontend par sécurité
            savedUser.setPassword(null);

            log.info("Nouvel utilisateur inscrit avec succès : ID {}", savedUser.getId());
            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {
            log.error("Erreur lors de l'inscription", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Une erreur est survenue lors de l'inscription.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginRequest(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        log.info("Tentative de connexion pour : {}", email);

        try {
            //Recherche de l'utilisateur par email
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isEmpty()) {
                // On reste vague sur l'erreur pour la sécurité
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou mot de passe incorrect.");
            }

            try {
                String otpCode = otpService.generateOtp(email);

                log.info("OTP pour {} : [{}]", email, otpCode);

                // On renvoie un statut spécial pour dire au front "Affiche la case OTP"
                return ResponseEntity.accepted().body(Map.of(
                        "message", "OTP envoyé",
                        "status", "OTP_REQUIRED",
                        "email", email // On renvoie l'email pour le step 2
                ));

            } catch (RuntimeException e) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(e.getMessage());
            }


        } catch (Exception e) {
            log.error("Erreur technique lors du login", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur serveur.");
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> otpData) {
        String email = otpData.get("email");
        String code = otpData.get("code");

        if (otpService.validateOtp(email, code)) {
            // OTP Valide -> On récupère l'user et on le connecte
            User user = userRepository.findByEmail(email).get();
            user.setPassword(null);
            log.info("Utilisateur {} connecté via OTP.", email);
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Code OTP invalide ou expiré.");
        }
    }
}
