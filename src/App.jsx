import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams, useNavigate } from 'react-router-dom';
import PartyManagement from './pages/PartyManagement';
import QuotationMaker from './components/QuotationMaker';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import PartyDetails from './pages/PartyDetails';

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
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
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
            {/* <Route path="/dashboard" element={<Navigate to="/dashboard" replace />} /> */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/parties/:partyId" element={<PartyDetails />} />
            <Route path="/" element={<Navigate to="/parties" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;