'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPassword, setIsCheckingPassword] = useState(true);
  const [passwordExists, setPasswordExists] = useState(false);

  // Check if password exists on component mount
  useEffect(() => {
    checkPasswordExists();
  }, []);

  const checkPasswordExists = async () => {
    try {
      const response = await fetch('/api/auth');
      if (!response.ok) throw new Error('Failed to check password');
      const data = await response.json();
      setPasswordExists(data.passwordExists);
    } catch (error) {
      console.error('Error checking password:', error);
      setError('Error checking password status');
    } finally {
      setIsCheckingPassword(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 1) {
      setError('Please enter a password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set password');
      }

      // Password set successfully, now authenticate and redirect
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/website/dashboard');
    } catch (error) {
      console.error('Error setting password:', error);
      setError(error.message || 'Failed to set password');
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok || !data.authenticated) {
        throw new Error(data.error || 'Invalid password');
      }

      // Store authentication state
      localStorage.setItem('isAuthenticated', 'true');
      
      // Redirect to dashboard
      router.push('/website/dashboard');
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error.message || 'Invalid password');
      setIsLoading(false);
    }
  };

  if (isCheckingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-blue-500 mb-2">DocFlow</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {passwordExists ? 'Bienvenue sur DocFlow' : 'Configuration initiale'}
          </h2>
          <p className="text-gray-600">
            {passwordExists 
              ? 'Veuillez entrer votre mot de passe pour accéder au système.'
              : 'Veuillez définir un mot de passe pour sécuriser votre système.'}
          </p>
        </div>

        {/* Login/Set Password Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={passwordExists ? handleLogin : handleSetPassword} className="space-y-6">
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {passwordExists ? 'Mot de passe' : 'Nouveau mot de passe'}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={passwordExists ? 'Entrez votre mot de passe' : 'Entrez votre mot de passe'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
                autoFocus
              />
            </div>

            {/* Confirm Password Field (only for setting password) */}
            {!passwordExists && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (passwordExists ? 'Connexion...' : 'Configuration...')
                : (passwordExists ? 'Se connecter' : 'Définir le mot de passe')}
            </button>
          </form>

          {/* Reset Password Link - Only show when password exists */}
          {passwordExists && (
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/reset-password-request')}
                className="text-red-600 hover:text-red-700 text-sm font-medium underline"
              >
                Mot de passe oublié?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}