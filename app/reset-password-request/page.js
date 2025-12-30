'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, ArrowLeft, Mail } from 'lucide-react';

export default function ResetPasswordRequestPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          throw new Error(data.error || 'Trop de demandes. Veuillez attendre avant de réessayer.');
        }
        throw new Error(data.error || 'Échec de l\'envoi de l\'email de réinitialisation');
      }

      setSuccess(true);
      
      // If email was not sent but token was created, show the reset link
      if (!data.emailSent && (data.resetUrl || data.showResetLink)) {
        setResetUrl(data.resetUrl || '');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setError(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-blue-500 mb-2">DocFlow</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Réinitialiser le mot de passe</h2>
          <p className="text-gray-600">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Reset Request Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              {resetUrl ? (
                <>
                  <h3 className="text-xl font-semibold text-gray-900">Lien de réinitialisation créé!</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                    <p className="text-sm text-gray-700 mb-2 font-medium">
                      ⚠️ Email non configuré ou erreur d'envoi. Utilisez ce lien pour réinitialiser votre mot de passe:
                    </p>
                    <div className="bg-white p-3 rounded border border-gray-200 break-all">
                      <a 
                        href={resetUrl} 
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {resetUrl}
                      </a>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Copiez ce lien et ouvrez-le dans votre navigateur. Le lien expirera dans 1 heure.
                    </p>
                    <p className="text-xs text-yellow-700 mt-3 font-medium">
                      💡 Pour recevoir les emails automatiquement, configurez SMTP dans le fichier .env.local
                    </p>
                  </div>
                  <button
                    onClick={() => window.open(resetUrl, '_blank')}
                    className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    Ouvrir le lien de réinitialisation
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-900">Email envoyé avec succès!</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left mt-4">
                    <p className="text-sm text-gray-700 mb-2">
                      ✅ Un email de réinitialisation a été envoyé à <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      Veuillez vérifier votre boîte de réception et votre dossier spam.
                    </p>
                    <p className="text-xs text-gray-500 mt-3">
                      Le lien dans l'email expirera dans 1 heure.
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left mt-4">
                    <p className="text-xs text-blue-800">
                      💡 <strong>Conseil:</strong> Si vous ne voyez pas l'email, vérifiez votre dossier spam/courrier indésirable.
                    </p>
                  </div>
                </>
              )}
              <button
                onClick={() => router.push('/login')}
                className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Entrez votre adresse email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                  autoFocus
                />
              </div>

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
                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                <ArrowLeft size={16} />
                Retour à la connexion
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

