package main.java.fr.ubo.djf.services;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import java.util.Collections;

import org.springframework.web.client.RestTemplate;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    // Cache en mémoire : Email -> Données OTP
    private final Map<String, OtpData> otpCache = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    // Configuration des temps (en millisecondes)
    private static final long EXPIRY_DURATION = 2 * 60 * 1000; // 2 minutes
    private static final long RESEND_COOLDOWN = 30 * 1000;

    private static final String API_KEY = "DOSITPDJF";
    private static final String SMS_API_URL = "http://dosipa.univ-brest.fr/send-sms";

    private final RestTemplate restTemplate; // Pour faire des appels HTTP// 30 secondes

    @Data
    @AllArgsConstructor
    private static class OtpData {
        private String code;
        private long creationTime;
    }

    public String generateOtp(String email, String phoneNumber) {
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

        // ENVOYER LE SMS via l'API Externe
        sendSmsToApi(phoneNumber, code);

        return code;
    }

    private void sendSmsToApi(String phoneNumber, String code) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            log.warn("Pas de numéro de téléphone pour envoyer le SMS !");
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            headers.set("x-api-key", API_KEY);

            String messageContent = "Code : " + code;

            SmsRequest requestBody = new SmsRequest(phoneNumber, messageContent);

            HttpEntity<SmsRequest> requestEntity = new HttpEntity<>(requestBody, headers);

            // Envoi
            restTemplate.postForObject(SMS_API_URL, requestEntity, String.class);

            log.info("SMS envoyé avec succès au {}", phoneNumber);

        } catch (Exception e) {
            // Affiche l'erreur exacte pour le débogage
            log.error("Erreur envoi SMS : {}", e.getMessage());
        }
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
