import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader,
  XCircle,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { getTranslation } from '../../utils/translations';
import googleSheetsService from '../../services/googleSheets';

const MyEntries = ({ language = 'el', userEmail }) => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('month');
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewHistory, setViewHistory] = useState([]);
  const [lastEntries, setLastEntries] = useState([]);

  const t = (path) => getTranslation(language, path);

  useEffect(() => {
    fetchEntries();
  }, [userEmail, currentDate, viewType]);

  const fetchEntries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await googleSheetsService.getCalendarEntries(userEmail);
      
      if (response.success) {
        setEntries(response.data);
        // Set last 3 entries
        const sortedEntries = [...response.data].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        ).slice(0, 3);
        setLastEntries(sortedEntries);
      } else {
        throw new Error('Failed to fetch entries');
      }
    } catch (err) {
      setError(t('states.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToDate = (date, type = viewType) => {
    setViewHistory(prev => [...prev, { date: currentDate, type: viewType }]);
    setCurrentDate(date);
    setViewType(type);
  };

  const navigateBack = () => {
    const previous = viewHistory[viewHistory.length - 1];
    if (previous) {
      setCurrentDate(previous.date);
      setViewType(previous.type);
      setViewHistory(prev => prev.slice(0, -1));
    }
  };

  const renderEntryCard = (entry) => (
    <div 
      key={entry.id}
      className="glassmorphic rounded-xl p-4 space-y-3"
    >
      {/* Date and Time */}
      <div className="flex items-center justify-between text-sm text-white/70">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          {new Date(entry.date).toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US')}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {new Date(entry.date).toLocaleTimeString(language === 'el' ? 'el-GR' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* Category */}
      <div>
        <span className="text-sm font-medium text-white/70">
          {t(`moodEntry.categories.${entry.category}`)}
        </span>
      </div>

      {/* Notes */}
      {entry.notes && (
        <p className="text-white/90">{entry.notes}</p>
      )}

      {/* Emotions and Mood */}
      <div className="flex justify-end items-center gap-2 pt-2">
        {entry.emotions.map((emotion, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full"
            style={{ 
              backgroundColor: `var(--emotion-${emotion})`,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)' 
            }}
            title={t(`moodEntry.emotions.${emotion}`)}
          />
        ))}
        <div 
          className="w-6 h-6 rounded-full ml-2"
          style={{ 
            backgroundColor: `var(--mood-${entry.mood})`,
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)' 
          }}
          title={t(`moodEntry.moods.${entry.mood}`)}
        />
      </div>
    </div>
  );

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();
    
    const daysOfWeek = language === 'el' 
      ? ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div>
        {/* Days of week header */}
        <div className="grid grid-cols-7 mb-4">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-sm font-medium text-white/70">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {days.map(({ date, entries, mood, emotions }) => (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`
                aspect-square p-2 rounded-lg
                glassmorphic-hover
                transition-all duration-300
                ${entries.length > 0 ? 'cursor-pointer' : 'cursor-default'}
                ${selectedDate?.toDateString() === date.toDateString() ? 'active scale-105' : ''}
              `}
              style={{
                backgroundColor: entries.length > 0 
                  ? `var(--mood-${mood || 'neutral'})` 
                  : 'rgba(255, 255, 255, 0.05)'
              }}
              data-active={selectedDate?.toDateString() === date.toDateString()}
            >
              <div className="h-full flex flex-col">
                <span className="text-sm">
                  {date.getDate()}
                </span>
                {entries.length > 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex gap-1">
                      {emotions.slice(0, 2).map((emotion, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: `var(--emotion-${emotion})` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderSelectedDayEntries = () => {
    if (!selectedDate) return null;

    const dayEntries = entries.filter(entry => 
      new Date(entry.date).toDateString() === selectedDate.toDateString()
    );

    if (dayEntries.length === 0) {
      return (
        <div className="text-center text-white/70 py-4">
          {t('myEntries.calendar.noEntries')}
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-6">
        {dayEntries.map(entry => renderEntryCard(entry))}
      </div>
    );
  };

  // Rest of the component code...

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">
          {t('myEntries.title')}
        </h1>

        <div className="flex items-center gap-4">
          {/* View type toggle */}
          <div className="flex rounded-xl overflow-hidden glassmorphic">
            {Object.entries(t('myEntries.calendar.viewType')).map(([type, label]) => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                className={`px-4 py-2 text-sm transition-colors
                  ${viewType === type 
                    ? 'bg-white/20 shadow-inner' 
                    : 'bg-white/5 hover:bg-white/10'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {viewHistory.length > 0 && (
              <button
                onClick={navigateBack}
                className="p-2 rounded-full glassmorphic hover:bg-white/20"
                title={t('myEntries.calendar.navigate.back')}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                const date = new Date(currentDate);
                viewType === 'month'
                  ? date.setMonth(date.getMonth() - 1)
                  : date.setFullYear(date.getFullYear() - 1);
                setCurrentDate(date);
              }}
              className="p-2 rounded-full glassmorphic hover:bg-white/20"
              title={t('myEntries.calendar.navigate.previous')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const date = new Date(currentDate);
                viewType === 'month'
                  ? date.setMonth(date.getMonth() + 1)
                  : date.setFullYear(date.getFullYear() + 1);
                setCurrentDate(date);
              }}
              className="p-2 rounded-full glassmorphic hover:bg-white/20"
              title={t('myEntries.calendar.navigate.next')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="glassmorphic rounded-xl p-6">
        {viewType === 'month' ? renderMonthView() : renderYearView()}
        {renderSelectedDayEntries()}
      </div>

      {/* Last 3 Entries */}
      {lastEntries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {t('myEntries.lastEntries')}
          </h2>
          {lastEntries.map(entry => renderEntryCard(entry))}
        </div>
      )}
    </div>
  );
};

export default MyEntries;
