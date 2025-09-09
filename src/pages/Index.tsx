import { useState } from 'react';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import StockReceipt from '../components/StockReceipt';
import StockConsumption from '../components/StockConsumption';
import CurrentInventory from '../components/CurrentInventory';
import Reports from '../components/Reports';

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'receipt':
        return <StockReceipt />;
      case 'consumption':
        return <StockConsumption />;
      case 'inventory':
        return <CurrentInventory />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default Index;
