import React, { useState } from 'react';
import { 
  Smile,
  Laugh,
  Meh,
  Frown,
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';
import googleSheetsService from '../../services/googleSheets';

const MoodEntry = ({ language = 'el', userEmail }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const moods = [
    { 
      id: 'very-negative', 
      icon: Frown, 
      color: 'var(--mood-very-negative)',
      label: 'Πολύ Αρνητική'
    },
    { 
      id: 'negative', 
      icon: Frown, 
      color: 'var(--mood-negative)',
      label: 'Αρνητική'
    },
    { 
      id: 'neutral', 
      icon: Meh, 
      color: 'var(--mood-neutral)',
      label: 'Ουδέτερη'
    },
    { 
      id: 'positive', 
      icon: Smile, 
      color: 'var(--mood-positive)',
      label: 'Θετική'
    },
    { 
      id: 'very-positive', 
      icon: Laugh, 
      color: 'var(--mood-very-positive)',
      label: 'Πολύ Θετική'
    }
  ];

  const emotions = [
    { name: "Χαρά", value: "χαρά", type: "positive" },
    { name: "Ενθουσιασμός", value: "ενθουσιασμός", type: "positive" },
    { name: "Αγάπη", value: "αγάπη", type: "positive" },
    { name: "Ηρεμία", value: "ηρεμία", type: "positive" },
    { name: "Ικανοποίηση", value: "ικανοποίηση", type: "positive" },
    { name: "Άγχος", value: "άγχος", type: "negative" },
    { name: "Φόβος", value: "φόβος", type: "negative" },
    { name: "Θυμός", value: "θυμός", type: "negative" },
    { name: "Λύπη", value: "λύπη", type: "negative" },
    { name: "Απογοήτευση", value: "απογοήτευση", type: "negative" },
    { name: "Ανακούφιση", value: "ανακούφιση", type: "positive" },
    { name: "Περηφάνια", value: "περηφάνια", type: "positive" },
    { name: "Ευγνωμοσύνη", value: "ευγνωμοσύνη", type: "positive" },
    { name: "Ζήλια", value: "ζήλια", type: "negative" },
    { name: "Ντροπή", value: "ντροπή", type: "negative" },
    { name: "Ενοχή", value: "ενοχή", type: "negative" },
    { name: "Σύγχυση", value: "σύγχυση", type: "negative" },
    { name: "Έκπληξη", value: "έκπληξη", type: "neutral" },
    { name: "Ελπίδα", value: "ελπίδα", type: "positive" }
  ];

  const categories = [
    { id: 'personal', name: 'Προσωπικά', color: 'var(--category-personal)' },
    { id: 'friends', name: 'Φίλοι', color: 'var(--category-friends)' },
    { id: 'family', name: 'Οικογένεια', color: 'var(--category-family)' },
    { id: 'work', name: 'Επαγγελματικά', color: 'var(--category-work)' },
    { id: 'studies', name: 'Σπουδές', color: 'var(--category-studies)' },
    { id: 'health', name: 'Υγεία', color: 'var(--category-health)' },
    { id: 'finances', name: 'Οικονομικά', color: 'var(--category-finances)' },
    { id: 'entertainment', name: 'Ψυχαγωγία', color: 'var(--category-entertainment)' }
  ];

  const translations = {
    el: {
      title: 'Πώς νιώθετε σήμερα;',
      categories: 'Επιλέξτε κατηγορία',
      emotions: 'Επιλέξτε έως 3 συναισθήματα',
      notes: 'Σημειώσεις',
      addNotes: 'Προσθέστε τις σκέψεις σας...',
      submit: 'Καταχώρηση',
      submitting: 'Γίνεται καταχώρηση...',
      success: 'Η καταχώρηση ολοκληρώθηκε!',
      error: 'Κάτι πήγε στραβά. Προσπαθήστε ξανά.'
    },
    en: {
      title: 'How are you feeling today?',
      categories: 'Select category',
      emotions: 'Select up to 3 emotions',
      notes: 'Notes',
      addNotes: 'Add your thoughts...',
      submit: 'Submit',
      submitting: 'Submitting...',
      success: 'Entry submitted successfully!',
      error: 'Something went wrong. Please try again.'
    }
  };

  const t = translations[language];

  const resetForm = () => {
    setSelectedMood(null);
    setSelectedEmotions([]);
    setSelectedCategory(null);
    setNotes('');
  };

  const handleSubmit = async () => {
    if (!selectedMood || !selectedCategory) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await googleSheetsService.addMoodEntry({
        userEmail,
        category: selectedCategory,
        moodEmoji: selectedMood,
        emotions: selectedEmotions,
        notes
      });

      if (result.success) {
        setSubmitStatus('success');
        setTimeout(() => {
          resetForm();
          setSubmitStatus(null);
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 content-wrapper p-4">
      {/* Status Messages */}
      {submitStatus && (
        <div className={`fixed top-4 right-4 p-4 rounded-xl glassmorphic flex items-center gap-2
          ${submitStatus === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          {submitStatus === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span>
            {submitStatus === 'success' ? t.success : t.error}
          </span>
        </div>
      )}

      {/* Moods */}
      <div>
        <h2 className="text-xl mb-4 text-white">{t.title}</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {moods.map((mood) => {
            const MoodIcon = mood.icon;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`
                  transition-all duration-300
                  p-4 rounded-full glassmorphic
                  hover:scale-110 hover:shadow-lg
                  ${selectedMood === mood.id 
                    ? 'scale-110 shadow-lg ring-2 ring-white/30' 
                    : ''
                  }
                `}
                style={{
                  backgroundColor: mood.color,
                }}
                title={mood.label}
              >
                <MoodIcon className="w-8 h-8" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-xl mb-4 text-white">{t.categories}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                p-3 rounded-xl text-sm glassmorphic
                transition-all duration-300
                hover:scale-105 hover:shadow-lg
                ${selectedCategory === category.id 
                  ? 'scale-105 shadow-lg ring-2 ring-white/30' 
                  : ''
                }
              `}
              style={{
                backgroundColor: category.color,
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Emotions */}
      <div>
        <h2 className="text-xl mb-4 text-white">{t.emotions}</h2>
        <div className="flex flex-wrap gap-2">
          {emotions.map((emotion) => (
            <button
              key={emotion.value}
              onClick={() => {
                if (selectedEmotions.includes(emotion.value)) {
                  setSelectedEmotions(prev => prev.filter(e => e !== emotion.value));
                } else if (selectedEmotions.length < 3) {
                  setSelectedEmotions(prev => [...prev, emotion.value]);
                }
              }}
              disabled={selectedEmotions.length >= 3 && !selectedEmotions.includes(emotion.value)}
              className={`
                px-4 py-2 rounded-full glassmorphic
                transition-all duration-300
                ${selectedEmotions.includes(emotion.value)
                  ? 'scale-105 shadow-lg ring-2 ring-white/30' 
                  : ''
                }
                ${selectedEmotions.length >= 3 && !selectedEmotions.includes(emotion.value)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105 hover:shadow-lg'
                }
              `}
              style={{
                backgroundColor: `var(--emotion-${emotion.value})`
              }}
            >
              {emotion.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <h2 className="text-xl mb-4 text-white">{t.notes}</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.addNotes}
          className="w-full h-32 glassmorphic rounded-xl p-4 
                    placeholder-white/50 resize-none 
                    focus:ring-2 focus:ring-white/30 focus:outline-none"
          maxLength={500}
        />
        <div className="text-right text-sm text-white/50">
          {notes.length}/500
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`
          w-full py-3 rounded-xl glassmorphic
          transition-all duration-300
          ${isSubmitting 
            ? 'bg-white/10 cursor-not-allowed' 
            : 'bg-white/20 hover:bg-white/30 hover:shadow-lg'
          }
        `}
      >
        {isSubmitting ? (
          <>
            <Loader className="w-5 h-5 animate-spin inline-block mr-2" />
            {t.submitting}
          </>
        ) : (
          t.submit
        )}
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
