'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur inconnue');
        return;
      }

      // Enregistre le token dans localStorage (ou cookie sécurisé en prod)
      localStorage.setItem('token', data.token);

      // Redirection vers une page sécurisée
      router.push('/problems');
    } catch (err) {
      setError('Une erreur est survenue.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleLogin}
        className="bg-[#182B35] p-6 rounded-lg w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold mb-4">Connexion</h1>

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

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold transition"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
