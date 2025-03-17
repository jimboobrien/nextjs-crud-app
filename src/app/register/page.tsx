'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  if (user) {
    return (
      <div className="register-container">
        <h1>Already Logged In</h1>
        <p>You are already logged in as {user.email}</p>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      alert('Check your email for confirmation!');
      //router.push('/login');
    }
  };

  return (
    <div className="register-container">
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
