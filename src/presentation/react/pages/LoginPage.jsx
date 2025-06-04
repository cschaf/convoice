import React, { useState } from 'react';
import { toast } from 'sonner';

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:text-white";
  const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300";

  const handleSubmit = (event) => {
    event.preventDefault();
    if (username === 'Con' && password === 'Voice') {
      if (onLoginSuccess) {
        onLoginSuccess();
        localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
      }
    } else {
      toast.error('Ungültiger Benutzername oder Passwort.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl space-y-6">
        <div className="text-center">
          {/* Optional: Music Icon or simple logo */}
          {/* <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg> */}
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">ConVoice</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Bitte melden Sie sich an.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className={labelClasses}>
              Benutzername
            </label>
            <input
              id="username"
              type="text"
              placeholder="Benutzername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClasses}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className={labelClasses}>
              Passwort
            </label>
            <input
              id="password"
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-md shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            Anmelden
          </button>
        </form>
      </div>
      <footer className="text-center mt-8 text-sm text-slate-600 dark:text-slate-400">
        &copy; {new Date().getFullYear()} ConVoice. Alle Rechte vorbehalten.
      </footer>
    </div>
  );
};

export default LoginPage;
