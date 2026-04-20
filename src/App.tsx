import React, { useState } from 'react';
import { BottomNav } from './components/layout/BottomNav';
import { Drawer } from './components/layout/Drawer';
import { ScreenInicio } from './components/screens/ScreenInicio';
import { ScreenComunidade } from './components/screens/ScreenComunidade';
import { ScreenCalendario } from './components/screens/OtherScreens';
import { ScreenMirongas } from './components/screens/ScreenMirongas';
import { ScreenAcervo } from './components/screens/ScreenAcervo';
import { ScreenScanner } from './components/screens/ScreenScanner';
import { ScreenConga } from './components/screens/ScreenConga';
import { ScreenProfile } from './components/screens/ScreenProfile';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { LoginScreen } from './components/auth/LoginScreen';

import { ScreenOraculo } from './components/screens/ScreenOraculo';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('inicio');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex-1 w-full h-full flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-pulse-slow w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'inicio': return <ScreenInicio onOpenDrawer={() => setIsDrawerOpen(true)} onNavigate={setActiveTab} />;
      case 'comunidade': return <ScreenComunidade />;
      case 'conga': return <ScreenConga onNavigate={setActiveTab} />;
      case 'acervo': return <ScreenAcervo />;
      case 'calendario': return <ScreenCalendario />;
      case 'alquimia': return <ScreenMirongas />;
      case 'perfil': return <ScreenProfile onBack={() => setActiveTab('inicio')} />;
      case 'oraculo': return <ScreenOraculo />;
      default: return <ScreenInicio onOpenDrawer={() => setIsDrawerOpen(true)} onNavigate={setActiveTab} />;
    }
  };


  return (
    <>
      <div className="absolute inset-0 bg-[#FCFDFD] pointer-events-none z-0" />
      {/* Luz e Éter Subtle Glows */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-amber-50/60 via-white/10 to-transparent pointer-events-none z-0" />
      <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-multiply" />
      <div className="absolute bottom-1/4 -left-32 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[100px] pointer-events-none z-0" />

      {renderScreen()}

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onScannerOpen={() => setIsScannerOpen(true)} 
      />

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onNavigate={setActiveTab} 
      />

      <ScreenScanner 
        isOpen={isScannerOpen} 
        onClose={() => {
          setIsScannerOpen(false);
          setActiveTab('acervo'); // Go to Acervo when scanner closes to see saved info
        }} 
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="w-full h-[100dvh] sm:w-[390px] sm:h-[844px] bg-[#FAFAFA] sm:rounded-[45px] sm:shadow-2xl overflow-x-hidden overflow-y-auto sm:border-[6px] sm:border-white ring-0 sm:ring-1 sm:ring-slate-200 flex flex-col font-sans mx-auto sm:my-8 relative">
        <MainApp />
      </div>
    </AuthProvider>
  );
}
