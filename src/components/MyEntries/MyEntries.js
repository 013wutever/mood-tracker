import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  List,
  Loader,
  XCircle
} from 'lucide-react';
import googleSheetsService from '../../services/googleSheets';

const MyEntries = ({ language = 'el', userEmail }) => {
  const [viewType, setViewType] = useState('month'); // 'month' or 'year'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const translations = {
    el: {
      title: 'Οι καταχωρήσεις μου',
      viewTypes: {
        month: 'Μήνας',
        year: 'Έτος'
      },
      months: [
        'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος',
        'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος',
        'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
      ],
      weekDays: ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'],
      noEntries: 'Δεν υπάρχουν γραπτές καταχωρήσεις για αυτή την ημέρα',
      latestEntries: 'Τελευταίες καταχωρήσεις',
      loading: 'Φόρτωση...',
      error: 'Σφάλμα φόρτωσης δεδομένων',
      retry: 'Δοκιμάστε ξανά',
      emotions: 'Συναισθήματα',
      mood: 'Διάθεση',
      category: 'Κατηγορία'
    },
    en: {
      // ... [αντίστοιχες μεταφράσεις στα αγγλικά]
    }
  };

  const t = translations[language];

  // Helper function to parse dates from the Google Sheet format
  const parseDateString = (dateStr) => {
    try {
      return new Date(dateStr);
    } catch (error) {
      console.error('Error parsing date:', dateStr, error);
      return new Date();
    }
  };

  // Fetch entries when component mounts or when viewType/currentDate changes
  useEffect(() => {
    fetchEntries();
  }, [viewType, currentDate, userEmail]);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Calculate date range based on view type
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);

      if (viewType === 'month') {
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      } else {
        startDate.setMonth(0, 1);
        endDate.setMonth(11, 31);
      }

      console.log('Fetching entries for:', {
        userEmail,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const response = await googleSheetsService.getCalendarEntries(userEmail);

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch entries');
      }

      // Transform the entries to the expected format
      const transformedEntries = response.data.map(row => ({
        id: row[6], // UniqueID
        date: parseDateString(row[0]), // Timestamp
        mood: row[3], // MoodEmoji
        emotions: row[4].split(','), // Emotions array
        notes: row[5], // Notes
        category: row[2] // Category
      }));

      console.log('Transformed entries:', transformedEntries);
      setEntries(transformedEntries);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError(t.error);
      setIsLoading(false);
    }
  };

  // Get color based on mood and emotions
  const getMoodColor = (mood) => {
    const colorMap = {
      'very-negative': 'rgba(254, 202, 202, 0.4)',
      'negative': 'rgba(254, 215, 170, 0.4)',
      'neutral': 'rgba(254, 240, 138, 0.4)',
      'positive': 'rgba(187, 247, 208, 0.4)',
      'very-positive': 'rgba(186, 230, 253, 0.4)'
    };
    return colorMap[mood] || 'rgba(255, 255, 255, 0.1)';
  };

  // Get entries for a specific date
  const getEntriesForDate = (date) => {
    return entries.filter(entry => 
      entry.date.toDateString() === date.toDateString()
    );
  };

  // Generate calendar data
  const generateCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    if (viewType === 'month') {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startingDay = firstDay.getDay();
      const totalDays = lastDay.getDate();
      
      const days = [];
      for (let i = 0; i < startingDay; i++) {
        days.push(null);
      }
      
      for (let day = 1; day <= totalDays; day++) {
        days.push(new Date(year, month, day));
      }
      
      return days;
    } else {
      return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
    }
  };

  // Calendar navigation
  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else {
      newDate.setFullYear(newDate.getFullYear() + direction);
    }
    setCurrentDate(newDate);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader className="w-8 h-8 animate-spin text-white/50" />
        <p className="text-white/70">{t.loading}</p>
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
          {t.retry}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        
        <div className="flex items-center space-x-4">
          {/* View type toggle */}
          <div className="flex rounded-xl overflow-hidden glassmorphic">
            {Object.entries(t.viewTypes).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setViewType(key)}
                className={`px-4 py-2 text-sm transition-colors
                  ${viewType === key 
                    ? 'bg-white/20 shadow-inner' 
                    : 'bg-white/5 hover:bg-white/10'}`}
              >
                {value}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full glassmorphic hover:bg-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="text-lg font-medium">
              {viewType === 'month' 
                ? `${t.months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : currentDate.getFullYear()}
            </span>
            
            <button
              onClick={() => navigate(1)}
              className="p-2 rounded-full glassmorphic hover:bg-white/20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glassmorphic rounded-xl p-6">
        {viewType === 'month' && (
          <div className="grid grid-cols-7 gap-1 mb-2">
            {t.weekDays.map(day => (
              <div key={day} className="text-center text-sm text-white/70">
                {day}
              </div>
            ))}
          </div>
        )}
        
        <div className={`grid gap-2 ${viewType === 'month' ? 'grid-cols-7' : 'grid-cols-4'}`}>
          {generateCalendarData().map((date, index) => {
            if (!date) return <div key={`empty-${index}`} />;
            
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const dateEntries = getEntriesForDate(date);
            const hasEntries = dateEntries.length > 0;
            
            // Get dominant mood for coloring
            const dominantEntry = dateEntries[0];
            const backgroundColor = dominantEntry 
              ? getMoodColor(dominantEntry.mood)
              : 'transparent';
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`
                  calendar-day
                  ${isSelected ? 'selected' : ''}
                  ${hasEntries ? 'has-entries' : ''}
                `}
                style={{
                  background: hasEntries ? backgroundColor : undefined
                }}
              >
                <span className={`
                  text-sm ${isSelected ? 'font-medium' : ''}
                  ${hasEntries ? 'text-white' : 'text-white/70'}
                `}>
                  {viewType === 'month' 
                    ? date.getDate()
                    : t.months[date.getMonth()]}
                </span>
                
                {hasEntries && (
                  <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-white/50" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Entries */}
      <div className="space-y-4">
        <h2 className="text-xl font-medium">
          {selectedDate.toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US')}
        </h2>
        
        <div className="space-y-4">
          {getEntriesForDate(selectedDate).map((entry) => (
            <div 
              key={entry.id} 
              className="glassmorphic rounded-xl p-4 relative"
              style={{
                background: `linear-gradient(135deg, 
                  ${getMoodColor(entry.mood)},
                  transparent
                )`
              }}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-white/70">
                    <Clock className="w-4 h-4" />
                    <span>
                      {entry.date.toLocaleTimeString(
                        language === 'el' ? 'el-GR' : 'en-US',
                        { hour: '2-digit', minute: '2-digit' }
                      )}
                    </span>
                  </div>
                  <p className="text-white/90">{entry.notes}</p>
                </div>
                
                <div className="flex space-x-2">
                  {/* Mood indicator */}
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getMoodColor(entry.mood) }}
                  />
                  
                  {/* Emotion indicators */}
                  {entry.emotions.slice(0, 2).map((emotion) => (
                    <div 
                      key={emotion}
                      className="w-4 h-4 rounded-full"
                      style={{ 
                        backgroundColor: `var(--emotion-${emotion})`,
                        opacity: 0.8 
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {getEntriesForDate(selectedDate).length === 0 && (
            <div className="text-center text-white/50 py-8">
              {t.noEntries}
            </div>
          )}
        </div>
      </div>

      {/* Latest Entries */}
      <div className="space-y-4">
        <h2 className="text-xl font-medium">{t.latestEntries}</h2>
        
        <div className="space-y-4">
          {entries.slice(0, 3).map((entry) => (
            <div 
              key={entry.id}
              className="glassmorphic rounded-xl p-4 relative"
              style={{
                background: `linear-gradient(135deg, 
                  ${getMoodColor(entry.mood)},
                  transparent
                )`
              }}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-white/70">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      {entry.date.toLocaleDateString(
                        language === 'el' ? 'el-GR' : 'en-US'
                      )}
                    </span>
                    <Clock className="w-4 h-4" />
                    <span>
                      {entry.date.toLocaleTimeString(
                        language === 'el' ? 'el-GR' : 'en-US',
                        { hour: '2-digit', minute: '2-digit' }
                      )}
                    </span>
                  </div>
                  <p className="text-white/90">{entry.notes}</p>
                </div>
                
                <div className="flex space-x-2">
                  {/* Mood indicator */}
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getMoodColor(entry.mood) }}
                    title={t.mood}
                  />
                  
                  {/* Emotion indicators */}
                  {entry.emotions.slice(0, 2).map((emotion) => (
                    <div 
                      key={emotion}
                      className="w-4 h-4 rounded-full tooltip"
                      style={{ 
                        backgroundColor: `var(--emotion-${emotion})`,
                        opacity: 0.8 
                      }}
                      title={emotion}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last updated timestamp */}
      <div className="text-center text-sm text-white/50 flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        {new Date().toLocaleTimeString(language === 'el' ? 'el-GR' : 'en-US')}
      </div>
    </div>
  );
};

export default MyEntries;
                        
