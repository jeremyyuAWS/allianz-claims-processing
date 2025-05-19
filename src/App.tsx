import React, { useEffect } from 'react';
import { useAppContext } from './context/AppContext';
import Header from './components/common/Header';
import WelcomeModal from './components/common/WelcomeModal';
import CustomerLayout from './layouts/CustomerLayout';
import AdvisorLayout from './layouts/AdvisorLayout';

function App() {
  const { mode, resetQuestionnaire } = useAppContext();
  
  useEffect(() => {
    resetQuestionnaire();
  }, [resetQuestionnaire]);
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <WelcomeModal />
      
      <main className="flex-1 container mx-auto pt-20 px-4 pb-4 overflow-hidden">
        <div className="bg-white rounded-lg shadow h-full overflow-hidden">
          {mode === 'customer' ? <CustomerLayout /> : <AdvisorLayout />}
        </div>
      </main>
    </div>
  );
}

export default App;