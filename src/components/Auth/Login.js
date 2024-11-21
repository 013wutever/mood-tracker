import React, { useState } from 'react';
import { Mail, Lock, Loader } from 'lucide-react';
import CryptoJS from 'crypto-js';
import googleSheetsService from '../../services/googleSheets';
import { getTranslation } from '../../utils/translations';

const Login = ({ language = 'el', onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const t = (path) => getTranslation(language, path);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!validateEmail(email)) {
      setError(t('auth.error.invalidEmail'));
      return;
    }

    if (!validatePassword(password)) {
      setError(t('auth.error.passwordLength'));
      return;
    }

    setIsLoading(true);
    const hashedPassword = hashPassword(password);

    try {
      if (isNewUser) {
        // Register
        const result = await googleSheetsService.addUser(email, hashedPassword);
        if (result.success) {
          onLogin(email);
        } else {
          setError(result.error || t('auth.error.generic'));
        }
      } else {
        // Login
        const result = await googleSheetsService.verifyUser(email, hashedPassword);
        if (result.success) {
          onLogin(email);
        } else {
          setError(result.error || t('auth.error.generic'));
        }
      }
    } catch (error) {
      setError(t('auth.error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glassmorphic rounded-2xl p-8 backdrop-blur-xl bg-white/10">
        <h1 className="text-2xl font-semibold text-center mb-8">
          {isNewUser ? t('auth.titleRegister') : t('auth.title')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glassmorphic bg-white/5 rounded-xl 
                          focus:ring-2 focus:ring-white/20 focus:outline-none"
                placeholder="example@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glassmorphic bg-white/5 rounded-xl
                          focus:ring-2 focus:ring-white/20 focus:outline-none"
                placeholder="••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-pink-300 text-sm text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 glassmorphic bg-white/10 rounded-xl
                     hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20
                     transition-all duration-300 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              isNewUser ? t('auth.register') : t('auth.login')
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsNewUser(!isNewUser)}
            className="w-full text-sm text-white/70 hover:text-white transition-colors"
          >
            {isNewUser 
              ? t('auth.switchToLogin') 
              : t('auth.switchToRegister')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
