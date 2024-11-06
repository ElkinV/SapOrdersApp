import React from 'react';
import { BarChart2 } from 'lucide-react';

interface HeaderProps {
  username: string | null;
}

const Header: React.FC<HeaderProps> = ({ username }) => {
  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <BarChart2 className="mr-2" size={24} />
          <h1 className="text-2xl font-bold">Orden de Venta</h1>
        </div>
        {username && <div className="text-lg font-semibold underline">RL | {username}</div>}
      </div>
    </header>
  );
};

export default Header;