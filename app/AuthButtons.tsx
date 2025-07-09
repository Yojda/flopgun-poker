'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthButtons() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(data.isLoggedIn);
        if (data.isLoggedIn && data.name) {
          setName(data.name);
        }
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }); // Supprime cookie côté serveur
    setIsLoggedIn(false);
    setName('');
    router.push('/login');
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-white font-semibold">{name}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => router.push('/login')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Se connecter
      </button>
      <button
        onClick={() => router.push('/register')}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        S'inscrire
      </button>
    </div>
  );
}
