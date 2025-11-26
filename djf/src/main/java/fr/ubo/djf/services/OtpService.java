package main.java.fr.ubo.djf.services;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    // Notre "Cache" en mémoire : Email -> Données OTP
    private final Map<String, OtpData> otpCache = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    // Configuration des temps (en millisecondes)
    private static final long EXPIRY_DURATION = 2 * 60 * 1000; // 2 minutes
    private static final long RESEND_COOLDOWN = 30 * 1000;     // 30 secondes

    @Data
    @AllArgsConstructor
    private static class OtpData {
        private String code;
        private long creationTime;
    }

    public String generateOtp(String email) {
        long now = System.currentTimeMillis();

        // Vérifier si un code existe déjà et s'il a été généré il y a moins de 30s
        if (otpCache.containsKey(email)) {
            OtpData existingOtp = otpCache.get(email);
            if (now - existingOtp.getCreationTime() < RESEND_COOLDOWN) {
                throw new RuntimeException("Veuillez attendre 30 secondes avant de demander un nouveau code.");
            }
        }

        // Générer un code à 6 chiffres
        String code = String.format("%06d", random.nextInt(999999));

        // Stocker dans le cache
        otpCache.put(email, new OtpData(code, now));

        return code;
    }

    public boolean validateOtp(String email, String codeInput) {
        if (!otpCache.containsKey(email)) return false;

        OtpData otpData = otpCache.get(email);
        long now = System.currentTimeMillis();

        // Vérifier l'expiration (2 minutes)
        if (now - otpData.getCreationTime() > EXPIRY_DURATION) {
            otpCache.remove(email); // Nettoyage
            return false;
        }

        // Vérifier le code
        if (otpData.getCode().equals(codeInput)) {
            otpCache.remove(email); // On consomme le code (usage unique)
            return true;
        }

        return false;
    }
}
