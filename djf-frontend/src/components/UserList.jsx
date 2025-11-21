// // import React, { useState, useEffect } from 'react';
// //
// // function UserList() {
// //
// //     const [users, setUsers] = useState([]);
// //     const [loading, setLoading] = useState(true);
// //     const API_URL = "http://localhost:9000/api/users";
// //
// //     useEffect(() => {
// //         // Fonction asynchrone pour la récupération des données
// //         const fetchUsers = async () => {
// //             try {
// //                 const response = await fetch(API_URL);
// //
// //                 if (!response.ok) {
// //                     throw new Error(`Erreur HTTP: ${response.status}`);
// //                 }
// //
// //                 const data = await response.json();
// //                 setUsers(data);
// //             } catch (error) {
// //                 console.error("Erreur lors de la récupération des utilisateurs:", error);
// //                 setUsers(null);
// //             } finally {
// //                 setLoading(false);
// //             }
// //         };
// //
// //         fetchUsers();
// //     }, []);
// //
// //     // --- Affichage ---
// //     if (loading) {
// //         return <h2>Chargement en cours...</h2>;
// //     }
// //
// //     if (users === null) {
// //         return <h2 style={{color: 'red'}}>Erreur: Impossible de joindre l'API. Vérifiez la console et la configuration CORS.</h2>;
// //     }
// //
// //     return (
// //         <div style={{ padding: '20px' }}>
// //             <h1>Liste des Utilisateurs ({users.length})</h1>
// //             {users.length === 0 ? (
// //                 <p>Aucun utilisateur n'est présent dans la base de données.</p>
// //             ) : (
// //                 <div>
// //                     {users.map(user => (
// //                         <p key={user.id}>
// //                             <strong>ID {user.id}:</strong> {user.username} ({user.email})
// //                         </p>
// //                     ))}
// //                 </div>
// //             )}
// //         </div>
// //     );
// // }
// //
// // export default UserList;
//
//
// import React, { useState, useEffect } from 'react';
//
// function UserList() {
//     // --- ÉTATS (STATE) ---
//     const [users, setUsers] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showForm, setShowForm] = useState(false); // Pour afficher/masquer le formulaire
//     const [newUser, setNewUser] = useState({ username: '', email: '' }); // Données du nouvel utilisateur
//
//     const API_URL = "http://localhost:9000/api/users";
//
//     // --- CHARGEMENT DES DONNÉES (GET) ---
//     useEffect(() => {
//         fetchUsers();
//     }, []);
//
//     const fetchUsers = async () => {
//         try {
//             const response = await fetch(API_URL);
//             if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
//             const data = await response.json();
//             setUsers(data);
//         } catch (error) {
//             console.error("Erreur fetch:", error);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     // --- AJOUT D'UN UTILISATEUR (POST) ---
//     const handleAddUser = async (e) => {
//         e.preventDefault(); // Empêche le rechargement de la page
//
//         try {
//             const response = await fetch(API_URL, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(newUser),
//             });
//
//             if (response.ok) {
//                 const createdUser = await response.json();
//                 // Ajoute le nouvel utilisateur à la liste locale immédiatement
//                 setUsers([...users, createdUser]);
//                 // Réinitialise le formulaire
//                 setNewUser({ username: '', email: '' });
//                 setShowForm(false);
//             } else {
//                 alert("Erreur lors de la création de l'utilisateur");
//             }
//         } catch (error) {
//             console.error("Erreur ajout:", error);
//         }
//     };
//
//     // --- GESTION DES INPUTS ---
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setNewUser({ ...newUser, [name]: value });
//     };
//
//     // --- RENDER (AFFICHAGE) ---
//     if (loading) return <h2>Chargement...</h2>;
//
//     return (
//         <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//
//             {/* En-tête avec le bouton + */}
//             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//                 <h1>Liste des Utilisateurs</h1>
//                 <button
//                     onClick={() => setShowForm(!showForm)}
//                     style={{
//                         width: '40px', height: '40px', borderRadius: '50%',
//                         border: 'none', backgroundColor: '#28a745', color: 'white',
//                         fontSize: '24px', cursor: 'pointer', display: 'flex',
//                         alignItems: 'center', justifyContent: 'center'
//                     }}
//                     title="Ajouter un utilisateur"
//                 >
//                     {showForm ? '-' : '+'}
//                 </button>
//             </div>
//
//             {/* Formulaire d'ajout (Visible seulement si showForm est true) */}
//             {showForm && (
//                 <form onSubmit={handleAddUser} style={{
//                     marginBottom: '20px', padding: '15px', border: '1px solid #ddd',
//                     borderRadius: '8px', backgroundColor: '#f9f9f9', maxWidth: '400px'
//                 }}>
//                     <h3>Nouvel Utilisateur</h3>
//                     <div style={{ marginBottom: '10px' }}>
//                         <input
//                             type="text" name="username" placeholder="Nom d'utilisateur"
//                             value={newUser.username} onChange={handleInputChange} required
//                             style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
//                         />
//                         <input
//                             type="email" name="email" placeholder="Email"
//                             value={newUser.email} onChange={handleInputChange} required
//                             style={{ padding: '8px', width: '100%' }}
//                         />
//                     </div>
//                     <button type="submit" style={{
//                         padding: '8px 15px', backgroundColor: '#007bff', color: 'white',
//                         border: 'none', borderRadius: '4px', cursor: 'pointer'
//                     }}>
//                         Enregistrer
//                     </button>
//                 </form>
//             )}
//
//             {/* Liste des utilisateurs */}
//             <ul style={{ listStyleType: 'none', padding: 0 }}>
//                 {users.map(user => (
//                     <li key={user.id} style={{
//                         padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between'
//                     }}>
//                         <span><strong>{user.username}</strong> <small>({user.email})</small></span>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }
//
// export default UserList;

import React, { useState, useEffect } from 'react';

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({ username: '', email: '' });
    const [editingId, setEditingId] = useState(null);

    // const API_URL = "http://localhost:9000/api/users";
    const API_URL = "/api/users";
    // --- CHARGEMENT DES DONNÉES (GET) ---
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Erreur fetch:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isEdit = editingId !== null;
        const url = isEdit ? `${API_URL}/${editingId}` : API_URL;
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const savedUser = await response.json();

                if (isEdit) {
                    setUsers(users.map(u => u.id === editingId ? savedUser : u));
                } else {
                    setUsers([...users, savedUser]);
                }

                // Réinitialisation
                setFormData({ username: '', email: '' });
                setEditingId(null);
                setShowForm(false);
            } else {
                alert("Erreur lors de l'enregistrement");
            }
        } catch (error) {
            console.error("Erreur submit:", error);
        }
    };

    // --- PRÉPARER LA MODIFICATION ---
    const handleEditClick = (user) => {
        setEditingId(user.id);       // On garde l'ID
        setFormData({                // On remplit le formulaire avec les infos actuelles
            username: user.username,
            email: user.email
        });
        setShowForm(true);           // On ouvre le formulaire
    };

    // --- GESTION DES INPUTS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // --- RENDER ---
    if (loading) return <h2>Chargement...</h2>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>

            {/* En-tête avec le bouton + */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h1>Liste des Utilisateurs</h1>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null); // Si on clique sur +, on réinitialise le mode édition
                        setFormData({ username: '', email: '' });
                    }}
                    style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        border: 'none', backgroundColor: showForm ? '#dc3545' : '#28a745', color: 'white',
                        fontSize: '24px', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}
                    title={showForm ? "Fermer" : "Ajouter un utilisateur"}
                >
                    {showForm ? '×' : '+'}
                </button>
            </div>

            {/* Formulaire (Création ou Modification) */}
            {showForm && (
                <form onSubmit={handleSubmit} style={{
                    marginBottom: '20px', padding: '15px', border: '1px solid #ddd',
                    borderRadius: '8px', backgroundColor: '#f9f9f9', maxWidth: '400px'
                }}>
                    <h3>{editingId ? 'Modifier l\'utilisateur' : 'Nouvel Utilisateur'}</h3>
                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text" name="username" placeholder="Nom d'utilisateur"
                            value={formData.username} onChange={handleInputChange} required
                            style={{ padding: '8px', width: '100%', marginBottom: '10px', boxSizing: 'border-box' }}
                        />
                        <input
                            type="email" name="email" placeholder="Email"
                            value={formData.email} onChange={handleInputChange} required
                            style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button type="submit" style={{
                        padding: '8px 15px', backgroundColor: '#007bff', color: 'white',
                        border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%'
                    }}>
                        {editingId ? 'Mettre à jour' : 'Enregistrer'}
                    </button>
                </form>
            )}

            {/* Liste des utilisateurs */}
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {users.map(user => (
                    <li key={user.id} style={{
                        padding: '10px', borderBottom: '1px solid #eee',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <span><strong>{user.username}</strong> <small>({user.email})</small></span>

                        {/* Bouton Modifier */}
                        <button
                            onClick={() => handleEditClick(user)}
                            style={{
                                cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #ccc',
                                padding: '5px 10px', borderRadius: '4px'
                            }}
                        >
                            Update
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserList;