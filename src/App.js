import React, { useState } from 'react';
import { 
  Heart, 
  LineChart, 
  Info as InfoIcon,
  Languages
} from 'lucide-react';
import MoodEntry from './components/MoodEntry/MoodEntry';
import Progress from './components/Progress/Progress';
import Info from './components/Info/Info';

const App = () => {
  const [activeTab, setActiveTab] = useState('mood-entry');
  const [language, setLanguage] = useState('el');

  const translations = {
    el: {
      'mood-entry': 'Καταχώρηση συναισθήματος',
      'progress': 'Προβολή προόδου',
      'info': 'Πληροφορίες'
    },
    en: {
      'mood-entry': 'Mood Entry',
      'progress': 'View Progress',
      'info': 'Information'
    }
  };

  const navItems = [
    { id: 'mood-entry', icon: Heart },
    { id: 'progress', icon: LineChart },
    { id: 'info', icon: InfoIcon }
  ];

  const getContentMaxWidth = () => {
    switch (activeTab) {
      case 'progress':
        return 'max-w-6xl';
      case 'info':
        return 'max-w-4xl';
      default:
        return 'max-w-2xl';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'mood-entry':
        return <MoodEntry language={language} />;
      case 'progress':
        return <Progress language={language} />;
      case 'info':
        return <Info language={language} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-pink-200/80 to-purple-300/80">
      {/* Top navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 glassmorphic z-50 flex items-center justify-between px-4 backdrop-blur-xl bg-white/10">
        <div className="flex space-x-1">
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
