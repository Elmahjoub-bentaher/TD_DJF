import React, { useState } from 'react';

function AuthForm({ onLoginSuccess }) {
    // --- ÉTATS ---
    const [isLogin, setIsLogin] = useState(true); // true = Login, false = Register
    const [showOtp, setShowOtp] = useState(false); // NOUVEAU : true = on affiche le champ Code

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phoneNumber: '',
        otp: '' // NOUVEAU : pour stocker le code à 6 chiffres
    });

    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const API_URL = "/api/users";

    // --- GESTION DES SAISIES ---
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- SOUMISSION DU FORMULAIRE ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        // 1. DÉTERMINER L'URL ET LE PAYLOAD SELON L'ÉTAPE
        let url;
        let payload;

        if (!isLogin) {
            // Cas : INSCRIPTION
            url = `${API_URL}/register`;
            payload = formData;
        }
        else if (showOtp) {
            // Cas : LOGIN ÉTAPE 2 (Vérification OTP)
            url = `${API_URL}/verify-otp`;
            // Le backend attend { email, code }
            payload = { email: formData.email, code: formData.otp };
        }
        else {
            // Cas : LOGIN ÉTAPE 1 (Envoi mot de passe)
            url = `${API_URL}/login`;
            payload = { email: formData.email, password: formData.password };
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            // On accepte 200 (OK) et 202 (Accepted - cas OTP)
            if (response.ok || response.status === 202) {
                const data = await response.json();

                // 2. ANALYSE DE LA RÉPONSE DU BACKEND

                if (!isLogin) {
                    // --> Inscription réussie
                    setMessage("Inscription réussie ! Connectez-vous.");
                    setIsLogin(true); // Retour au login
                    setFormData({ ...formData, password: '' });
                }
                else if (data.status === "OTP_REQUIRED") {
                    // --> Login Étape 1 réussie : Le serveur demande l'OTP
                    setMessage("Code envoyé ! Vérifiez les logs Docker (ou vos mails).");
                    setShowOtp(true); // ON ACTIVE L'INTERFACE OTP
                }
                else {
                    // --> Login Étape 2 réussie (ou login sans OTP)
                    onLoginSuccess(data); // On connecte l'utilisateur
                }
            } else {
                const errorText = await response.text();
                setError(errorText || "Une erreur est survenue.");
            }
        } catch (err) {
            console.error(err);
            setError("Erreur de connexion au serveur.");
        }
    };

    // --- FONCTION POUR CHANGER DE MODE ---
    const toggleMode = () => {
        setIsLogin(!isLogin);
        setShowOtp(false); // Reset OTP si on change
        setError(null);
        setMessage(null);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>
                    {!isLogin ? 'Inscription' : showOtp ? 'Validation OTP' : 'Connexion'}
                </h2>

                {message && <div style={styles.successMsg}>{message}</div>}
                {error && <div style={styles.errorMsg}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>

                    {/* REGISTER : Username & Phone (Cachés en mode Login) */}
                    {!isLogin && (
                        <>
                            <input type="text" name="username" placeholder="Nom d'utilisateur" required
                                   value={formData.username} onChange={handleInputChange} style={styles.input} />
                            <input type="tel" name="phoneNumber" placeholder="Téléphone"
                                   value={formData.phoneNumber} onChange={handleInputChange} style={styles.input} />
                        </>
                    )}

                    {/* EMAIL : Toujours visible. En lecture seule pendant l'OTP pour éviter les erreurs */}
                    <input type="email" name="email" placeholder="Email" required
                           readOnly={showOtp}
                           value={formData.email} onChange={handleInputChange}
                           style={{...styles.input, backgroundColor: showOtp ? '#f0f0f0' : 'white'}} />

                    {/* PASSWORD : Caché si on est à l'étape OTP */}
                    {!showOtp && (
                        <input type="password" name="password" placeholder="Mot de passe" required
                               value={formData.password} onChange={handleInputChange} style={styles.input} />
                    )}

                    {/* OTP : Visible SEULEMENT à l'étape 2 */}
                    {showOtp && (
                        <div style={{ animation: 'fadeIn 0.5s' }}>
                            <input type="text" name="otp" placeholder="Code à 6 chiffres" required
                                   value={formData.otp} onChange={handleInputChange}
                                   maxLength="6"
                                   style={{
                                       ...styles.input,
                                       textAlign: 'center',
                                       letterSpacing: '5px',
                                       fontSize: '20px',
                                       borderColor: '#007bff'
                                   }}
                            />
                            <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                                Code valide 2 minutes
                            </p>
                        </div>
                    )}

                    <button type="submit" style={styles.button}>
                        {!isLogin ? "S'inscrire" : showOtp ? "Valider le code" : "Se connecter"}
                    </button>
                </form>

                {/* Lien bascule Inscription / Connexion (Caché pendant OTP) */}
                {!showOtp && (
                    <p style={{ marginTop: '15px', fontSize: '0.9rem' }}>
                        {isLogin ? "Pas encore de compte ? " : "Déjà inscrit ? "}
                        <span onClick={toggleMode} style={styles.link}>
                {isLogin ? "Créer un compte" : "Se connecter"}
            </span>
                    </p>
                )}

                {/* Lien Retour arrière spécifique pour OTP */}
                {showOtp && (
                    <p style={{ marginTop: '15px', fontSize: '0.9rem' }}>
                        Erreur d'email ? <span onClick={() => setShowOtp(false)} style={styles.link}>Retour</span>
                    </p>
                )}
            </div>
        </div>
    );
}

// --- STYLES CSS ---
const styles = {
    container: { display: 'flex', justifyContent: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif' },
    card: { width: '100%', maxWidth: '400px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', backgroundColor: 'white', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box', width: '100%' },
    button: { padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
    link: { color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' },
    successMsg: { color: '#155724', backgroundColor: '#d4edda', padding: '10px', borderRadius: '5px', marginBottom: '15px' },
    errorMsg: { color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '5px', marginBottom: '15px' }
};

export default AuthForm;