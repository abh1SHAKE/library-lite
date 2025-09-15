import { useState } from 'react';
import { CatalogPage } from './pages/CatalogPage';
import { MembersPage } from './pages/MembersPage';
import { ReportsPage } from './pages/ReportsPage';
import { Notification } from './components/Notification';
import type { NotificationState } from './types';

type ActivePage = 'catalog' | 'members' | 'reports';

function App() {
  const [activePage, setActivePage] = useState<ActivePage>('catalog');
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({
      message,
      type,
      id: Date.now().toString(),
    });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'catalog':
        return 'Catalog';
      case 'members':
        return 'Members';
      case 'reports':
        return 'Reports';
      default:
        return 'Library Lite';
    }
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'catalog':
        return <CatalogPage onNotification={showNotification} />;
      case 'members':
        return <MembersPage onNotification={showNotification} />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <CatalogPage onNotification={showNotification} />;
    }
  };

  return (
    <div className="sora min-h-screen bg-[#f5f5f5]">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between flex-wrap items-center gap-4">
            <div className="flex items-center">
              <h1 
                onClick={() => setActivePage('catalog')}
                className="text-2xl font-bold text-[#16a34a] cursor-pointer">
                  library lite.
              </h1>
            </div>
            
            <nav className="flex space-x-1">
              <button
                onClick={() => setActivePage('catalog')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePage === 'catalog'
                    ? 'bg-green-50 text-[#16a34a]'
                    : 'text-[#373737] hover:bg-gray-100'
                }`}
              >
                📖 Catalog
              </button>
              <button
                onClick={() => setActivePage('members')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePage === 'members'
                    ? 'bg-green-50 text-[#16a34a]'
                    : 'text-[#373737] hover:bg-gray-100'
                }`}
              >
                👥 Members
              </button>
              <button
                onClick={() => setActivePage('reports')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePage === 'reports'
                    ? 'bg-green-50 text-[#16a34a]'
                    : 'text-[#373737] hover:bg-gray-100'
                }`}
              >
                📊 Reports
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#373737] cursor-default">{getPageTitle()}</h2>
          </div>
          
          {renderActivePage()}
        </div>
      </main>

      <Notification 
        notification={notification} 
        onClose={closeNotification} 
      />
    </div>
  );
}

export default App;