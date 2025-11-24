import React, { useState } from 'react';

function AuthForm({ onLoginSuccess }) {
    // true = Mode Connexion, false = Mode Inscription
    const [isLogin, setIsLogin] = useState(true);

    // Données du formulaire
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phoneNumber: ''
    });

    const [message, setMessage] = useState(null); // Message de succès (vert)
    const [error, setError] = useState(null);     // Message d'erreur (rouge)

    // Nginx, URL relative
    const API_URL = "/api/users";

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        const endpoint = isLogin ? "/login" : "/register";

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();

                if (isLogin) {
                    // On appelle la fonction du parent (App.jsx) pour changer d'écran vers UserList
                    onLoginSuccess(data);
                } else {
                    // On ne connecte pas, on redirige vers le formulaire de Login
                    setMessage("Compte créé avec succès ! Veuillez vous connecter.");
                    setIsLogin(true); // Bascule vers l'écran de connexion
                    // On vide le mot de passe pour forcer l'utilisateur à le retaper
                    setFormData({ ...formData, password: '' });
                }
            } else {
                // Gestion des erreurs (ex: Email déjà pris, Mauvais mot de passe)
                const errorText = await response.text();
                setError(errorText || "Une erreur est survenue.");
            }
        } catch (err) {
            console.error(err);
            setError("Erreur de connexion au serveur.");
        }
    };

    // Fonction pour réinitialiser les messages quand on change d'onglet manuellement
    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setMessage(null);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>

                {/* Messages de Feedback */}
                {message && <div style={styles.successMsg}>{message}</div>}
                {error && <div style={styles.errorMsg}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>

                    {/* Champs spécifiques à l'Inscription */}
                    {!isLogin && (
                        <>
                            <input
                                type="text" name="username" placeholder="Nom d'utilisateur" required
                                value={formData.username} onChange={handleInputChange}
                                style={styles.input}
                            />
                            <input
                                type="tel" name="phoneNumber" placeholder="Téléphone"
                                value={formData.phoneNumber} onChange={handleInputChange}
                                style={styles.input}
                            />
                        </>
                    )}

                    {/* Champs communs */}
                    <input
                        type="email" name="email" placeholder="Email" required
                        value={formData.email} onChange={handleInputChange}
                        style={styles.input}
                    />
                    <input
                        type="password" name="password" placeholder="Mot de passe" required
                        value={formData.password} onChange={handleInputChange}
                        style={styles.input}
                    />

                    <button type="submit" style={styles.button}>
                        {isLogin ? 'Se connecter' : "S'inscrire"}
                    </button>
                </form>

                <p style={{ marginTop: '15px', fontSize: '0.9rem' }}>
                    {isLogin ? "Pas encore de compte ? " : "Déjà inscrit ? "}
                    <span onClick={toggleMode} style={styles.link}>
            {isLogin ? "Créer un compte" : "Se connecter"}
          </span>
                </p>
            </div>
        </div>
    );
}

// Styles CSS simples
const styles = {
    container: { display: 'flex', justifyContent: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif' },
    card: { width: '100%', maxWidth: '400px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', backgroundColor: 'white', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' },
    button: { padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
    link: { color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' },
    successMsg: { color: '#155724', backgroundColor: '#d4edda', padding: '10px', borderRadius: '5px', marginBottom: '15px' },
    errorMsg: { color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '5px', marginBottom: '15px' }
};

export default AuthForm;