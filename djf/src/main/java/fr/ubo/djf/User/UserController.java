package main.java.fr.ubo.djf.User;

import lombok.extern.slf4j.Slf4j; // 1. Import Lombok pour les logs
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import java.util.Map;

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
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
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

            User user = userOptional.get();

            // Vérification du mot de passe
            // passwordEncoder.matches(mot_de_passe_en_clair, hash_en_base)
            boolean isPasswordMatch = passwordEncoder.matches(password, user.getPassword());

            if (!isPasswordMatch) {
                log.warn("Échec connexion : Mauvais mot de passe pour {}", email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou mot de passe incorrect.");
            }

            // Succès
            log.info("Utilisateur {} connecté.", user.getEmail());

            // On nettoie le mot de passe avant de renvoyer l'objet au frontend
            user.setPassword(null);

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            log.error("Erreur technique lors du login", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur serveur.");
        }
    }
}
