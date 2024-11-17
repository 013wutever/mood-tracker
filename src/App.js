import React, { useState } from 'react';
import { 
  Heart, 
  LineChart, 
  Info,
  Languages
} from 'lucide-react';

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
    { id: 'info', icon: Info }
  ];

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {/* Top navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 glassmorphic z-50 flex items-center justify-between px-4">
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`glassmorphic p-2 rounded-full transition-transform hover:-translate-y-1
                  ${activeTab === item.id ? 'bg-white/20' : 'bg-white/5'}`}
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
          className="glassmorphic p-2 rounded-full hover:bg-white/20"
        >
          <Languages className="w-6 h-6" />
          <span className="sr-only">Change Language</span>
        </button>
      </nav>

      {/* Main content area */}
      <main className="pt-20 px-4 pb-4 min-h-screen">
        {activeTab === 'mood-entry' && (
          <div className="glassmorphic rounded-2xl p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">
              {translations[language]['mood-entry']}
            </h1>
            {/* Mood entry content will go here */}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="glassmorphic rounded-2xl p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">
              {translations[language]['progress']}
            </h1>
            {/* Progress content will go here */}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="glassmorphic rounded-2xl p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">
              {translations[language]['info']}
            </h1>
            {/* Info content will go here */}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
