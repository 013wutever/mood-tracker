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
import GlassmorphicContainer from '../../components/ui/GlassmorphicContainer';

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
      id: 'very-negative', 
      icon: Frown, 
      color: 'var(--mood-very-negative)',
      label: t('moodEntry.moods.veryNegative')
    },
    { 
      id: 'negative', 
      icon: Frown, 
      color: 'var(--mood-negative)',
      label: t('moodEntry.moods.negative')
    },
    { 
      id: 'neutral', 
      icon: Meh, 
      color: 'var(--mood-neutral)',
      label: t('moodEntry.moods.neutral')
    },
    { 
      id: 'positive', 
      icon: Smile, 
      color: 'var(--mood-positive)',
      label: t('moodEntry.moods.positive')
    },
    { 
      id: 'very-positive', 
      icon: Laugh, 
      color: 'var(--mood-very-positive)',
      label: t('moodEntry.moods.veryPositive')
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
    <div className="w-full">
      {/* Status Messages */}
      {submitStatus && (
        <GlassmorphicContainer 
          className={`relative top-4 right-4 p-4 rounded-xl flex items-center gap-2 z-50
            ${submitStatus === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}
        >
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
        </GlassmorphicContainer>
      )}

      {/* Main content with scroll */}
      <div className="space-y-6 md:space-y-8 pb-32">
        {/* Moods */}
        <div className="mood-section">
          <h2 className="text-lg md:text-xl mb-4">
            {t('moodEntry.title')}
          </h2>
          <div className="grid grid-cols-5 gap-3 md:gap-4 px-4 md:px-20">
            {moods.map((mood) => {
              const MoodIcon = mood.icon;
              return (
                <GlassmorphicContainer
                  key={mood.id}
                  as="button"
                  onClick={() => setSelectedMood(mood.id)}
                  className={`
                    rounded-full
                    aspect-square
                    flex items-center justify-center
                    ${isMobile ? 'min-h-[36px] min-w-[36px]' : 'h-18 w-18'}
                  `}
                  hover={true}
                  active={selectedMood === mood.id}
                  style={{
                    backgroundColor: mood.color,
                    opacity: selectedMood === mood.id ? 1 : 0.8
                  }}
                  title={mood.label}
                  isButton={true}
                >
                  <MoodIcon className={isMobile ? 'w-5 h-5' : 'w-8 h-8'} />
                </GlassmorphicContainer>
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
              <GlassmorphicContainer
                key={category.id}
                as="button"
                onClick={() => setSelectedCategory(category.id)}
                className="p-3 rounded-xl text-sm min-h-[44px]"
                hover={true}
                active={selectedCategory === category.id}
                style={{
                  backgroundColor: selectedCategory === category.id ? category.color : undefined
                }}
                isButton={true}
              >
                {category.name}
              </GlassmorphicContainer>
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
              <GlassmorphicContainer
                key={emotion.value}
                as="button"
                onClick={() => {
                  if (selectedEmotions.includes(emotion.value)) {
                    setSelectedEmotions(prev => prev.filter(e => e !== emotion.value));
                  } else if (selectedEmotions.length < 3) {
                    setSelectedEmotions(prev => [...prev, emotion.value]);
                  }
                }}
                disabled={selectedEmotions.length >= 3 && !selectedEmotions.includes(emotion.value)}
                className={`
                  px-4 py-2 rounded-full text-sm min-h-[44px]
                  ${selectedEmotions.length >= 3 && !selectedEmotions.includes(emotion.value)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''}
                `}
                hover={true}
                active={selectedEmotions.includes(emotion.value)}
                style={{
                  backgroundColor: selectedEmotions.includes(emotion.value) 
                    ? emotion.color 
                    : undefined
                }}
                isButton={true}
              >
                {emotion.name}
              </GlassmorphicContainer>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="notes-section">
          <h2 className="text-lg md:text-xl mb-4">
            {t('moodEntry.notes.title')}
          </h2>
          <GlassmorphicContainer as="div" className="rounded-xl bg-white/10">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('moodEntry.notes.placeholder')}
              className="w-full min-h-[120px] p-4 
                placeholder-white/50 resize-none
                focus:ring-2 focus:ring-white/30 focus:outline-none
                text-base bg-transparent rounded-xl"
              style={{ fontSize: '16px' }}
              maxLength={500}
            />
          </GlassmorphicContainer>
          <div className="text-right text-sm text-white/50 mt-2">
            {`${notes.length}/500 ${t('moodEntry.notes.charCount')}`}
          </div>
        </div>
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className={`
        ${isMobile 
          ? 'sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-purple-300/80 via-purple-300/80 to-transparent' 
          : 'mt-6'}
      `}>
        <GlassmorphicContainer
          as="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 md:py-3 rounded-xl min-h-[44px]"
          hover={true}
          isButton={true}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
              <span>{t('moodEntry.submitting')}</span>
            </div>
          ) : (
            t('moodEntry.submit')
          )}
        </GlassmorphicContainer>

        {/* Timestamp */}
        <div className="text-center text-sm text-white/50 flex items-center justify-center gap-2 mt-2">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleTimeString(language === 'el' ? 'el-GR' : 'en-US')}
        </div>
      </div>
    </div>
  );
};

export default MoodEntry;
