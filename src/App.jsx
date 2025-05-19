import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams, useNavigate } from 'react-router-dom';
import PartyManagement from './pages/PartyManagement';
import QuotationMaker from './components/QuotationMaker';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PartyDetails from './pages/PartyDetails';
import QuotationsPage from './pages/QuotationsPage';
import AllQuotationsPage from './pages/AllQuotationsPage';
import { QuotationProvider } from './context/QuotationContext';

// Route guard to prevent reloading the same party
const PartyGuard = ({ navigatedPartyIds, setNavigatedPartyIds }) => {
  const { partyId } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If we've already navigated to this partyId, redirect to avoid duplicate loads
    if (partyId && navigatedPartyIds.includes(partyId)) {
      console.log(`Already navigated to party ${partyId}, preventing reload`);
      
      // Clear the history and replace with the current URL to prevent back button issues
      const currentPath = window.location.pathname;
      navigate(currentPath, { replace: true });
      return;
    }
    
    // Otherwise, remember this partyId
    if (partyId) {
      setNavigatedPartyIds(prev => [...prev, partyId]);
    }
  }, [partyId, navigatedPartyIds, setNavigatedPartyIds, navigate]);
  
  return null;
};

function App() {
  // Keep track of party IDs we've already navigated to
  const [navigatedPartyIds, setNavigatedPartyIds] = useState([]);
  
  return (
    <QuotationProvider>
      <Router>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-4">
              <Routes>
                <Route path="/parties" element={<PartyManagement />} />
                <Route path="/quotations/:partyId" element={
                  <>
                    <PartyGuard 
                      navigatedPartyIds={navigatedPartyIds}
                      setNavigatedPartyIds={setNavigatedPartyIds}
                    />
                    <QuotationMaker />
                  </>
                } />
                <Route path="/quotations" element={<QuotationMaker />} />
                <Route path="/quote" element={<QuotationsPage />} />
                
                {/* New route for all quotations */}
                <Route path="/all-quotations" element={<AllQuotationsPage />} />
                
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/parties/:partyId" element={<PartyDetails />} />
                
                {/* Updated root route to navigate to all quotations */}
                <Route path="/" element={<Navigate to="/all-quotations" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </QuotationProvider>
  );
}

export default App;
