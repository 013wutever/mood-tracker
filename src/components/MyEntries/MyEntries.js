import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { getTranslation } from '../utils/translations';
import googleSheetsService from '../services/googleSheets';

const MyEntries = ({ language = 'el', userEmail }) => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('month'); // 'month' or 'year'
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewHistory, setViewHistory] = useState([]);

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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const currentDay = new Date(year, month, day);
      const dayEntries = entries.filter(entry => 
        new Date(entry.date).toDateString() === currentDay.toDateString()
      );
      
      return {
        date: currentDay,
        entries: dayEntries,
        mood: dayEntries[0]?.mood || null,
        emotions: dayEntries[0]?.emotions || []
      };
    });
  };

  const getMonthsInYear = (date) => {
    const year = date.getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const currentMonth = new Date(year, i, 1);
      const monthEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === i && entryDate.getFullYear() === year;
      });
      
      return {
        date: currentMonth,
        entries: monthEntries,
        mood: monthEntries[0]?.mood || null,
        emotions: monthEntries.reduce((acc, entry) => [...acc, ...entry.emotions], [])
      };
    });
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();
    
    const daysOfWeek = ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'];

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
          {/* Empty cells for days before start of month */}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days with entries */}
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
                          className={`w-2 h-2 rounded-full emotion-${emotion}`}
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

  const renderYearView = () => {
    const months = getMonthsInYear(currentDate);
    const monthNames = [
      'Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μάι', 'Ιουν',
      'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'
    ];

    return (
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {months.map(({ date, entries, emotions }, index) => (
          <button
            key={date.toISOString()}
            onClick={() => navigateToDate(date, 'month')}
            className={`
              aspect-square p-4 rounded-xl
              glassmorphic-hover
              transition-all duration-300
              ${entries.length > 0 ? 'cursor-pointer' : 'cursor-default'}
            `}
            style={{
              backgroundColor: entries.length > 0
                ? 'rgba(255, 255, 255, 0.15)'
                : 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="h-full flex flex-col">
              <span className="text-lg font-medium mb-2">
                {monthNames[index]}
              </span>
              {entries.length > 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {Array.from(new Set(emotions)).slice(0, 4).map((emotion, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full emotion-${emotion}`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {entries.length > 0 && (
                <div className="text-sm text-white/70 mt-2">
                  {entries.length} καταχωρήσεις
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderSelectedEntries = () => {
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
        {dayEntries.map((entry) => (
          <div 
            key={entry.id}
            className="glassmorphic rounded-xl p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-2">
                {entry.emotions.map((emotion, i) => (
                  <div
                    key={i}
                    className={`px-3 py-1 rounded-full text-sm emotion-${emotion}`}
                  >
                    {t(`moodEntry.emotions.${emotion}`)}
                  </div>
                ))}
              </div>
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: `var(--mood-${entry.mood})` }}
              />
            </div>
            {entry.notes && (
              <p className="text-white/90">{entry.notes}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader className="w-8 h-8 animate-spin text-white/50" />
        <p className="text-white/70">{t('states.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-white/70">{error}</p>
        <button
          onClick={fetchEntries}
          className="px-4 py-2 glassmorphic rounded-xl hover:bg-white/20"
        >
          {t('states.retry')}
        </button>
      </div>
    );
  }

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
        {renderSelectedEntries()}
      </div>

      {/* Last updated */}
      <div className="text-center text-sm text-white/50 flex items-center justify-center gap-2">
        <CalendarIcon className="w-4 h-4" />
        {new Date().toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US')}
      </div>
    </div>
  );
};

export default MyEntries;
