import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import {setCookie} from '../../utils/cookieFunc.ts'

const host = "152.200.153.166";



const Login: React.FC<{ onLogin: (token: string, username: string) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {

      const response = await fetch(`http://${host}:3001/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password}),
      });

      if (!response.ok) {
        throw new Error('Error de inicio de sesión');
      }

      const data = await response.json();
      setCookie("token", data.token,30);
      onLogin(data.token, username);
    } catch (error) {
      if( typeof error === "object" && error && "message" in error && typeof error.message === "string"){
        console.error(error);
        toast.error(`Error al iniciar sesión: ${error.message}`);
      }

    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Usuario:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        {error && <p className="text-red-500 text-xs italic">{error}</p>}
        <button type="submit" className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Iniciar Sesión
        </button>
      </form>
      <ToastContainer />
    </>
  );
};

export default Login;