import React, { useState } from 'react';
import UserList from './components/UserList';
import AuthForm from './components/AuthForm';

function App() {
    // État global : stocke l'utilisateur connecté
    const [currentUser, setCurrentUser] = useState(null);

    // Cette fonction est appelée par AuthForm quand le login réussit
    const handleLoginSuccess = (userData) => {
        setCurrentUser(userData); // Ceci déclenche l'affichage de UserList
    };

    const handleLogout = () => {
        setCurrentUser(null); // Ceci déclenche le retour à AuthForm
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f4f4f9' }}>

            {!currentUser ? (
                // Non connecté -> Formulaire Auth
                <AuthForm onLoginSuccess={handleLoginSuccess} />
            ) : (
                // Connecté -> Liste des utilisateurs
                <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>

                    {/* Header simple avec bouton déconnexion */}
                    <header style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '20px', background: 'white', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}>
                        <div>
                            <h2 style={{ margin: 0 }}>Bienvenue, {currentUser.username}</h2>
                            <small style={{ color: '#666' }}>{currentUser.email}</small>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '8px 16px', backgroundColor: '#dc3545', color: 'white',
                                border: 'none', borderRadius: '4px', cursor: 'pointer'
                            }}
                        >
                            Déconnexion
                        </button>
                    </header>

                    {/* Le composant UserList existant */}
                    <UserList />

                </div>
            )}
        </div>
    );
}

export default App;