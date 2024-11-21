import React, { useState, useEffect } from 'react';
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
import { getTranslation } from '../../utils/translations';
import googleSheetsService from '../../services/googleSheets';

const MoodEntry = ({ language = 'el', userEmail }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    { id: 'personal', name: t('moodEntry.categories.personal'), color: 'var(--category-personal)' },
    { id: 'friends', name: t('moodEntry.categories.friends'), color: 'var(--category-friends)' },
    { id: 'family', name: t('moodEntry.categories.family'), color: 'var(--category-family)' },
    { id: 'work', name: t('moodEntry.categories.work'), color: 'var(--category-work)' },
    { id: 'studies', name: t('moodEntry.categories.studies'), color: 'var(--category-studies)' },
    { id: 'health', name: t('moodEntry.categories.health'), color: 'var(--category-health)' },
    { id: 'finances', name: t('moodEntry.categories.finances'), color: 'var(--category-finances)' },
    { id: 'entertainment', name: t('moodEntry.categories.entertainment'), color: 'var(--category-entertainment)' }
  ];

  const emotions = Object.entries(t('moodEntry.emotions')).filter(([key]) => 
    key !== 'title'
  ).map(([value, name]) => ({
    name,
    value,
    color: `var(--emotion-${value})`
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
    <div className="space-y-6 md:space-y-8 content-wrapper scroll-container">
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
      <div className="mood-section">
        <h2 className="text-lg md:text-xl mb-4">
          {t('moodEntry.title')}
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 justify-items-center">
          {moods.map((mood) => {
            const MoodIcon = mood.icon;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`
                  transition-all duration-300
                  p-4 md:p-4 rounded-full
                  glassmorphic-hover
                  touch-manipulation
                  min-h-[44px] min-w-[44px]
                  aspect-square
                  ${selectedMood === mood.id ? 'active scale-110' : ''}
                `}
                style={{
                  backgroundColor: selectedMood === mood.id ? mood.color : 'rgba(255, 255, 255, 0.1)'
                }}
                title={mood.label}
                data-active={selectedMood === mood.id}
              >
                <MoodIcon className="w-full h-full" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div className="category-section">
        <h2 className="text-lg md:text-xl mb-4">
          {t('moodEntry.categories.title')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                p-3 rounded-xl text-sm 
                glassmorphic-hover
                touch-manipulation
                min-h-[44px]
                transition-all duration-300
                ${selectedCategory === category.id ? 'active scale-105' : ''}
              `}
              style={{
                backgroundColor: selectedCategory === category.id ? category.color : 'rgba(255, 255, 255, 0.1)'
              }}
              data-active={selectedCategory === category.id}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Emotions */}
      <div className="emotions-section">
        <h2 className="text-lg md:text-xl mb-4">
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
              style={{
                backgroundColor: selectedEmotions.includes(emotion.value) 
                  ? emotion.color 
                  : 'rgba(255, 255, 255, 0.1)'
              }}
              className={`
                emotion-pill
                touch-manipulation
                min-h-[44px]
                transition-all duration-300
                ${selectedEmotions.includes(emotion.value) ? 'active scale-105' : ''}
                ${selectedEmotions.length >= 3 && !selectedEmotions.includes(emotion.value)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''}
              `}
              data-active={selectedEmotions.includes(emotion.value)}
            >
              {emotion.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="notes-section">
        <h2 className="text-lg md:text-xl mb-4">
          {t('moodEntry.notes.title')}
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('moodEntry.notes.placeholder')}
          className="w-full min-h-[120px] glassmorphic bg-white/10 rounded-xl p-4 
                    placeholder-white/50 resize-none focus:ring-2 
                    focus:ring-white/30 focus:outline-none
                    text-base"
          style={{ fontSize: '16px' }}
          maxLength={500}
        />
        <div className="text-right text-sm text-white/50 mt-2">
          {`${notes.length}/500 ${t('moodEntry.notes.charCount')}`}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`
          w-full py-4 md:py-3 rounded-xl 
          glassmorphic-hover
          touch-manipulation
          min-h-[44px]
          transition-all duration-300
          ${isSubmitting 
            ? 'bg-white/10 cursor-not-allowed' 
            : 'bg-white/20 hover:bg-white/30'}
        `}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <Loader className="w-5 h-5 animate-spin" />
            <span>{t('moodEntry.submitting')}</span>
          </div>
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
