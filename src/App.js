import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  LineChart, 
  Info as InfoIcon,
  Languages,
  LogOut,
  Calendar  // Προσθήκη του Calendar icon
} from 'lucide-react';
import MoodEntry from './components/MoodEntry/MoodEntry';
import Progress from './components/Progress/Progress';
import Info from './components/Info/Info';
import MyEntries from './components/MyEntries/MyEntries';  // Εισαγωγή του νέου component
import Login from './components/Auth/Login';

const App = () => {
  const [activeTab, setActiveTab] = useState('mood-entry');
  const [language, setLanguage] = useState('el');
  const [user, setUser] = useState(null);

  // Check for saved user on load
  useEffect(() => {
    const savedUser = localStorage.getItem('moodTrackerUser');
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const translations = {
    el: {
      'mood-entry': 'Καταχώρηση συναισθήματος',
      'progress': 'Προβολή προόδου',
      'my-entries': 'Οι καταχωρήσεις μου',  // Προσθήκη νέας μετάφρασης
      'info': 'Πληροφορίες',
      'logout': 'Αποσύνδεση',
      'welcomeBack': 'Καλως ήρθατε'
    },
    en: {
      'mood-entry': 'Mood Entry',
      'progress': 'View Progress',
      'my-entries': 'My Entries',  // Προσθήκη νέας μετάφρασης
      'info': 'Information',
      'logout': 'Logout',
      'welcomeBack': 'Welcome back'
    }
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

  // Ενημέρωση των navigation items με το νέο tab
  const navItems = [
    { id: 'mood-entry', icon: Heart },
    { id: 'my-entries', icon: Calendar },  // Προσθήκη του νέου tab
    { id: 'progress', icon: LineChart },
    { id: 'info', icon: InfoIcon }
  ];

  const getContentMaxWidth = () => {
    switch (activeTab) {
      case 'progress':
        return 'max-w-6xl';
      case 'info':
        return 'max-w-4xl';
      case 'my-entries':  // Προσθήκη του νέου case
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
      case 'my-entries':  // Προσθήκη του νέου case
        return <MyEntries language={language} userEmail={user} />;
      case 'progress':
        return <Progress language={language} userEmail={user} />;
      case 'info':
        return <Info language={language} />;
      default:
        return null;
    }
  };

  // If user is not logged in, show only the login component
  if (!user) {
    return (
      <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-purple-300/80 to-indigo-400/80">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-purple-300/80 to-indigo-400/80">
      {/* Top navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 glassmorphic z-50 flex items-center justify-between px-4 backdrop-blur-xl bg-white/10">
        <div className="flex items-center space-x-1">
          <span className="text-white/70 text-sm mr-4">
            {translations[language].welcomeBack}, {user.split('@')[0]}
          </span>
          
          {navItems.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`glassmorphic p-2 rounded-full transition-all duration-300
                  hover:-translate-y-1 hover:shadow-lg hover:shadow-white/20
                  ${activeTab === item.id 
                    ? 'bg-white/20 shadow-lg shadow-white/10' 
                    : 'bg-white/5'}`}
              >
                <ItemIcon className="w-6 h-6" />
                <span className="sr-only">{translations[language][item.id]}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(prev => prev === 'el' ? 'en' : 'el')}
            className="glassmorphic p-2 rounded-full hover:bg-white/20 transition-all duration-300
              hover:-translate-y-1 hover:shadow-lg hover:shadow-white/20"
          >
            <Languages className="w-6 h-6" />
            <span className="sr-only">
              {language === 'el' ? 'Switch to English' : 'Αλλαγή σε Ελληνικά'}
            </span>
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="glassmorphic p-2 rounded-full hover:bg-white/20 transition-all duration-300
              hover:-translate-y-1 hover:shadow-lg hover:shadow-white/20"
            title={translations[language].logout}
          >
            <LogOut className="w-6 h-6" />
            <span className="sr-only">{translations[language].logout}</span>
          </button>
        </div>
      </nav>

      {/* Main content area */}
      <main className="container mx-auto pt-20 px-4 pb-4 min-h-screen">
        <div className={`glassmorphic rounded-2xl p-6 mx-auto backdrop-blur-xl bg-white/10 
          transition-all duration-500 ${getContentMaxWidth()}`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
