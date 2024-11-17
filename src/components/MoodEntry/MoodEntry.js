import React, { useState } from 'react';
import { 
  Smile, 
  LaughingIcon, 
  Meh,
  Frown,
  Heart,
  Clock
} from 'lucide-react';

const MoodEntry = ({ language = 'el' }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notes, setNotes] = useState('');

  const translations = {
    el: {
      title: 'Πώς νιώθετε σήμερα;',
      categories: {
        personal: 'Προσωπικά',
        friends: 'Φίλοι',
        family: 'Οικογένεια',
        work: 'Επαγγελματικά',
        studies: 'Σπουδές',
        health: 'Υγεία',
        finances: 'Οικονομικά',
        entertainment: 'Ψυχαγωγία'
      },
      selectCategory: 'Επιλέξτε κατηγορία',
      selectEmotions: 'Επιλέξτε έως 3 συναισθήματα',
      notes: 'Σημειώσεις',
      notesPlaceholder: 'Προσθέστε τις σκέψεις σας...',
      submit: 'Καταχώρηση',
      maxEmotionsWarning: 'Μπορείτε να επιλέξετε έως 3 συναισθήματα'
    },
    en: {
      title: 'How are you feeling today?',
      categories: {
        personal: 'Personal',
        friends: 'Friends',
        family: 'Family',
        work: 'Work',
        studies: 'Studies',
        health: 'Health',
        finances: 'Finances',
        entertainment: 'Entertainment'
      },
      selectCategory: 'Select category',
      selectEmotions: 'Select up to 3 emotions',
      notes: 'Notes',
      notesPlaceholder: 'Add your thoughts...',
      submit: 'Submit',
      maxEmotionsWarning: 'You can select up to 3 emotions'
    }
  };

  const moods = [
    { id: 'very-positive', icon: LaughingIcon, color: 'bg-[#7FCDCD]/20', borderColor: 'border-[#7FCDCD]' },
    { id: 'positive', icon: Smile, color: 'bg-[#98FB98]/20', borderColor: 'border-[#98FB98]' },
    { id: 'neutral', icon: Meh, color: 'bg-[#D4E157]/20', borderColor: 'border-[#D4E157]' },
    { id: 'negative', icon: Frown, color: 'bg-[#FFB347]/20', borderColor: 'border-[#FFB347]' },
    { id: 'very-negative', icon: Heart, color: 'bg-[#FF9999]/20', borderColor: 'border-[#FF9999]' }
  ];

  const categories = Object.entries(translations[language].categories).map(([id, name]) => ({
    id,
    name,
    color: {
      personal: 'bg-purple-300/20 border-purple-300',
      friends: 'bg-green-300/20 border-green-300',
      family: 'bg-blue-300/20 border-blue-300',
      work: 'bg-orange-300/20 border-orange-300',
      studies: 'bg-yellow-300/20 border-yellow-300',
      health: 'bg-pink-300/20 border-pink-300',
      finances: 'bg-gray-300/20 border-gray-300',
      entertainment: 'bg-teal-300/20 border-teal-300'
    }[id]
  }));

  return (
    <div className="space-y-8">
      {/* Moods */}
      <div>
        <h2 className="text-xl mb-4">{translations[language].title}</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {moods.map((mood) => {
            const MoodIcon = mood.icon;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`${mood.color} ${
                  selectedMood === mood.id ? `${mood.borderColor} border-2` : 'border-transparent border-2'
                } glassmorphic p-4 rounded-full transition-transform hover:-translate-y-1`}
              >
                <MoodIcon className="w-8 h-8" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-xl mb-4">{translations[language].selectCategory}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`${category.color} ${
                selectedCategory === category.id ? 'border-2' : 'border-transparent border-2'
              } glassmorphic p-3 rounded-xl text-sm transition-transform hover:-translate-y-1`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <h2 className="text-xl mb-4">{translations[language].notes}</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={translations[language].notesPlaceholder}
          className="w-full h-32 glassmorphic bg-white/10 rounded-xl p-4 placeholder-white/50 resize-none"
          maxLength={500}
        />
        <div className="text-right text-sm text-white/50">
          {notes.length}/500
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={() => console.log('Submit:', { selectedMood, selectedCategory, notes })}
        className="w-full glassmorphic bg-white/20 hover:bg-white/30 py-3 rounded-xl transition-all"
      >
        {translations[language].submit}
      </button>

      {/* Timestamp */}
      <div className="text-center text-sm text-white/50 flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        {new Date().toLocaleTimeString(language === 'el' ? 'el-GR' : 'en-US')}
      </div>
    </div>
  );
};

export default MoodEntry;
