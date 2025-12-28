import React, { useState } from 'react';
import '../Style/SignupForm.css';

const SignupForm = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Inscription :', form);
  };

  return (
    <div class='container' style={{ }}>
      <h2>Ajouter un compte</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom d'utilisateur</label><br />
          <input type="text" name="username" value={form.username} onChange={handleChange} />
        </div>
        <div>
          <label>Email</label><br />
          <input type="email" name="email" value={form.email} onChange={handleChange} />
        </div>
        <div>
          <label>Mot de passe</label><br />
          <input type="password" name="password" value={form.password} onChange={handleChange} />
        </div>
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
};

export default SignupForm;
