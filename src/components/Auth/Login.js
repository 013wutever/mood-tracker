import React, { useState } from 'react';
import { Mail, Lock, Loader } from 'lucide-react';
import CryptoJS from 'crypto-js';
import googleSheetsService from '../../services/googleSheets';
import { getTranslation } from '../../utils/translations';
import GlassmorphicContainer from '../../components/ui/GlassmorphicContainer';

const Login = ({ language = 'el', onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const translations = {
    el: {
      title: 'Καλώς ήρθατε',
      titleRegister: 'Δημιουργία Λογαριασμού',
      email: 'Email',
      password: 'Κωδικός',
      login: 'Σύνδεση',
      register: 'Εγγραφή',
      switchToRegister: 'Δεν έχετε λογαριασμό; Εγγραφείτε',
      switchToLogin: 'Έχετε ήδη λογαριασμό; Συνδεθείτε',
      error: {
        invalidEmail: 'Παρακαλώ εισάγετε έγκυρο email',
        passwordLength: 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες',
        generic: 'Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.'
      }
    },
    en: {
      // ... (διατηρούμε τα υπάρχοντα translations)
    }
  };

  const t = (key) => {
    const translation = key.split('.').reduce((obj, k) => obj?.[k], translations[language]);
    return translation || key;
  };

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
    // ... (διατηρούμε το υπάρχον handleSubmit)
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassmorphicContainer className="w-full max-w-md rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-8">
          {isNewUser ? t('titleRegister') : t('title')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <GlassmorphicContainer as="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-white/20 focus:outline-none"
                placeholder="example@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <GlassmorphicContainer as="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-white/20 focus:outline-none"
                placeholder="••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-pink-300 text-sm text-center">
              {error}
            </p>
          )}

          <GlassmorphicContainer
            as="button"
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-xl flex items-center justify-center"
            hover={true}
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              isNewUser ? t('register') : t('login')
            )}
          </GlassmorphicContainer>

          <GlassmorphicContainer
            as="button"
            type="button"
            onClick={() => setIsNewUser(!isNewUser)}
            className="w-full text-sm text-white/70 hover:text-white transition-colors"
            hover={true}
          >
            {isNewUser ? t('switchToLogin') : t('switchToRegister')}
          </GlassmorphicContainer>
        </form>
      </GlassmorphicContainer>
    </div>
  );
};

export default Login;
