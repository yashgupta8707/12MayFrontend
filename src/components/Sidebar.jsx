import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaFileInvoiceDollar, 
  FaUsers, 
  FaBox, 
  FaChartBar, 
  FaCog, 
  FaListAlt,
  FaPlus,
  FaChevronDown,
  FaChevronRight,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [quotationsExpanded, setQuotationsExpanded] = useState(true);
  const [partiesExpanded, setPartiesExpanded] = useState(false);
  
  // Check if the current path starts with the given path
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        className="fixed z-50 bottom-4 right-4 md:hidden bg-orange-600 text-white p-3 rounded-full shadow-lg"
        onClick={toggleSidebar}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>
      
      <div className={`fixed top-0 left-0 h-full bg-gradient-to-b from-orange-600 to-orange-700 text-white w-64 shadow-xl transition-transform duration-300 ease-in-out z-40 ${
        isOpen ? 'transform-none' : '-translate-x-full'
      } md:relative md:translate-x-0`}>
        
        {/* Logo and App Name */}
        <div className="p-5 border-b border-orange-700 flex items-center">
          <div className="text-2xl font-bold">EmpressPC</div>
        </div>
        
        {/* Navigation Links */}
        <nav className="p-4">
          <ul className="space-y-2">
            {/* Dashboard */}
            <li>
              <Link 
                to="/dashboard" 
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-orange-700 text-white' 
                    : 'text-orange-100 hover:bg-orange-700'
                }`}
              >
                <FaHome className="mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>
            
            {/* Quotations Section with Submenu */}
            <li>
              <div className="space-y-1">
                <button
                  onClick={() => setQuotationsExpanded(!quotationsExpanded)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isActive('/all-quotations') || isActive('/quotations') || isActive('/quote')
                      ? 'bg-orange-700 text-white'
                      : 'text-orange-100 hover:bg-orange-700'
                  }`}
                >
                  <div className="flex items-center">
                    <FaFileInvoiceDollar className="mr-3" />
                    <span>Quotations</span>
                  </div>
                  {quotationsExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                </button>
                
                {quotationsExpanded && (
                  <ul className="pl-10 space-y-1">
                    <li>
                      <Link
                        to="/all-quotations"
                        className={`flex items-center p-2 text-sm rounded-md ${
                          isActive('/all-quotations')
                            ? 'bg-orange-800 text-white'
                            : 'text-orange-200 hover:bg-orange-800'
                        }`}
                      >
                        <FaListAlt className="mr-2" />
                        <span>All Quotations</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/quotations"
                        className={`flex items-center p-2 text-sm rounded-md ${
                          location.pathname === '/quotations'
                            ? 'bg-orange-800 text-white'
                            : 'text-orange-200 hover:bg-orange-800'
                        }`}
                      >
                        <FaPlus className="mr-2" />
                        <span>New Quotation</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/quote"
                        className={`flex items-center p-2 text-sm rounded-md ${
                          isActive('/quote')
                            ? 'bg-orange-800 text-white'
                            : 'text-orange-200 hover:bg-orange-800'
                        }`}
                      >
                        <FaFileInvoiceDollar className="mr-2" />
                        <span>Quotes List</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            </li>
            
            {/* Parties Section with Submenu */}
            <li>
              <div className="space-y-1">
                <button
                  onClick={() => setPartiesExpanded(!partiesExpanded)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isActive('/parties')
                      ? 'bg-orange-700 text-white'
                      : 'text-orange-100 hover:bg-orange-700'
                  }`}
                >
                  <div className="flex items-center">
                    <FaUsers className="mr-3" />
                    <span>Parties</span>
                  </div>
                  {partiesExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                </button>
                
                {partiesExpanded && (
                  <ul className="pl-10 space-y-1">
                    <li>
                      <Link
                        to="/parties"
                        className={`flex items-center p-2 text-sm rounded-md ${
                          location.pathname === '/parties'
                            ? 'bg-orange-800 text-white'
                            : 'text-orange-200 hover:bg-orange-800'
                        }`}
                      >
                        <FaListAlt className="mr-2" />
                        <span>All Parties</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/parties/new"
                        className={`flex items-center p-2 text-sm rounded-md ${
                          location.pathname === '/parties/new'
                            ? 'bg-orange-800 text-white'
                            : 'text-orange-200 hover:bg-orange-800'
                        }`}
                      >
                        <FaPlus className="mr-2" />
                        <span>New Party</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            </li>
            
            {/* Inventory Components */}
            <li>
              <Link
                to="/components"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/components')
                    ? 'bg-orange-700 text-white'
                    : 'text-orange-100 hover:bg-orange-700'
                }`}
              >
                <FaBox className="mr-3" />
                <span>Components</span>
              </Link>
            </li>
            
            {/* Reports */}
            <li>
              <Link
                to="/reports"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/reports')
                    ? 'bg-orange-700 text-white'
                    : 'text-orange-100 hover:bg-orange-700'
                }`}
              >
                <FaChartBar className="mr-3" />
                <span>Reports</span>
              </Link>
            </li>
            
            {/* Settings */}
            <li>
              <Link
                to="/settings"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/settings')
                    ? 'bg-orange-700 text-white'
                    : 'text-orange-100 hover:bg-orange-600'
                }`}
              >
                <FaCog className="mr-3" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Overlay to close sidebar on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;