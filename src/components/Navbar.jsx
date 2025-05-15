// In Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { Users, FileText, Home, BarChart2 } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'border-b-2 border-white' : '';
  };

  return (
    <nav className="bg-orange-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="font-bold text-xl">EMPRESSPC.IN</span>
            </Link>
          </div>
          
          <div className="flex space-x-6">
            <Link 
              to="/dashboard" 
              className={`px-3 py-2 hover:text-orange-200 flex items-center ${isActive('/dashboard')}`}
            >
              <BarChart2 className="h-5 w-5 mr-1" />
              Dashboard
            </Link>
            <Link 
              to="/parties" 
              className={`px-3 py-2 hover:text-orange-200 flex items-center ${isActive('/parties')}`}
            >
              <Users className="h-5 w-5 mr-1" />
              Parties
            </Link>
            <Link 
              to="/quotations" 
              className={`px-3 py-2 hover:text-orange-200 flex items-center ${
                location.pathname.startsWith('/quotations') ? 'border-b-2 border-white' : ''
              }`}
            >
              <FileText className="h-5 w-5 mr-1" />
              Quotations
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;