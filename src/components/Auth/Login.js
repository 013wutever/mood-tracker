import React, { useState } from 'react';
import { Mail, Lock, Loader } from 'lucide-react';
import CryptoJS from 'crypto-js';
import googleSheetsService from '../../services/googleSheets';
import { getTranslation } from '../../utils/translations';

  const translations = {
    el: {
      title: 'Καλώς ήρθατε',
      titleRegister: 'Δημιουργία λογαριασμού',
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
      title: 'Welcome',
      titleRegister: 'Create Account',
      email: 'Email',
      password: 'Password',
      login: 'Login',
      register: 'Register',
      switchToRegister: "Don't have an account? Sign up",
      switchToLogin: 'Already have an account? Sign in',
      error: {
        invalidEmail: 'Please enter a valid email',
        passwordLength: 'Password must be at least 6 characters long',
        generic: 'Something went wrong. Please try again.'
      }
    }
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
    e.preventDefault();
    setError('');

    // Validation
    if (!validateEmail(email)) {
      setError(translations[language].error.invalidEmail);
      return;
    }

    if (!validatePassword(password)) {
      setError(translations[language].error.passwordLength);
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
          setError(result.error || translations[language].error.generic);
        }
      } else {
        // Login
        const result = await googleSheetsService.verifyUser(email, hashedPassword);
        if (result.success) {
          onLogin(email);
        } else {
          setError(result.error || translations[language].error.generic);
        }
      }
    } catch (error) {
      setError(translations[language].error.generic);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glassmorphic rounded-2xl p-8 backdrop-blur-xl bg-white/10">
        <h1 className="text-2xl font-semibold text-center mb-8">
          {isNewUser ? translations[language].titleRegister : translations[language].title}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {translations[language].email}
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
              {translations[language].password}
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
              isNewUser ? translations[language].register : translations[language].login
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsNewUser(!isNewUser)}
            className="w-full text-sm text-white/70 hover:text-white transition-colors"
          >
            {isNewUser 
              ? translations[language].switchToLogin 
              : translations[language].switchToRegister}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
