import React, { useState } from 'react';

function AuthForm({ onLoginSuccess }) {
    // --- ÉTATS ---
    const [isLogin, setIsLogin] = useState(true);
    const [showOtp, setShowOtp] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // --- NOUVEAU : État de chargement

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phoneNumber: '',
        otp: ''
    });

    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const API_URL = "/api/users";

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsLoading(true); // --- NOUVEAU : On active le chargement (bloque le bouton)

        let url;
        let payload;

        if (!isLogin) {
            url = `${API_URL}/register`;
            payload = formData;
        }
        else if (showOtp) {
            url = `${API_URL}/verify-otp`;
            payload = { email: formData.email, code: formData.otp };
        }
        else {
            url = `${API_URL}/login`;
            payload = { email: formData.email, password: formData.password };
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok || response.status === 202) {
                const data = await response.json();

                if (!isLogin) {
                    setMessage("Inscription réussie ! Connectez-vous.");
                    setIsLogin(true);
                    setFormData({ ...formData, password: '' });
                }
                else if (data.status === "OTP_REQUIRED") {
                    setMessage("Code envoyé ! Vérifiez vos SMS.");
                    setShowOtp(true);
                }
                else {
                    onLoginSuccess(data);
                }
            } else {
                const errorText = await response.text();
                setError(errorText || "Une erreur est survenue.");
            }
        } catch (err) {
            console.error(err);
            setError("Erreur de connexion au serveur.");
        } finally {
            setIsLoading(false); // --- NOUVEAU : On désactive le chargement quoi qu'il arrive
        }
    };

    const toggleMode = () => {
        if (isLoading) return; // Empêche de changer de mode pendant un chargement
        setIsLogin(!isLogin);
        setShowOtp(false);
        setError(null);
        setMessage(null);
    };

    // --- FONCTION POUR LE TEXTE DU BOUTON ---
    const getButtonText = () => {
        if (isLoading) return "Chargement..."; // Texte pendant l'attente
        if (!isLogin) return "S'inscrire";
        if (showOtp) return "Valider le code";
        return "Se connecter";
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

                    {!isLogin && (
                        <>
                            <input type="text" name="username" placeholder="Nom d'utilisateur" required
                                   value={formData.username} onChange={handleInputChange} style={styles.input} disabled={isLoading} />
                            <input type="tel" name="phoneNumber" placeholder="Téléphone"
                                   value={formData.phoneNumber} onChange={handleInputChange} style={styles.input} disabled={isLoading} />
                        </>
                    )}

                    <input type="email" name="email" placeholder="Email" required
                           readOnly={showOtp}
                           value={formData.email} onChange={handleInputChange}
                           style={{...styles.input, backgroundColor: showOtp ? '#f0f0f0' : 'white'}} disabled={isLoading} />

                    {!showOtp && (
                        <input type="password" name="password" placeholder="Mot de passe" required
                               value={formData.password} onChange={handleInputChange} style={styles.input} disabled={isLoading} />
                    )}

                    {showOtp && (
                        <div style={{ animation: 'fadeIn 0.5s' }}>
                            <input type="text" name="otp" placeholder="Code à 6 chiffres" required
                                   value={formData.otp} onChange={handleInputChange}
                                   maxLength="6"
                                   style={{...styles.input, textAlign: 'center', letterSpacing: '5px', fontSize: '20px', borderColor: '#007bff'}}
                                   disabled={isLoading} // Désactiver l'input pendant la vérif
                            />
                            <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                                Code valide 2 minutes
                            </p>
                        </div>
                    )}

                    {/* --- NOUVEAU : Gestion du bouton --- */}
                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            opacity: isLoading ? 0.7 : 1,
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                        disabled={isLoading} // Empêche le double-clic
                    >
                        {getButtonText()}
                    </button>
                </form>

                {!showOtp && (
                    <p style={{ marginTop: '15px', fontSize: '0.9rem' }}>
                        {isLogin ? "Pas encore de compte ? " : "Déjà inscrit ? "}
                        <span onClick={toggleMode} style={styles.link}>
                {isLogin ? "Créer un compte" : "Se connecter"}
            </span>
                    </p>
                )}

                {showOtp && (
                    <p style={{ marginTop: '15px', fontSize: '0.9rem' }}>
                        Erreur d'email ? <span onClick={() => !isLoading && setShowOtp(false)} style={styles.link}>Retour</span>
                    </p>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif' },
    card: { width: '100%', maxWidth: '400px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', backgroundColor: 'white', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box', width: '100%' },
    button: { padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', transition: '0.3s' },
    link: { color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' },
    successMsg: { color: '#155724', backgroundColor: '#d4edda', padding: '10px', borderRadius: '5px', marginBottom: '15px' },
    errorMsg: { color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '5px', marginBottom: '15px' }
};

export default AuthForm;

