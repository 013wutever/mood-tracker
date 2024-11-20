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
import { getTranslation } from '../utils/translations';
import googleSheetsService from '../services/googleSheets';

const MoodEntry = ({ language = 'el', userEmail }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const t = (path) => getTranslation(language, path);

  const moods = [
    { 
      id: 'very-positive', 
      icon: Laugh, 
      color: 'var(--mood-very-positive)',
      label: t('moodEntry.moods.veryPositive')
    },
    { 
      id: 'positive', 
      icon: Smile, 
      color: 'var(--mood-positive)',
      label: t('moodEntry.moods.positive')
    },
    { 
      id: 'neutral', 
      icon: Meh, 
      color: 'var(--mood-neutral)',
      label: t('moodEntry.moods.neutral')
    },
    { 
      id: 'negative', 
      icon: Frown, 
      color: 'var(--mood-negative)',
      label: t('moodEntry.moods.negative')
    },
    { 
      id: 'very-negative', 
      icon: Frown, 
      color: 'var(--mood-very-negative)',
      label: t('moodEntry.moods.veryNegative')
    }
  ];

  const categories = [
    { id: 'personal', name: t('moodEntry.categories.personal'), color: 'bg-purple-300/20' },
    { id: 'friends', name: t('moodEntry.categories.friends'), color: 'bg-green-300/20' },
    { id: 'family', name: t('moodEntry.categories.family'), color: 'bg-blue-300/20' },
    { id: 'work', name: t('moodEntry.categories.work'), color: 'bg-orange-300/20' },
    { id: 'studies', name: t('moodEntry.categories.studies'), color: 'bg-yellow-300/20' },
    { id: 'health', name: t('moodEntry.categories.health'), color: 'bg-pink-300/20' },
    { id: 'finances', name: t('moodEntry.categories.finances'), color: 'bg-gray-300/20' },
    { id: 'entertainment', name: t('moodEntry.categories.entertainment'), color: 'bg-teal-300/20' }
  ];

  const emotions = Object.entries(t('moodEntry.emotions')).filter(([key]) => 
    key !== 'title'
  ).map(([value, name]) => ({
    name,
    value,
    type: value in emotionTypes ? 
      emotionTypes[value] : 
      'neutral'
  }));

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
            {submitStatus === 'success' ? 
              t('moodEntry.success') : 
              t('moodEntry.error')}
          </span>
        </div>
      )}

      {/* Moods */}
      <div>
        <h2 className="text-xl mb-4">
          {t('moodEntry.title')}
        </h2>
        <div className="flex flex-wrap gap-4 justify-center mood-grid">
          {moods.map((mood) => {
            const MoodIcon = mood.icon;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`
                  transition-all duration-300
                  p-4 rounded-full
                  glassmorphic-hover
                  hover:scale-110
                  hover:shadow-lg
                  ${selectedMood === mood.id ? 'active' : ''}
                `}
                style={{
                  '--mood-color': mood.color,
                  backgroundColor: selectedMood === mood.id ? mood.color : 'rgba(255, 255, 255, 0.1)'
                }}
                title={mood.label}
                data-active={selectedMood === mood.id}
              >
                <MoodIcon className="w-8 h-8" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-xl mb-4">
          {t('moodEntry.categories.title')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 category-grid">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                p-3 rounded-xl text-sm glassmorphic-hover
                transition-all duration-300
                hover:scale-105
                ${selectedCategory === category.id ? 'active' : ''}
              `}
              data-active={selectedCategory === category.id}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Emotions */}
      <div>
        <h2 className="text-xl mb-4">
          {t('moodEntry.emotions.title')}
        </h2>
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
                emotion-pill emotion-${emotion.value}
                glassmorphic-hover
                ${selectedEmotions.includes(emotion.value) ? 'active' : ''}
                ${selectedEmotions.length >= 3 && !selectedEmotions.includes(emotion.value)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105'
                }
              `}
              data-active={selectedEmotions.includes(emotion.value)}
            >
              {emotion.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <h2 className="text-xl mb-4">
          {t('moodEntry.notes.title')}
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('moodEntry.notes.placeholder')}
          className="w-full h-32 glassmorphic bg-white/10 rounded-xl p-4 
                    placeholder-white/50 resize-none focus:ring-2 
                    focus:ring-white/30 focus:outline-none"
          maxLength={500}
        />
        <div className="text-right text-sm text-white/50">
          {`${notes.length}/500 ${t('moodEntry.notes.charCount')}`}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`
          w-full py-3 rounded-xl glassmorphic-hover
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
            {t('moodEntry.submitting')}
          </>
        ) : (
          t('moodEntry.submit')
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
