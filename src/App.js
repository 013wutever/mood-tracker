import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  LineChart, 
  Info as InfoIcon,
  Languages,
  LogOut,
  Calendar
} from 'lucide-react';
import MoodEntry from './components/MoodEntry/MoodEntry';
import Progress from './components/Progress/Progress';
import Info from './components/Info/Info';
import MyEntries from './components/MyEntries/MyEntries';
import Login from './components/Auth/Login';
import { getTranslation } from './utils/translations';
import GlassmorphicContainer from './components/ui/GlassmorphicContainer';

const App = () => {
  const [activeTab, setActiveTab] = useState('mood-entry');
  const [language, setLanguage] = useState('el');
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('moodTrackerUser');
    const savedLanguage = localStorage.getItem('moodTrackerLanguage');
    if (savedUser) {
      setUser(savedUser);
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const navItems = [
    { id: 'mood-entry', icon: Heart },
    { id: 'my-entries', icon: Calendar },
    { id: 'progress', icon: LineChart },
    { id: 'info', icon: InfoIcon }
  ];

  const handleLanguageChange = () => {
    const newLanguage = language === 'el' ? 'en' : 'el';
    setLanguage(newLanguage);
    localStorage.setItem('moodTrackerLanguage', newLanguage);
  };

  const handleLogin = (email) => {
    setUser(email);
    localStorage.setItem('moodTrackerUser', email);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('moodTrackerUser');
    setActiveTab('mood-entry');
  };

  const getContentMaxWidth = () => {
    switch (activeTab) {
      case 'progress':
        return 'max-w-6xl';
      case 'info':
        return 'max-w-4xl';
      case 'my-entries':
        return 'max-w-6xl';
      default:
        return 'max-w-2xl';
    }
  };

  const renderContent = () => {
    if (!user) {
      return <Login language={language} onLogin={handleLogin} />;
    }

    switch (activeTab) {
      case 'mood-entry':
        return <MoodEntry language={language} userEmail={user} />;
      case 'my-entries':
        return <MyEntries language={language} userEmail={user} />;
      case 'progress':
        return <Progress language={language} userEmail={user} />;
      case 'info':
        return <Info language={language} />;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-br from-purple-300/80 to-indigo-400/80">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-300/80 to-indigo-400/80 overflow-y-auto">
      {/* Top navigation */}
      <GlassmorphicContainer 
        className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4"
        hover={false}
      >
        <div className="flex items-center space-x-1">
          <span className="text-white/70 text-sm mr-4">
            {getTranslation(language, 'nav.welcomeBack')}, {user.split('@')[0]}
          </span>
          
          {navItems.map((item) => {
            const ItemIcon = item.icon;
            return (
              <GlassmorphicContainer
                key={item.id}
                as="button"
                onClick={() => setActiveTab(item.id)}
                className={`
                  p-2 rounded-full 
                  ${isMobile ? 'touch-manipulation' : ''}
                `}
                hover={true}
                active={activeTab === item.id}
                isButton={true}
              >
                <ItemIcon className="w-6 h-6" />
                <span className="sr-only">{getTranslation(language, `nav.${item.id}`)}</span>
              </GlassmorphicContainer>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          {/* Language toggle */}
          <GlassmorphicContainer
            as="button"
            onClick={handleLanguageChange}
            className={`p-2 rounded-full ${isMobile ? 'touch-manipulation' : ''}`}
            hover={true}
            isButton={true}
          >
            <Languages className="w-6 h-6" />
            <span className="sr-only">
              {language === 'el' ? 'Switch to English' : 'Αλλαγή σε Ελληνικά'}
            </span>
          </GlassmorphicContainer>

          {/* Logout button */}
          <GlassmorphicContainer
            as="button"
            onClick={handleLogout}
            className={`p-2 rounded-full ${isMobile ? 'touch-manipulation' : ''}`}
            hover={true}
            isButton={true}
          >
            <LogOut className="w-6 h-6" />
            <span className="sr-only">{getTranslation(language, 'nav.logout')}</span>
          </GlassmorphicContainer>
        </div>
      </GlassmorphicContainer>

      {/* Main content area */}
      <main className="container mx-auto px-4 pb-4 min-h-screen overflow-y-auto">
        <GlassmorphicContainer 
          className={`
            rounded-2xl p-6 mx-auto 
            ${getContentMaxWidth()}
            ${isMobile ? 'h-auto overflow-visible' : ''}
          `}
        >
          {renderContent()}
        </GlassmorphicContainer>
      </main>
    </div>
  );
};

export default App;
