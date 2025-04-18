import { useState } from 'react';
import { ArrowRight, User, Lock } from 'lucide-react';
import {CONFIG} from "../../utils/utils.ts";

interface LoginProps {
  onLogin: (token: string, username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [touched, setTouched] = useState({ user: false, pass: false });

  const handleLogin = async () => {
    if (username.trim() === '' || password.trim() === '') {
      return; // Evita hacer login si faltan campos
    }

    try {
      setIsLoggingIn(true);
      const response = await fetch(`http://${CONFIG.host}:3001/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setError('Credenciales incorrectas');
        setIsLoggingIn(false);
        return;
      }

      const data = await response.json();
      document.cookie = `token=${data.token}`;

      setTimeout(() => {
        onLogin(data.token, username);
      }, 600);
    } catch (error) {
      setError('Inicio de sesión fallido. Verifica tus credenciales: '+ error);
      setIsLoggingIn(false);
    }
  };

  return (
      <div
          className="w-screen h-screen bg-gray-100 bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: 'url(/background.jpg)' }}
          aria-label="Pantalla de inicio de sesión"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-white/60 backdrop-blur-sm" />

        <div
            className={`backdrop-blur-xl bg-white/70 border border-white/30 shadow-2xl text-gray-800 p-8 rounded-3xl w-[360px] transition-all duration-700 ${
                isLoggingIn ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'
            }`}
            role="form"
            aria-labelledby="login-title"
        >
          <h2
              id="login-title"
              className="text-blue-600 font-semibold text-center text-xl mb-6"
          >
            RL WebAPP
          </h2>

          <div className="mb-4">
            <label htmlFor="username" className="block mb-1 text-sm text-gray-600">
              Usuario
            </label>
            <div className="flex items-center border-b border-blue-400 mb-1">
              <User className="text-blue-500 mr-2" />
              <input
                  id="username"
                  type="text"
                  placeholder="Escribe tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, user: true }))}
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none py-1"
                  aria-invalid={!!error}
                  aria-describedby="userError"
              />
            </div>
            {touched.user && username.trim() === '' && (
                <p id="userError" className="text-red-500 text-sm mt-1">
                  El usuario es obligatorio.
                </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block mb-1 text-sm text-gray-600">
              Contraseña
            </label>
            <div className="flex items-center border-b border-blue-400 mb-1">
              <Lock className="text-blue-500 mr-2" />
              <input
                  id="password"
                  type="password"
                  placeholder="Escribe tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, pass: true }))}
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none py-1"
                  aria-invalid={!!error}
                  aria-describedby="passError"
              />
            </div>
            {touched.pass && password.trim() === '' && (
                <p id="passError" className="text-red-500 text-sm mt-1">
                  La contraseña es obligatoria.
                </p>
            )}
          </div>

          {error && (
              <p className="text-red-600 text-sm mb-4">
                {error}
              </p>
          )}

          <div className="flex justify-end">
            <button
                onClick={handleLogin}
                className="bg-blue-500 hover:bg-blue-600 rounded-full p-3 transition duration-300"
                aria-label="Iniciar sesión"
            >
              <ArrowRight className="text-white" />
            </button>
          </div>
        </div>
      </div>
  );
}
