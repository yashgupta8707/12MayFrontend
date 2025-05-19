import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaFileInvoiceDollar, FaListAlt, FaTh } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();
  
  // Helper function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">EmpressPC</span>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link 
              to="/dashboard" 
              className={`flex items-center text-gray-200 hover:text-white hover:border-b-2 hover:border-white px-3 py-1 ${
                isActive('/dashboard') ? 'border-b-2 border-white text-white' : ''
              }`}
            >
              <FaHome className="mr-1" />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/all-quotations" 
              className={`flex items-center text-gray-200 hover:text-white hover:border-b-2 hover:border-white px-3 py-1 ${
                isActive('/all-quotations') ? 'border-b-2 border-white text-white' : ''
              }`}
            >
              <FaListAlt className="mr-1" />
              <span>All Quotations</span>
            </Link>
            
            <Link 
              to="/quotations" 
              className={`flex items-center text-gray-200 hover:text-white hover:border-b-2 hover:border-white px-3 py-1 ${
                isActive('/quotations') ? 'border-b-2 border-white text-white' : ''
              }`}
            >
              <FaFileInvoiceDollar className="mr-1" />
              <span>New Quotation</span>
            </Link>
            
            <Link 
              to="/parties" 
              className={`flex items-center text-gray-200 hover:text-white hover:border-b-2 hover:border-white px-3 py-1 ${
                isActive('/parties') ? 'border-b-2 border-white text-white' : ''
              }`}
            >
              <FaUsers className="mr-1" />
              <span>Parties</span>
            </Link>
            
            <Link 
              to="/quote" 
              className={`flex items-center text-gray-200 hover:text-white hover:border-b-2 hover:border-white px-3 py-1 ${
                isActive('/quote') ? 'border-b-2 border-white text-white' : ''
              }`}
            >
              <FaTh className="mr-1" />
              <span>Quotes</span>
            </Link>
          </div>
          
          {/* User Menu - optional */}
          <div className="flex items-center">
            <button className="bg-blue-700 hover:bg-blue-900 px-4 py-2 rounded-md text-sm">
              Log In
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation - shows on small screens */}
      <div className="md:hidden p-2 border-t border-blue-700">
        <div className="flex justify-around">
          <Link to="/dashboard" className={`flex flex-col items-center p-2 ${isActive('/dashboard') ? 'text-white' : 'text-gray-300'}`}>
            <FaHome className="text-xl mb-1" />
            <span className="text-xs">Dashboard</span>
          </Link>
          
          <Link to="/all-quotations" className={`flex flex-col items-center p-2 ${isActive('/all-quotations') ? 'text-white' : 'text-gray-300'}`}>
            <FaListAlt className="text-xl mb-1" />
            <span className="text-xs">All Quotes</span>
          </Link>
          
          <Link to="/quotations" className={`flex flex-col items-center p-2 ${isActive('/quotations') ? 'text-white' : 'text-gray-300'}`}>
            <FaFileInvoiceDollar className="text-xl mb-1" />
            <span className="text-xs">New Quote</span>
          </Link>
          
          <Link to="/parties" className={`flex flex-col items-center p-2 ${isActive('/parties') ? 'text-white' : 'text-gray-300'}`}>
            <FaUsers className="text-xl mb-1" />
            <span className="text-xs">Parties</span>
          </Link>
          
          <Link to="/quote" className={`flex flex-col items-center p-2 ${isActive('/quote') ? 'text-white' : 'text-gray-300'}`}>
            <FaTh className="text-xl mb-1" />
            <span className="text-xs">Quotes</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;