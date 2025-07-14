'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur inconnue');
        return;
      }

      setSuccess('✅ Utilisateur créé avec succès !');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      setError('Une erreur est survenue.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-2xl font-bold text-white mb-6">Poker Practice</h1>
      <form
        onSubmit={handleRegister}
        className="bg-[#182B35] p-6 rounded-lg w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold mb-4">Inscription</h1>

        <input
          type="text"
          placeholder="Nom d'utilisateur"
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold transition"
        >
          Créer un compte
        </button>
        <p className="mt-4 text-sm text-gray-400">
            Déjà inscrit ?{' '}
            <a href="/login" className="text-blue-500 hover:underline">
            Connectez-vous
            </a>
        </p>
      </form>

    </div>
  );
}
