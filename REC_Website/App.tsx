import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { useAuth } from "./components/AuthContext";
import { LoginForm } from "./components/LoginForm";
import { UserProfile } from "./components/UserProfile";

export default function App() {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [initialTab, setInitialTab] = useState<string>('overview');
  const isDark = !!user?.preferences?.darkMode;

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const navigateToLanding = () => setCurrentView('landing');
  const navigateToDashboard = () => {
    setInitialTab('overview');
    setCurrentView('dashboard');
  };
  const navigateToEIReports = () => {
    setInitialTab('ei-reports');
    setCurrentView('dashboard');
  };

  return (
    <>
      {/* Simple fallback content for crawlers */}
      <noscript>
        <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
          <h1>RECtify - UAE's First Digital I-REC Trading Platform</h1>
          <p>Interactive demo featuring I-REC trading, portfolio management, market data, and emissions reporting for UAE businesses.</p>
          <ul>
            <li>Dashboard with key metrics (AED 45K+ portfolio)</li>
            <li>Trading interface with real-time pricing</li>
            <li>Portfolio management tools</li>
            <li>Market data visualization</li>
            <li>10-step emissions reporting wizard</li>
          </ul>
          <p>JavaScript is required for the interactive demo.</p>
        </div>
      </noscript>

      <div className="min-h-screen bg-background">
        <Header 
          onNavigateHome={navigateToLanding}
          showNavigation={currentView === 'dashboard'}
          onOpenLogin={() => {
            if (user) {
              logout();
              setShowProfile(false);
              setShowLogin(false);
              setCurrentView('landing');
            } else {
              setShowLogin(true);
            }
          }}
          onOpenProfile={() => setShowProfile(true)}
        />
        
        {currentView === 'landing' ? (
          <LandingPage 
            onEnterPlatform={() => {
              if (!user) {
                setShowLogin(true);
              } else {
                navigateToDashboard();
              }
            }}
            onNavigateToEIReports={() => {
              setInitialTab('ei-reports');
              setCurrentView('dashboard');
            }}
          />
        ) : (
          <Dashboard initialTab={initialTab} />
        )}

        {!user && showLogin && (
          <LoginForm onClose={() => {
            setShowLogin(false);
            setCurrentView('dashboard');
          }} />
        )}

        {user && showProfile && (
          <UserProfile onClose={() => setShowProfile(false)} />
        )}
      </div>
    </>
  );
}