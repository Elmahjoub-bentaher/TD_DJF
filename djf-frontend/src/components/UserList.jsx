// import React, { useState, useEffect } from 'react';
//
// function UserList() {
//     const [users, setUsers] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showForm, setShowForm] = useState(false);
//
//     const [formData, setFormData] = useState({
//         username: '',
//         email: '',
//         phoneNumber: '',
//         password: ''
//     });
//
//     const [editingId, setEditingId] = useState(null);
//
//     // const API_URL = "http://localhost:9000/api/users";
//     const API_URL = "/api/users";
//
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
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//
//         const isEdit = editingId !== null;
//         const url = isEdit ? `${API_URL}/${editingId}` : API_URL;
//         const method = isEdit ? 'PUT' : 'POST';
//
//         try {
//             const response = await fetch(url, {
//                 method: method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(formData),
//             });
//
//             if (response.ok) {
//                 const savedUser = await response.json();
//
//                 if (isEdit) {
//                     setUsers(users.map(u => u.id === editingId ? savedUser : u));
//                 } else {
//                     setUsers([...users, savedUser]);
//                 }
//
//                 // Réinitialisation complète du formulaire
//                 setFormData({ username: '', email: '', phoneNumber: '', password: '' });
//                 setEditingId(null);
//                 setShowForm(false);
//             } else {
//                 alert("Erreur lors de l'enregistrement");
//             }
//         } catch (error) {
//             console.error("Erreur submit:", error);
//         }
//     };
//
//     const handleEditClick = (user) => {
//         setEditingId(user.id);
//         setFormData({
//             username: user.username,
//             email: user.email,
//             phoneNumber: user.phoneNumber || '',
//             password: ''
//         });
//         setShowForm(true);
//     };
//
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//     };
//
//     const handleReset = () => {
//         setShowForm(!showForm);
//         setEditingId(null);
//         setFormData({ username: '', email: '', phoneNumber: '', password: '' });
//     };
//
//     if (loading) return <h2>Chargement...</h2>;
//
//     return (
//         <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//
//             {/* En-tête avec le bouton + */}
//             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//                 <h1>Liste des Utilisateurs</h1>
//                 <button
//                     onClick={handleReset}
//                     style={{
//                         width: '40px', height: '40px', borderRadius: '50%',
//                         border: 'none', backgroundColor: showForm ? '#dc3545' : '#28a745', color: 'white',
//                         fontSize: '24px', cursor: 'pointer', display: 'flex',
//                         alignItems: 'center', justifyContent: 'center'
//                     }}
//                     title={showForm ? "Fermer" : "Ajouter un utilisateur"}
//                 >
//                     {showForm ? '×' : '+'}
//                 </button>
//             </div>
//
//             {/* Formulaire (Création ou Modification) */}
//             {showForm && (
//                 <form onSubmit={handleSubmit} style={{
//                     marginBottom: '20px', padding: '15px', border: '1px solid #ddd',
//                     borderRadius: '8px', backgroundColor: '#f9f9f9', maxWidth: '400px'
//                 }}>
//                     <h3>{editingId ? 'Modifier l\'utilisateur' : 'Nouvel Utilisateur'}</h3>
//
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
//                         {/* Username */}
//                         <input
//                             type="text" name="username" placeholder="Nom d'utilisateur"
//                             value={formData.username} onChange={handleInputChange} required
//                             style={{ padding: '8px', boxSizing: 'border-box' }}
//                         />
//
//                         {/* Email */}
//                         <input
//                             type="email" name="email" placeholder="Email"
//                             value={formData.email} onChange={handleInputChange} required
//                             style={{ padding: '8px', boxSizing: 'border-box' }}
//                         />
//
//                         {/* NOUVEAU : Téléphone */}
//                         <input
//                             type="tel" name="phoneNumber" placeholder="Numéro de téléphone"
//                             value={formData.phoneNumber} onChange={handleInputChange}
//                             style={{ padding: '8px', boxSizing: 'border-box' }}
//                         />
//
//                         {/* NOUVEAU : Mot de passe */}
//                         <input
//                             type="password" name="password"
//                             placeholder={editingId ? "Nouveau mot de passe (laisser vide si inchangé)" : "Mot de passe"}
//                             value={formData.password} onChange={handleInputChange}
//                             // Requis seulement à la création, optionnel à la modification (selon votre logique backend)
//                             required={!editingId}
//                             style={{ padding: '8px', boxSizing: 'border-box' }}
//                         />
//                     </div>
//
//                     <button type="submit" style={{
//                         padding: '10px 15px', backgroundColor: '#007bff', color: 'white',
//                         border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%'
//                     }}>
//                         {editingId ? 'Mettre à jour' : 'Enregistrer'}
//                     </button>
//                 </form>
//             )}
//
//             {/* Liste des utilisateurs */}
//             <ul style={{ listStyleType: 'none', padding: 0 }}>
//                 {users.map(user => (
//                     <li key={user.id} style={{
//                         padding: '10px', borderBottom: '1px solid #eee',
//                         display: 'flex', justifyContent: 'space-between', alignItems: 'center'
//                     }}>
//                         <span>
//                             <strong>{user.username}</strong> <small>({user.email})</small>
//                             {/* Affichage du téléphone si présent */}
//                             {user.phoneNumber && (
//                                 <span style={{ marginLeft: '10px', color: '#666', fontSize: '0.9em' }}>
//                                      {user.phoneNumber}
//                                 </span>
//                             )}
//                         </span>
//
//                         {/* Bouton Modifier */}
//                         <button
//                             onClick={() => handleEditClick(user)}
//                             style={{
//                                 cursor: 'pointer', backgroundColor: '#ffc107', border: 'none',
//                                 padding: '5px 10px', borderRadius: '4px', fontSize: '14px'
//                             }}
//                         >
//                              Update
//                         </button>
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

    // 1. DÉFINIR L'ÉTAT VIDE (Pour réutilisation)
    const initialFormState = {
        username: '',
        email: '',
        phoneNumber: '',
        password: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);

    // const API_URL = "http://localhost:9000/api/users";
    const API_URL = "/api/users";

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

                // SUCCÈS : On vide le formulaire et on le ferme
                setFormData(initialFormState);
                setEditingId(null);
                setShowForm(false);
            } else {
                alert("Erreur lors de l'enregistrement");
            }
        } catch (error) {
            console.error("Erreur submit:", error);
        }
    };

    const handleEditClick = (user) => {
        setEditingId(user.id);
        setFormData({
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber || '',
            password: '' // On ne pré-remplit jamais le mot de passe
        });
        setShowForm(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // 2. MODIFIER LA FONCTION DU BOUTON "+"
    const handleToggleForm = () => {
        if (!showForm) {
            // CAS : On ouvre le formulaire pour AJOUTER
            // On s'assure qu'il est parfaitement vide et qu'on n'est pas en mode édition
            setEditingId(null);
            setFormData(initialFormState);
        } else {
            // CAS : On ferme le formulaire
            // On nettoie aussi par précaution
            setEditingId(null);
            setFormData(initialFormState);
        }
        setShowForm(!showForm);
    };

    if (loading) return <h2>Chargement...</h2>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>

            {/* En-tête avec le bouton + */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h1>Liste des Utilisateurs</h1>
                <button
                    onClick={handleToggleForm} // Utilisation de la nouvelle fonction
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                        {/* Username */}
                        <input
                            type="text" name="username" placeholder="Nom d'utilisateur"
                            value={formData.username} onChange={handleInputChange} required
                            style={{ padding: '8px', boxSizing: 'border-box' }}
                        />

                        {/* Email */}
                        <input
                            type="email" name="email" placeholder="Email"
                            value={formData.email} onChange={handleInputChange} required
                            style={{ padding: '8px', boxSizing: 'border-box' }}
                        />

                        {/* Téléphone */}
                        <input
                            type="tel" name="phoneNumber" placeholder="Numéro de téléphone"
                            value={formData.phoneNumber} onChange={handleInputChange}
                            style={{ padding: '8px', boxSizing: 'border-box' }}
                        />

                        {/* Mot de passe */}
                        <input
                            type="password" name="password"
                            placeholder={editingId ? "Nouveau mot de passe (laisser vide si inchangé)" : "Mot de passe"}
                            value={formData.password} onChange={handleInputChange}
                            required={!editingId}
                            style={{ padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button type="submit" style={{
                        padding: '10px 15px', backgroundColor: '#007bff', color: 'white',
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
                        <span>
                            <strong>{user.username}</strong> <small>({user.email})</small>
                            {user.phoneNumber && (
                                <span style={{ marginLeft: '10px', color: '#666', fontSize: '0.9em' }}>
                                     {user.phoneNumber}
                                </span>
                            )}
                        </span>

                        <button
                            onClick={() => handleEditClick(user)}
                            style={{
                                cursor: 'pointer', backgroundColor: '#ffc107', border: 'none',
                                padding: '5px 10px', borderRadius: '4px', fontSize: '14px'
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