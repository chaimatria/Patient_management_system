'use client';

import { useState, useEffect } from 'react';
import { Activity, Mail, Lock, X, ArrowLeft } from 'lucide-react';

export default function PasswordResetModal({ isOpen, onClose, initialStep = 'request', initialToken = null }) {
  const [step, setStep] = useState(initialStep); // 'request' or 'reset'
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [token, setToken] = useState(initialToken);

  // If modal opens with a token, verify it
  useEffect(() => {
    if (isOpen && initialToken && step === 'reset') {
      verifyToken(initialToken);
    }
  }, [isOpen, initialToken, step]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('request');
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess(false);
      setResetUrl('');
      setToken(null);
      setIsValidToken(false);
    }
  }, [isOpen]);

  const verifyToken = async (tokenToVerify) => {
    setIsVerifying(true);
    setError('');
    try {
      const response = await fetch(`/api/auth/reset-password?token=${tokenToVerify}`);
      const data = await response.json();

      if (!response.ok || !data.valid) {
        setError(data.error || 'Lien invalide ou expiré');
        setIsValidToken(false);
      } else {
        setIsValidToken(true);
        setEmail(data.email || '');
        setToken(tokenToVerify);
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      setError('Échec de la vérification du lien');
      setIsValidToken(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRequestSubmit = async (e) => {
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

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 1) {
      setError('Veuillez entrer un nouveau mot de passe');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Échec de la réinitialisation du mot de passe');
      }

      setSuccess(true);
      
      // Close modal and return to login after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.message || 'Échec de la réinitialisation du mot de passe');
      setIsLoading(false);
    }
  };

  const handleResetLinkClick = () => {
    // Extract token from reset URL
    const urlParams = new URLSearchParams(resetUrl.split('?')[1]);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setStep('reset');
      verifyToken(tokenFromUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {step === 'request' ? 'Réinitialiser le mot de passe' : 'Nouveau mot de passe'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'request' ? (
            // Request Password Reset Step
            <>
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
                          ⚠️ Email non configuré. Utilisez ce lien:
                        </p>
                        <div className="bg-white p-3 rounded border border-gray-200 break-all">
                          <a 
                            href={resetUrl} 
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                            onClick={(e) => {
                              e.preventDefault();
                              handleResetLinkClick();
                            }}
                          >
                            {resetUrl}
                          </a>
                        </div>
                        <button
                          onClick={handleResetLinkClick}
                          className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors text-sm"
                        >
                          Continuer avec ce lien
                        </button>
                      </div>
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
                          💡 <strong>Conseil:</strong> Si vous ne voyez pas l'email, vérifiez votre dossier spam.
                        </p>
                      </div>
                    </>
                  )}
                  <button
                    onClick={onClose}
                    className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-6">
                  <p className="text-gray-600 text-sm">
                    Entrez votre adresse email pour recevoir un lien de réinitialisation
                  </p>

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
                </form>
              )}
            </>
          ) : (
            // Reset Password Step
            <>
              {isVerifying ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Vérification du lien...</p>
                </div>
              ) : !isValidToken ? (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <Lock className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Lien invalide ou expiré</h3>
                  <p className="text-gray-600">
                    {error || 'Ce lien de réinitialisation est invalide ou a expiré.'}
                  </p>
                  <button
                    onClick={() => setStep('request')}
                    className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    Demander un nouveau lien
                  </button>
                </div>
              ) : success ? (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Lock className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Mot de passe réinitialisé!</h3>
                  <p className="text-gray-600">
                    Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-6">
                  <p className="text-gray-600 text-sm">
                    {email && `Réinitialisation pour: ${email}`}
                  </p>

                  {/* New Password Field */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Entrez votre nouveau mot de passe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                      autoFocus
                    />
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmez votre nouveau mot de passe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
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
                    {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                  </button>

                  {/* Back Button */}
                  <button
                    type="button"
                    onClick={() => setStep('request')}
                    className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    <ArrowLeft size={16} />
                    Retour
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

