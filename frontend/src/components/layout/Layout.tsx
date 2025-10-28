import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen overflow-hidden">
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;