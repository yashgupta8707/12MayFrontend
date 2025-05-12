import React, { useEffect } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Printer, X } from 'lucide-react';

const PrintMode = () => {
  const { 
    businessDetails, 
    selectedParty, 
    items, 
    quotationNumber, 
    quotationDate, 
    validUntil,
    notes,
    terms,
    togglePrintMode,
    calculateTotalSale,
    calculateTotalTax
  } = useQuotation();
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(date).toLocaleString('en-IN', options).replace(',', ',');
  };
  
  // Auto-print when component mounts
  useEffect(() => {
    // Add a small delay to ensure the component is fully rendered
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Add CSS for print media and enhanced vector graphics
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page { 
          size: A4; 
          margin: 0.5cm;
        }
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        .page-container {
          width: 21cm;
          height: 29.7cm;
          overflow: hidden;
          position: relative;
          page-break-after: always;
        }
        .no-print {
          display: none !important;
        }
        .vector-graphic {
          opacity: 0.3 !important;
        }
      }
      
      @keyframes pulse {
        0% { opacity: 0.3; }
        50% { opacity: 0.4; }
        100% { opacity: 0.3; }
      }
      
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .vector-graphic {
        position: absolute;
        pointer-events: none;
        z-index: 0;
        opacity: 0.3;
        transition: opacity 0.3s ease;
      }
      
      .vector-graphic.animate-pulse {
        animation: pulse 8s infinite ease-in-out;
      }
      
      .vector-graphic.animate-float {
        animation: float 6s infinite ease-in-out;
      }
      
      .vector-graphic.animate-spin {
        animation: spin 20s infinite linear;
      }
      
      .vector-graphic:nth-child(odd) {
        animation-delay: 2s;
      }
      
      .vector-graphic:nth-child(even) {
        animation-delay: 4s;
      }
      
      .vector-graphic:hover {
        opacity: 0.5;
      }
      
      .content-layer {
        position: relative;
        z-index: 10;
      }
      
      .watermark {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 1999;
      }
      
      .glow-effect {
        filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8));
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Calculate subtotal (without GST)
  const subtotal = calculateTotalSale() - calculateTotalTax();
  
  // Calculate total
  const total = calculateTotalSale();
  
  // Calculate total tax
  const totalTax = calculateTotalTax();
  
  // Function to convert number to words - simplified version
  const numberToWords = (num) => {
    if (!num) return '';
    const units = num.toFixed(2).split('.');
    const amount = parseInt(units[0]);
    const paise = parseInt(units[1]);
    
    // This is a simplified version - for production, use a more comprehensive function
    return `${amount} Rupees and ${paise} Paisa only`;
  };
  
  return (
    <div className="bg-white text-gray-800 min-h-screen">
      {/* Print Controls - Not visible when printing */}
      <div className="no-print fixed top-4 right-4 flex space-x-4">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Printer className="mr-2 h-5 w-5" />
          Print
        </button>
        <button
          onClick={togglePrintMode}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center shadow-lg hover:bg-gray-700 transition-colors"
        >
          <X className="mr-2 h-5 w-5" />
          Close
        </button>
      </div>
      
      {/* Quotation Document - strictly contained to one page */}
      <div className="max-w-4xl mx-auto bg-white shadow-sm print:shadow-none relative print:page-container p-3">
        
        {/* Enhanced Watermark */}
        {businessDetails.logo ? (
          <div className="watermark">
            <div className="relative">
              <img 
                src={businessDetails.logo} 
                alt="Watermark" 
                className="w-2/3 max-w-lg"
                style={{
                  transform: 'rotate(-15deg)',
                  mixBlendMode: 'multiply',
                  opacity: 0.08
                }}
              />
              <div 
                className="absolute inset-0" 
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)',
                  filter: 'blur(8px)',
                }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="watermark">
            <div className="relative w-2/3 max-w-lg h-48 opacity-5" 
                 style={{ transform: 'rotate(-15deg)' }}>
              <div className="text-6xl font-bold text-center text-gray-700">
                ESTIMATE
              </div>
            </div>
          </div>
        )}
        
        {/* PC Components Vector Graphics - Enhanced with colors and effects */}
        
        {/* RAM Stick in top-left - Enhanced */}
        <div className="vector-graphic top-20 left-5 w-64 h-32 animate-pulse">
          <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
            {/* Add a subtle glow effect */}
            <defs>
              <filter id="ramGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            {/* RAM Module */}
            <rect x="10" y="30" width="180" height="40" rx="2" fill="rgba(16, 185, 129, 0.05)" stroke="#10b981" strokeWidth="2" />
            
            {/* RAM Chips */}
            <rect x="20" y="40" width="20" height="20" rx="1" fill="rgba(16, 185, 129, 0.07)" stroke="#10b981" strokeWidth="1.5" />
            <rect x="50" y="40" width="20" height="20" rx="1" fill="rgba(16, 185, 129, 0.07)" stroke="#10b981" strokeWidth="1.5" />
            <rect x="80" y="40" width="20" height="20" rx="1" fill="rgba(16, 185, 129, 0.07)" stroke="#10b981" strokeWidth="1.5" />
            <rect x="110" y="40" width="20" height="20" rx="1" fill="rgba(16, 185, 129, 0.07)" stroke="#10b981" strokeWidth="1.5" />
            <rect x="140" y="40" width="20" height="20" rx="1" fill="rgba(16, 185, 129, 0.07)" stroke="#10b981" strokeWidth="1.5" />
            <rect x="170" y="40" width="10" height="20" rx="1" fill="rgba(16, 185, 129, 0.07)" stroke="#10b981" strokeWidth="1.5" />
            
            {/* Notch */}
            <path d="M80,70 L80,80 L120,80 L120,70" fill="rgba(16, 185, 129, 0.05)" stroke="#10b981" strokeWidth="1.8" />
            
            {/* Connector pins */}
            <line x1="15" y1="70" x2="15" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="20" y1="70" x2="20" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="25" y1="70" x2="25" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="30" y1="70" x2="30" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="35" y1="70" x2="35" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="40" y1="70" x2="40" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="45" y1="70" x2="45" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="50" y1="70" x2="50" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="55" y1="70" x2="55" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="60" y1="70" x2="60" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="65" y1="70" x2="65" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="70" y1="70" x2="70" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="75" y1="70" x2="75" y2="75" stroke="#10b981" strokeWidth="1.5" />
            
            <line x1="125" y1="70" x2="125" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="130" y1="70" x2="130" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="135" y1="70" x2="135" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="140" y1="70" x2="140" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="145" y1="70" x2="145" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="150" y1="70" x2="150" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="155" y1="70" x2="155" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="160" y1="70" x2="160" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="165" y1="70" x2="165" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="170" y1="70" x2="170" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="175" y1="70" x2="175" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="180" y1="70" x2="180" y2="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="185" y1="70" x2="185" y2="75" stroke="#10b981" strokeWidth="1.5" />
            
            {/* Digital data flow effect */}
            <rect x="30" y="45" width="3" height="10" fill="#10b981" opacity="0.7">
              <animate attributeName="y" from="45" to="35" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.7" to="0" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
            </rect>
            <rect x="90" y="45" width="3" height="10" fill="#10b981" opacity="0.7">
              <animate attributeName="y" from="45" to="35" dur="1.5s" begin="0.7s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.7" to="0" dur="1.5s" begin="0.7s" repeatCount="indefinite" />
            </rect>
            <rect x="150" y="45" width="3" height="10" fill="#10b981" opacity="0.7">
              <animate attributeName="y" from="45" to="35" dur="1.5s" begin="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.7" to="0" dur="1.5s" begin="1.2s" repeatCount="indefinite" />
            </rect>
          </svg>
        </div>
        
        {/* SSD in center right - Enhanced */}
        <div className="vector-graphic top-1/3 right-10 w-56 h-28 animate-float">
          <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="ssdGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="ssdGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.05 }} />
                <stop offset="100%" style={{ stopColor: '#6d28d9', stopOpacity: 0.1 }} />
              </linearGradient>
            </defs>
            
            {/* SSD Drive */}
            <rect x="20" y="20" width="160" height="60" rx="3" fill="url(#ssdGradient)" stroke="#8b5cf6" strokeWidth="1.8" />
            
            {/* NAND Chips */}
            <rect x="30" y="30" width="30" height="20" rx="1" fill="rgba(139, 92, 246, 0.1)" stroke="#8b5cf6" strokeWidth="1.5" />
            <rect x="70" y="30" width="30" height="20" rx="1" fill="rgba(139, 92, 246, 0.1)" stroke="#8b5cf6" strokeWidth="1.5" />
            <rect x="110" y="30" width="30" height="20" rx="1" fill="rgba(139, 92, 246, 0.1)" stroke="#8b5cf6" strokeWidth="1.5" />
            <rect x="150" y="30" width="20" height="20" rx="1" fill="rgba(139, 92, 246, 0.1)" stroke="#8b5cf6" strokeWidth="1.5" />
            
            {/* Controller */}
            <rect x="30" y="60" width="40" height="15" rx="1" fill="rgba(139, 92, 246, 0.15)" stroke="#8b5cf6" strokeWidth="1.8" />
            
            {/* SATA Connector */}
            <rect x="140" y="60" width="30" height="15" rx="1" fill="rgba(139, 92, 246, 0.15)" stroke="#8b5cf6" strokeWidth="1.8" />
            <line x1="142" y1="60" x2="142" y2="75" stroke="#8b5cf6" strokeWidth="1.2" />
            <line x1="146" y1="60" x2="146" y2="75" stroke="#8b5cf6" strokeWidth="1.2" />
            <line x1="150" y1="60" x2="150" y2="75" stroke="#8b5cf6" strokeWidth="1.2" />
            <line x1="154" y1="60" x2="154" y2="75" stroke="#8b5cf6" strokeWidth="1.2" />
            <line x1="158" y1="60" x2="158" y2="75" stroke="#8b5cf6" strokeWidth="1.2" />
            <line x1="162" y1="60" x2="162" y2="75" stroke="#8b5cf6" strokeWidth="1.2" />
            <line x1="166" y1="60" x2="166" y2="75" stroke="#8b5cf6" strokeWidth="1.2" />
            
            {/* Data transfer animation */}
            <path d="M80,38 L70,38 L70,42 L80,42" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M120,38 L130,38 L130,42 L120,42" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.7">
              <animate attributeName="opacity" values="0;0.7;0" dur="2s" begin="1s" repeatCount="indefinite" />
            </path>
          </svg>
        </div>
        
        {/* Motherboard in bottom-right corner - Enhanced */}
        <div className="vector-graphic bottom-10 right-10 w-64 h-64 animate-pulse">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="moboGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="moboGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.05 }} />
                <stop offset="100%" style={{ stopColor: '#b91c1c', stopOpacity: 0.08 }} />
              </linearGradient>
            </defs>
            
            {/* Motherboard Outline */}
            <rect x="20" y="20" width="160" height="160" rx="5" fill="url(#moboGradient)" stroke="#ef4444" strokeWidth="2" />
            
            {/* CPU Socket */}
            <rect x="50" y="40" width="50" height="50" fill="rgba(239, 68, 68, 0.08)" stroke="#ef4444" strokeWidth="1.8" />
            <circle cx="75" cy="65" r="20" fill="rgba(239, 68, 68, 0.05)" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3,3" />
            
            {/* RAM Slots */}
            <rect x="120" y="40" width="10" height="60" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="140" y="40" width="10" height="60" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="160" y="40" width="10" height="60" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1.5" />
            
            {/* PCIe Slots */}
            <rect x="40" y="120" width="100" height="8" fill="rgba(239, 68, 68, 0.08)" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="40" y="135" width="100" height="8" fill="rgba(239, 68, 68, 0.08)" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="40" y="150" width="60" height="8" fill="rgba(239, 68, 68, 0.08)" stroke="#ef4444" strokeWidth="1.5" />
            
            {/* I/O Panel */}
            <rect x="20" y="40" width="15" height="80" fill="rgba(239, 68, 68, 0.06)" stroke="#ef4444" strokeWidth="1.5" />
            
            {/* SATA Ports */}
            <rect x="150" y="120" width="15" height="8" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="150" y="135" width="15" height="8" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="150" y="150" width="15" height="8" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1.5" />
            
            {/* Power Connector */}
            <rect x="40" y="40" width="10" height="15" fill="rgba(239, 68, 68, 0.12)" stroke="#ef4444" strokeWidth="1.5" />
            
            {/* Chipset */}
            <rect x="100" y="100" width="25" height="25" fill="rgba(239, 68, 68, 0.12)" stroke="#ef4444" strokeWidth="1.8" />
            
            {/* Capacitors */}
            <circle cx="120" cy="140" r="5" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1.2" />
            <circle cx="130" cy="140" r="5" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1.2" />
            <circle cx="140" cy="140" r="5" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1.2" />
            <circle cx="50" cy="100" r="5" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1.2" />
            <circle cx="60" cy="100" r="5" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1.2" />
            
            {/* Circuit trace animations */}
            <path d="M50,70 L40,70 L40,100 L50,100" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3s" repeatCount="indefinite" />
            </path>
            <path d="M100,125 L100,135 L150,135" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.7">
              <animate attributeName="opacity" values="0.2;0.7;0.2" dur="3s" begin="1.5s" repeatCount="indefinite" />
            </path>
          </svg>
        </div>
        
        {/* Power Supply Unit in center-bottom - Enhanced */}
        <div className="vector-graphic bottom-40 left-1/3 w-60 h-40 animate-pulse">
          <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="psuGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="psuGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#64748b', stopOpacity: 0.05 }} />
                <stop offset="100%" style={{ stopColor: '#475569', stopOpacity: 0.08 }} />
              </linearGradient>
            </defs>
            
            {/* PSU Case */}
            <rect x="20" y="20" width="160" height="80" rx="2" fill="url(#psuGradient)" stroke="#64748b" strokeWidth="1.8" />
            
            {/* Fan - with rotation animation */}
            <circle cx="60" cy="60" r="25" fill="rgba(100, 116, 139, 0.05)" stroke="#64748b" strokeWidth="1.8" />
            <g transform="translate(60, 60)">
              <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="10s" repeatCount="indefinite" />
              <circle cx="0" cy="0" r="20" fill="none" stroke="#64748b" strokeWidth="1" />
              <circle cx="0" cy="0" r="15" fill="none" stroke="#64748b" strokeWidth="1" />
              <line x1="-25" y1="0" x2="25" y2="0" stroke="#64748b" strokeWidth="1" />
              <line x1="0" y1="-25" x2="0" y2="25" stroke="#64748b" strokeWidth="1" />
              <line x1="-18" y1="-18" x2="18" y2="18" stroke="#64748b" strokeWidth="1" />
              <line x1="-18" y1="18" x2="18" y2="-18" stroke="#64748b" strokeWidth="1" />
            </g>
            
            {/* Power Switch */}
            <rect x="120" y="30" width="20" height="10" rx="1" fill="rgba(100, 116, 139, 0.15)" stroke="#64748b" strokeWidth="1.5" />
            
            {/* Power Cable Socket */}
            <rect x="150" y="30" width="20" height="15" rx="1" fill="rgba(100, 116, 139, 0.15)" stroke="#64748b" strokeWidth="1.5" />
            
            {/* Cable Outputs with power flow animation */}
            <path d="M120,80 L130,80 L130,90 L150,90 L150,80 L160,80" fill="none" stroke="#64748b" strokeWidth="1.8" />
            <circle cx="125" cy="80" r="1.5" fill="#64748b">
              <animate attributeName="cx" values="125;160;125" dur="3s" repeatCount="indefinite" />
            </circle>
            
            {/* Voltage Selector */}
            <rect x="120" y="50" width="20" height="10" rx="1" fill="rgba(100, 116, 139, 0.1)" stroke="#64748b" strokeWidth="1.5" />
            <line x1="130" y1="50" x2="130" y2="60" stroke="#64748b" strokeWidth="1" />
          </svg>
        </div>
        
        {/* PC Case with Cooling Fan - Enhanced */}
        <div className="vector-graphic top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 opacity-20">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="caseGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="caseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#1e293b', stopOpacity: 0.05 }} />
                <stop offset="100%" style={{ stopColor: '#0f172a', stopOpacity: 0.08 }} />
              </linearGradient>
            </defs>
            
            {/* Case Outline */}
            <rect x="40" y="20" width="120" height="160" rx="2" fill="url(#caseGradient)" stroke="#1e293b" strokeWidth="2" />
            
            {/* Front Panel */}
            <rect x="40" y="20" width="120" height="30" rx="2" fill="rgba(30, 41, 59, 0.08)" stroke="#1e293b" strokeWidth="1.5" />
            
            {/* Power Button with pulse animation */}
            <circle cx="150" cy="35" r="5" fill="none" stroke="#1e293b" strokeWidth="1.5" />
            <circle cx="150" cy="35" r="3" fill="#1e293b">
              <animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite" />
            </circle>
            
            {/* USB Ports with data transfer animation */}
            <rect x="50" y="30" width="10" height="5" rx="1" fill="rgba(30, 41, 59, 0.1)" stroke="#1e293b" strokeWidth="1" />
            <rect x="65" y="30" width="10" height="5" rx="1" fill="rgba(30, 41, 59, 0.1)" stroke="#1e293b" strokeWidth="1" />
            <rect x="57.5" y="32.5" width="1" height="1" fill="#1e293b">
              <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
            </rect>
            
            {/* Audio Jacks */}
            <circle cx="85" cy="32.5" r="2.5" fill="none" stroke="#1e293b" strokeWidth="1" />
            <circle cx="95" cy="32.5" r="2.5" fill="none" stroke="#1e293b" strokeWidth="1" />
            
            {/* Cooling Fans with rotation */}
            <g transform="translate(100, 80)">
              <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="8s" repeatCount="indefinite" />
              <circle cx="0" cy="0" r="20" fill="rgba(30, 41, 59, 0.05)" stroke="#1e293b" strokeWidth="1.5" />
              <path d="M-20,0 C-20,-11 -11,-20 0,-20 C11,-20 20,-11 20,0 C20,11 11,20 0,20 C-11,20 -20,11 -20,0 Z" fill="none" stroke="#1e293b" strokeWidth="1" />
              <line x1="0" y1="-20" x2="0" y2="20" stroke="#1e293b" strokeWidth="1" />
              <line x1="-20" y1="0" x2="20" y2="0" stroke="#1e293b" strokeWidth="1" />
              <line x1="-14" y1="-14" x2="14" y2="14" stroke="#1e293b" strokeWidth="1" />
              <line x1="-14" y1="14" x2="14" y2="-14" stroke="#1e293b" strokeWidth="1" />
            </g>
            
            <g transform="translate(100, 130)">
              <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="8s" begin="0.5s" repeatCount="indefinite" />
              <circle cx="0" cy="0" r="20" fill="rgba(30, 41, 59, 0.05)" stroke="#1e293b" strokeWidth="1.5" />
              <path d="M-20,0 C-20,-11 -11,-20 0,-20 C11,-20 20,-11 20,0 C20,11 11,20 0,20 C-11,20 -20,11 -20,0 Z" fill="none" stroke="#1e293b" strokeWidth="1" />
              <line x1="0" y1="-20" x2="0" y2="20" stroke="#1e293b" strokeWidth="1" />
              <line x1="-20" y1="0" x2="20" y2="0" stroke="#1e293b" strokeWidth="1" />
              <line x1="-14" y1="-14" x2="14" y2="14" stroke="#1e293b" strokeWidth="1" />
              <line x1="-14" y1="14" x2="14" y2="-14" stroke="#1e293b" strokeWidth="1" />
            </g>
            
            {/* Side Panel Lines */}
            <line x1="50" y1="60" x2="150" y2="60" stroke="#1e293b" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="50" y1="160" x2="150" y2="160" stroke="#1e293b" strokeWidth="1" strokeDasharray="5,5" />
          </svg>
        </div>
        
        {/* NEW: GPU in top right - Enhanced */}
        <div className="vector-graphic top-5 right-5 w-72 h-48 animate-float">
          <svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="gpuGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="gpuGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.05 }} />
                <stop offset="100%" style={{ stopColor: '#1d4ed8', stopOpacity: 0.1 }} />
              </linearGradient>
              <radialGradient id="fanGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0 }} />
              </radialGradient>
            </defs>
            
            {/* GPU Card */}
            <rect x="40" y="30" width="160" height="100" rx="5" fill="url(#gpuGradient)" stroke="#3b82f6" strokeWidth="1.8" />
            <rect x="50" y="40" width="100" height="80" rx="2" fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth="1.5" />
            
            {/* GPU Fan with rotation */}
            <circle cx="100" cy="80" r="25" fill="url(#fanGradient)" stroke="#3b82f6" strokeWidth="1.5" />
            <g transform="translate(100, 80)">
              <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="6s" repeatCount="indefinite" />
              <path d="M-15,0 C-15,-8 -8,-15 0,-15 C8,-15 15,-8 15,0 C15,8 8,15 0,15 C-8,15 -15,8 -15,0 Z" fill="none" stroke="#3b82f6" strokeWidth="1" />
              <line x1="0" y1="-15" x2="0" y2="15" stroke="#3b82f6" strokeWidth="0.8" />
              <line x1="-15" y1="0" x2="15" y2="0" stroke="#3b82f6" strokeWidth="0.8" />
              <line x1="-11" y1="-11" x2="11" y2="11" stroke="#3b82f6" strokeWidth="0.8" />
              <line x1="-11" y1="11" x2="11" y2="-11" stroke="#3b82f6" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="5" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="1" />
            </g>
            
            {/* Heat pipes */}
            <path d="M75,65 C85,60 95,60 105,65" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.7" />
            <path d="M75,95 C85,100 95,100 105,95" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.7" />
            
            {/* GPU Memory Chips with data pulse */}
            <rect x="160" y="45" width="30" height="15" rx="1" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="1" />
            <rect x="160" y="70" width="30" height="15" rx="1" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="1" />
            <rect x="160" y="95" width="30" height="15" rx="1" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="1" />
            
            <rect x="165" y="50" width="20" height="5" fill="#3b82f6" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </rect>
            <rect x="165" y="75" width="20" height="5" fill="#3b82f6" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin="1s" repeatCount="indefinite" />
            </rect>
            <rect x="165" y="100" width="20" height="5" fill="#3b82f6" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin="1.5s" repeatCount="indefinite" />
            </rect>
            
            {/* PCIe Connector */}
            <rect x="50" y="130" width="140" height="10" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="1.5" />
            <line x1="55" y1="130" x2="55" y2="140" stroke="#3b82f6" strokeWidth="1" />
            <line x1="65" y1="130" x2="65" y2="140" stroke="#3b82f6" strokeWidth="1" />
            <line x1="75" y1="130" x2="75" y2="140" stroke="#3b82f6" strokeWidth="1" />
            <line x1="85" y1="130" x2="85" y2="140" stroke="#3b82f6" strokeWidth="1" />
            <line x1="95" y1="130" x2="95" y2="140" stroke="#3b82f6" strokeWidth="1" />
            <line x1="105" y1="130" x2="105" y2="140" stroke="#3b82f6" strokeWidth="1" />
            <line x1="115" y1="130" x2="115" y2="140" stroke="#3b82f6" strokeWidth="1" />
            <line x1="125" y1="130" x2="125" y2="140" stroke="#3b82f6" strokeWidth="1" />
            <line x1="135" y1="130" x2="135" y2="140" stroke="#3b82f6" strokeWidth="1" />
            <line x1="145" y1="130" x2="145" y2="140" stroke="#3b82f6" strokeWidth="1" />
            <line x1="155" y1="130" x2="155" y2="140" stroke="#3b82f6" strokeWidth="1" />
            <line x1="165" y1="130" x2="165" y2="140" stroke="#3b82f6" strokeWidth="1" />
            <line x1="175" y1="130" x2="175" y2="140" stroke="#3b82f6" strokeWidth="1" />
            <line x1="185" y1="130" x2="185" y2="140" stroke="#3b82f6" strokeWidth="1" />
            
            {/* Display Ports */}
            <rect x="20" y="45" width="20" height="10" rx="1" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="1" />
            <rect x="20" y="65" width="20" height="10" rx="1" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="1" />
            <rect x="20" y="85" width="20" height="10" rx="1" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="1" />
            <rect x="20" y="105" width="20" height="10" rx="1" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="1" />
            
            {/* Video signal */}
            <path d="M40,50 L45,50" stroke="#3b82f6" strokeWidth="1">
              <animate attributeName="stroke-dasharray" values="1,10;5,2;1,10" dur="2s" repeatCount="indefinite" />
            </path>
          </svg>
        </div>
        
        {/* NEW: CPU in bottom left - Enhanced */}
        <div className="vector-graphic bottom-10 left-5 w-64 h-64 animate-pulse">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="cpuGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="cpuGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 0.05 }} />
                <stop offset="100%" style={{ stopColor: '#c2410c', stopOpacity: 0.1 }} />
              </linearGradient>
              <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 0 }} />
              </radialGradient>
            </defs>
            
            {/* CPU Package */}
            <rect x="50" y="50" width="100" height="100" fill="url(#cpuGradient)" stroke="#f97316" strokeWidth="2" />
            
            {/* CPU Die */}
            <rect x="65" y="65" width="70" height="70" fill="rgba(249, 115, 22, 0.08)" stroke="#f97316" strokeWidth="1.8" />
            
            {/* CPU Pins with data flow */}
            <g>
              <line x1="55" y1="40" x2="55" y2="50" stroke="#f97316" strokeWidth="1.2" />
              <circle cx="55" cy="45" r="1" fill="#f97316">
                <animate attributeName="cy" values="40;50;40" dur="2s" begin="0.1s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="75" y1="40" x2="75" y2="50" stroke="#f97316" strokeWidth="1.2" />
              <circle cx="75" cy="45" r="1" fill="#f97316">
                <animate attributeName="cy" values="40;50;40" dur="2s" begin="0.4s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="95" y1="40" x2="95" y2="50" stroke="#f97316" strokeWidth="1.2" />
              <circle cx="95" cy="45" r="1" fill="#f97316">
                <animate attributeName="cy" values="40;50;40" dur="2s" begin="0.7s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="115" y1="40" x2="115" y2="50" stroke="#f97316" strokeWidth="1.2" />
              <circle cx="115" cy="45" r="1" fill="#f97316">
                <animate attributeName="cy" values="40;50;40" dur="2s" begin="1.0s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="135" y1="40" x2="135" y2="50" stroke="#f97316" strokeWidth="1.2" />
              <circle cx="135" cy="45" r="1" fill="#f97316">
                <animate attributeName="cy" values="40;50;40" dur="2s" begin="1.3s" repeatCount="indefinite" />
              </circle>
            </g>
            
            <line x1="65" y1="40" x2="65" y2="50" stroke="#f97316" strokeWidth="1.2" />
            <line x1="85" y1="40" x2="85" y2="50" stroke="#f97316" strokeWidth="1.2" />
            <line x1="105" y1="40" x2="105" y2="50" stroke="#f97316" strokeWidth="1.2" />
            <line x1="125" y1="40" x2="125" y2="50" stroke="#f97316" strokeWidth="1.2" />
            <line x1="145" y1="40" x2="145" y2="50" stroke="#f97316" strokeWidth="1.2" />
            
            <line x1="55" y1="160" x2="55" y2="150" stroke="#f97316" strokeWidth="1.2" />
            <line x1="65" y1="160" x2="65" y2="150" stroke="#f97316" strokeWidth="1.2" />
            <line x1="75" y1="160" x2="75" y2="150" stroke="#f97316" strokeWidth="1.2" />
            <line x1="85" y1="160" x2="85" y2="150" stroke="#f97316" strokeWidth="1.2" />
            <line x1="95" y1="160" x2="95" y2="150" stroke="#f97316" strokeWidth="1.2" />
            <line x1="105" y1="160" x2="105" y2="150" stroke="#f97316" strokeWidth="1.2" />
            <line x1="115" y1="160" x2="115" y2="150" stroke="#f97316" strokeWidth="1.2" />
            <line x1="125" y1="160" x2="125" y2="150" stroke="#f97316" strokeWidth="1.2" />
            <line x1="135" y1="160" x2="135" y2="150" stroke="#f97316" strokeWidth="1.2" />
            <line x1="145" y1="160" x2="145" y2="150" stroke="#f97316" strokeWidth="1.2" />
            
            <line x1="40" y1="55" x2="50" y2="55" stroke="#f97316" strokeWidth="1.2" />
            <line x1="40" y1="65" x2="50" y2="65" stroke="#f97316" strokeWidth="1.2" />
            <line x1="40" y1="75" x2="50" y2="75" stroke="#f97316" strokeWidth="1.2" />
            <line x1="40" y1="85" x2="50" y2="85" stroke="#f97316" strokeWidth="1.2" />
            <line x1="40" y1="95" x2="50" y2="95" stroke="#f97316" strokeWidth="1.2" />
            <line x1="40" y1="105" x2="50" y2="105" stroke="#f97316" strokeWidth="1.2" />
            <line x1="40" y1="115" x2="50" y2="115" stroke="#f97316" strokeWidth="1.2" />
            <line x1="40" y1="125" x2="50" y2="125" stroke="#f97316" strokeWidth="1.2" />
            <line x1="40" y1="135" x2="50" y2="135" stroke="#f97316" strokeWidth="1.2" />
            <line x1="40" y1="145" x2="50" y2="145" stroke="#f97316" strokeWidth="1.2" />
            
            <line x1="160" y1="55" x2="150" y2="55" stroke="#f97316" strokeWidth="1.2" />
            <line x1="160" y1="65" x2="150" y2="65" stroke="#f97316" strokeWidth="1.2" />
            <line x1="160" y1="75" x2="150" y2="75" stroke="#f97316" strokeWidth="1.2" />
            <line x1="160" y1="85" x2="150" y2="85" stroke="#f97316" strokeWidth="1.2" />
            <line x1="160" y1="95" x2="150" y2="95" stroke="#f97316" strokeWidth="1.2" />
            <line x1="160" y1="105" x2="150" y2="105" stroke="#f97316" strokeWidth="1.2" />
            <line x1="160" y1="115" x2="150" y2="115" stroke="#f97316" strokeWidth="1.2" />
            <line x1="160" y1="125" x2="150" y2="125" stroke="#f97316" strokeWidth="1.2" />
            <line x1="160" y1="135" x2="150" y2="135" stroke="#f97316" strokeWidth="1.2" />
            <line x1="160" y1="145" x2="150" y2="145" stroke="#f97316" strokeWidth="1.2" />
            
            {/* CPU Core Markings with processing animation */}
            <rect x="75" y="75" width="20" height="20" fill="url(#coreGradient)" stroke="#f97316" strokeWidth="1.2">
              <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.1s" repeatCount="indefinite" />
            </rect>
            <rect x="105" y="75" width="20" height="20" fill="url(#coreGradient)" stroke="#f97316" strokeWidth="1.2">
              <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
            </rect>
            <rect x="75" y="105" width="20" height="20" fill="url(#coreGradient)" stroke="#f97316" strokeWidth="1.2">
              <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.7s" repeatCount="indefinite" />
            </rect>
            <rect x="105" y="105" width="20" height="20" fill="url(#coreGradient)" stroke="#f97316" strokeWidth="1.2">
              <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="1.0s" repeatCount="indefinite" />
            </rect>
            
            {/* CPU Corner Marker */}
            <circle cx="60" cy="60" r="5" fill="none" stroke="#f97316" strokeWidth="1.2" />
          </svg>
        </div>
        
        {/* NEW: Circuit Board Patterns - Adding technical look */}
        <div className="vector-graphic top-1/4 left-20 w-32 h-32 animate-pulse">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#059669', stopOpacity: 0.05 }} />
                <stop offset="100%" style={{ stopColor: '#047857', stopOpacity: 0.1 }} />
              </linearGradient>
            </defs>
            
            {/* Circuit Background */}
            <rect x="10" y="10" width="80" height="80" fill="url(#circuitGradient)" stroke="#059669" strokeWidth="0.5" />
            
            {/* Circuit Traces */}
            <path d="M10,30 H50 V70 H90" fill="none" stroke="#059669" strokeWidth="1" />
            <path d="M10,50 H30 V90" fill="none" stroke="#059669" strokeWidth="1" />
            <path d="M50,10 V40 H70 V90" fill="none" stroke="#059669" strokeWidth="1" />
            <path d="M70,10 V20 H90" fill="none" stroke="#059669" strokeWidth="1" />
            <path d="M30,10 V20 H10" fill="none" stroke="#059669" strokeWidth="1" />
            
            {/* Connection Points */}
            <circle cx="30" cy="50" r="2" fill="#059669" />
            <circle cx="50" cy="40" r="2" fill="#059669" />
            <circle cx="50" cy="30" r="2" fill="#059669" />
            <circle cx="70" cy="20" r="2" fill="#059669" />
            
            {/* Data Flow Animation */}
            <circle cx="20" cy="30" r="1.5" fill="#059669">
              <animate attributeName="cx" values="10;50;50;90" dur="3s" repeatCount="indefinite" />
              <animate attributeName="cy" values="30;30;70;70" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="10" cy="40" r="1.5" fill="#059669">
              <animate attributeName="cx" values="50;70;70" dur="4s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="cy" values="10;10;90" dur="4s" begin="1s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
        
        {/* NEW: Binary Code Pattern */}
        <div className="vector-graphic bottom-20 left-1/2 w-40 h-40 animate-pulse">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="binaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 0.05 }} />
                <stop offset="100%" style={{ stopColor: '#1d4ed8', stopOpacity: 0.1 }} />
              </linearGradient>
            </defs>
            
            <rect x="10" y="10" width="80" height="80" fill="url(#binaryGradient)" fillOpacity="0.2" />
            
            {/* Binary Code Pattern */}
            <text x="15" y="20" fill="#2563eb" fontSize="3" opacity="0.7">01001100 01101111 01110010 01100101</text>
            <text x="15" y="25" fill="#2563eb" fontSize="3" opacity="0.7">01101101 00100000 01101001 01110000</text>
            <text x="15" y="30" fill="#2563eb" fontSize="3" opacity="0.7">01110011 01110101 01101101 00100000</text>
            <text x="15" y="35" fill="#2563eb" fontSize="3" opacity="0.7">01100100 01101111 01101100 01101111</text>
            <text x="15" y="40" fill="#2563eb" fontSize="3" opacity="0.7">01110010 00100000 01110011 01101001</text>
            <text x="15" y="45" fill="#2563eb" fontSize="3" opacity="0.7">01110100 00100000 01100001 01101101</text>
            <text x="15" y="50" fill="#2563eb" fontSize="3" opacity="0.7">01100101 01110100 00101100 00100000</text>
            <text x="15" y="55" fill="#2563eb" fontSize="3" opacity="0.7">01100011 01101111 01101110 01110011</text>
            <text x="15" y="60" fill="#2563eb" fontSize="3" opacity="0.7">01100101 01100011 01110100 01100101</text>
            <text x="15" y="65" fill="#2563eb" fontSize="3" opacity="0.7">01110100 01110101 01110010 00100000</text>
            <text x="15" y="70" fill="#2563eb" fontSize="3" opacity="0.7">01100001 01100100 01101001 01110000</text>
            <text x="15" y="75" fill="#2563eb" fontSize="3" opacity="0.7">01101001 01110011 01100011 01101001</text>
            <text x="15" y="80" fill="#2563eb" fontSize="3" opacity="0.7">01101110 01100111 00100000 01100101</text>
            <text x="15" y="85" fill="#2563eb" fontSize="3" opacity="0.7">01101100 01101001 01110100 00101110</text>
            
            {/* Animated highlight effect */}
            <rect x="15" y="47" width="70" height="4" fill="#2563eb" opacity="0.3">
              <animate attributeName="y" values="20;85;20" dur="10s" repeatCount="indefinite" />
            </rect>
          </svg>
        </div>
        
        {/* NEW: Network Connection Symbol */}
        <div className="vector-graphic top-40 right-1/4 w-28 h-28 animate-float">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="wifiGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{ stopColor: '#0369a1', stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: '#0369a1', stopOpacity: 0 }} />
              </radialGradient>
            </defs>
            
            {/* WiFi Symbol */}
            <circle cx="50" cy="50" r="40" fill="url(#wifiGradient)" />
            
            <g opacity="0.8">
              <path d="M50,70 L50,70" stroke="#0369a1" strokeWidth="2" strokeLinecap="round">
                <animate attributeName="d" values="M50,70 L50,70;M50,70 L50,55;M50,70 L50,70" dur="3s" repeatCount="indefinite" />
              </path>
              <path d="M40,65 C40,65 50,55 60,65" stroke="#0369a1" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0">
                <animate attributeName="opacity" values="0;0.8;0" dur="3s" begin="0.2s" repeatCount="indefinite" />
              </path>
              <path d="M30,55 C30,55 50,40 70,55" stroke="#0369a1" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0">
                <animate attributeName="opacity" values="0;0.8;0" dur="3s" begin="0.4s" repeatCount="indefinite" />
              </path>
              <path d="M20,45 C20,45 50,25 80,45" stroke="#0369a1" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0">
                <animate attributeName="opacity" values="0;0.8;0" dur="3s" begin="0.6s" repeatCount="indefinite" />
              </path>
              <circle cx="50" cy="75" r="3" fill="#0369a1" />
            </g>
            
            {/* Data packets */}
            <circle cx="50" cy="40" r="1.5" fill="#0369a1">
              <animate attributeName="cy" values="40;75;40" dur="2s" begin="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="45" cy="35" r="1.5" fill="#0369a1">
              <animate attributeName="cy" values="35;75;35" dur="2s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="cx" values="45;50;45" dur="2s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" begin="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="55" cy="35" r="1.5" fill="#0369a1">
              <animate attributeName="cy" values="35;75;35" dur="2s" begin="1.5s" repeatCount="indefinite" />
              <animate attributeName="cx" values="55;50;55" dur="2s" begin="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" begin="1.5s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
        
        {/* Content Layer */}
        <div className="content-layer">
          {/* Title */}
          <div className="text-center mb-2">
            <h1 className="text-lg font-bold">Estimate</h1>
          </div>
          
          {/* Header with two columns */}
          <div className="flex mb-2 border border-gray-300 text-xs">
            {/* Company Information */}
            <div className="w-1/2 p-2 border-r border-gray-300">
              <div className="flex items-start">
                <div className="mr-2 flex-shrink-0">
                  {businessDetails.logo ? (
                    <img 
                      src={businessDetails.logo} 
                      alt="Business Logo" 
                      className="h-12"
                    />
                  ) : (
                    <div className="h-12 w-12 flex items-center justify-center bg-orange-500 text-white rounded-md shadow-sm">
                      <span className="text-lg font-bold">E</span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold">{businessDetails.name}</h2>
                  <p className="leading-tight">{businessDetails.address}</p>
                  <p className="leading-tight">Phone no.: {businessDetails.phone}</p>
                  <p className="leading-tight">Email: {businessDetails.email}</p>
                  <p className="leading-tight">GSTIN: {businessDetails.gstin}</p>
                  <p className="leading-tight">State: 09-Uttar Pradesh</p>
                </div>
              </div>
            </div>
            
            {/* Quote Details */}
            <div className="w-1/2 p-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="font-medium">Estimate No.</div>
                <div>{quotationNumber || 'EPC/E/2526/00210'}</div>
                
                <div className="font-medium">Date</div>
                <div>{formatDate(quotationDate)}</div>
                
                <div className="font-medium">Place of supply</div>
                <div>09-Uttar Pradesh</div>
              </div>
            </div>
          </div>
          
          {/* Customer Details */}
          <div className="mb-2 border border-gray-300 p-2 text-xs">
            <div className="font-medium">Estimate For</div>
            <div className="font-medium">{selectedParty?.name || 'Customer Name'}</div>
            <div className="flex justify-between">
              <div>{selectedParty?.address || 'Address'}</div>
              <div>Contact No.: {selectedParty?.phone || '9876543210'}</div>
            </div>
            <div>State: 09-Uttar Pradesh</div>
          </div>
          
          {/* Items Table without individual prices - Compact version */}
          <div className="mb-2">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-1 text-left">#</th>
                  <th className="border border-gray-300 p-1 text-left">Brand</th>
                  <th className="border border-gray-300 p-1 text-left">Item name</th>
                  <th className="border border-gray-300 p-1 text-left">Warranty</th>
                  <th className="border border-gray-300 p-1 text-center w-16">HSN/SAC</th>
                  <th className="border border-gray-300 p-1 text-center w-16">Qty</th>
                  <th className="border border-gray-300 p-1 text-center w-12">Unit</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 p-1">{index + 1}</td>
                      <td className="border border-gray-300 p-1">{item.brand}</td>
                      <td className="border border-gray-300 p-1">
                        <div className="font-medium">{item.model}</div>
                        {item.category && <div className="text-xs text-gray-600">{item.category}</div>}
                      </td>
                      <td className="border border-gray-300 p-1 text-center">{item.warranty}</td>
                      <td className="border border-gray-300 p-1 text-center">{item.hsn_sac}</td>
                      <td className="border border-gray-300 p-1 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 p-1 text-center">Pcs</td>
                    </tr>
                  ))
                ) : (
                  // Default item if no items exist
                  <tr>
                    <td className="border border-gray-300 p-1">1</td>
                    <td className="border border-gray-300 p-1">
                      <div className="font-medium">Sample Product</div>
                    </td>
                    <td className="border border-gray-300 p-1 text-center">8473</td>
                    <td className="border border-gray-300 p-1 text-center">1</td>
                    <td className="border border-gray-300 p-1 text-center">Pcs</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Amount in words */}
          <div className="mb-2 border border-gray-300 p-1 text-xs">
            <div className="font-medium">Estimate Amount in Words</div>
            <div>{numberToWords(total)}</div>
          </div>
          
          {/* Total Summary - Combined Section */}
          <div className="mb-2 border border-gray-300 text-xs">
            <div className="p-1 font-medium">Amounts</div>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="border-t border-gray-300 p-1">Sub Total (without GST)</td>
                  <td className="border-t border-gray-300 p-1 text-right">₹{subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="border-t border-gray-300 p-1">Total GST</td>
                  <td className="border-t border-gray-300 p-1 text-right">₹{totalTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
                <tr className="font-bold bg-gray-100">
                  <td className="border-t border-gray-300 p-1">Total Amount</td>
                  <td className="border-t border-gray-300 p-1 text-right">₹{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Bottom Section: Bank Details and Terms - More compact */}
          <div className="flex mb-2 text-xs">
            {/* Bank Details */}
            <div className="w-1/2 pr-1">
              <div className="border border-gray-300 p-1 h-full">
                <div className="font-medium mb-0.5">Bank Details</div>
                <p className="leading-tight">Name: KOTAK MAHINDRA BANK LIMITED</p>
                <p className="leading-tight">Account No.: 8707304202</p>
                <p className="leading-tight">IFSC code: KKBK0005194</p>
                <p className="leading-tight">Account holder's name: {businessDetails.name}</p>
              </div>
            </div>
            
            {/* Terms and Conditions */}
            <div className="w-1/2 pl-1">
              <div className="border border-gray-300 p-1 h-full">
                <div className="font-medium mb-0.5">Terms and conditions</div>
                <p className="leading-tight">{terms || '1. Quote Is Valid For 7 Days Only!'}</p>
              </div>
            </div>
          </div>
          
          {/* Signature */}
          <div className="flex justify-end mt-2 text-xs">
            <div className="text-center w-32">
              <div>For: {businessDetails.name}</div>
              <div className="mt-8 border-t border-gray-400">
                <p>Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div> {/* End of content-layer */}
      </div>
    </div>
  );
};

export default PrintMode;