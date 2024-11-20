import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  List,
  Loader,
  XCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const MyEntries = ({ language = 'el', userEmail }) => {
  const [viewType, setViewType] = useState('month'); // 'year', 'month', 'monthDetail'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [navigationStack, setNavigationStack] = useState([]); // Για το drill-down

  const translations = {
    el: {
      title: 'Οι Καταχωρήσεις μου',
      viewTypes: {
        year: 'Έτος',
        month: 'Μήνας'
      },
      months: [
        'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος',
        'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος',
        'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
      ],
      monthsShort: [
        'Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μάι', 'Ιουν',
        'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'
      ],
      weekDays: ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'],
      noEntries: 'Δεν υπάρχουν καταχωρήσεις για αυτή την ημέρα',
      latestEntries: 'Τελευταίες Καταχωρήσεις',
      loading: 'Φόρτωση...',
      error: 'Σφάλμα φόρτωσης δεδομένων',
      retry: 'Δοκιμάστε ξανά',
      backToYear: 'Επιστροφή στο έτος',
      backToMonth: 'Επιστροφή στο μήνα',
      categories: {
        work: 'Εργασία',
        family: 'Οικογένεια',
        friends: 'Φίλοι',
        health: 'Υγεία',
        entertainment: 'Ψυχαγωγία',
        studies: 'Σπουδές',
        personal: 'Προσωπικά',
        finances: 'Οικονομικά'
      },
      mood: 'Διάθεση',
      emotions: 'Συναισθήματα'
    },
    en: {
      title: 'My Entries',
      viewTypes: {
        year: 'Year',
        month: 'Month'
      },
      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      monthsShort: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
      weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      noEntries: 'No entries for this day',
      latestEntries: 'Latest Entries',
      loading: 'Loading...',
      error: 'Error loading data',
      retry: 'Try again',
      backToYear: 'Back to year',
      backToMonth: 'Back to month',
      categories: {
        work: 'Work',
        family: 'Family',
        friends: 'Friends',
        health: 'Health',
        entertainment: 'Entertainment',
        studies: 'Studies',
        personal: 'Personal',
        finances: 'Finances'
      },
      mood: 'Mood',
      emotions: 'Emotions'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (userEmail) {
      fetchEntries();
    }
  }, [userEmail]);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getEntries',
          data: { userEmail }
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch entries');
      }

      // Transform entries
      const transformedEntries = result.data.map(entry => ({
        id: entry[6],
        date: new Date(entry[0]),
        category: entry[2],
        mood: entry[3],
        emotions: entry[4].split(',').map(e => e.trim()),
        notes: entry[5]
      }));

      console.log('Transformed Entries:', transformedEntries);
      setEntries(transformedEntries);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodColor = (mood) => {
    return `var(--mood-${mood})`;
  };

  const getEntryColor = (entry) => {
    return getMoodColor(entry.mood);
  };

  const drillDown = (date) => {
    if (viewType === 'year') {
      setNavigationStack([...navigationStack, { date: currentDate, viewType }]);
      setCurrentDate(date);
      setViewType('month');
    } else if (viewType === 'month') {
      setNavigationStack([...navigationStack, { date: currentDate, viewType }]);
      setCurrentDate(date);
      setViewType('monthDetail');
    } else {
      setSelectedDate(date);
    }
  };

  const navigateBack = () => {
    if (navigationStack.length > 0) {
      const lastNavigation = navigationStack[navigationStack.length - 1];
      setCurrentDate(lastNavigation.date);
      setViewType(lastNavigation.viewType);
      setNavigationStack(navigationStack.slice(0, -1));
    }
  };

  const generateCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    switch (viewType) {
      case 'year':
        return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

      case 'month':
      case 'monthDetail':
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

      default:
        return [];
    }
  };

  const getEntriesForDate = (date) => {
    if (!date) return [];

    if (viewType === 'year') {
      return entries.filter(entry => 
        entry.date.getFullYear() === date.getFullYear() &&
        entry.date.getMonth() === date.getMonth()
      );
    } else {
      return entries.filter(entry => 
        entry.date.toDateString() === date.toDateString()
      );
    }
  };

  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewType === 'year') {
      newDate.setFullYear(newDate.getFullYear() + direction);
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
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
    <div className="space-y-8 mobile-content">
      {/* Header with navigation and view type selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {navigationStack.length > 0 && (
            <button
              onClick={navigateBack}
              className="p-2 rounded-full glassmorphic hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-2xl font-semibold">
            {viewType === 'year' 
              ? currentDate.getFullYear()
              : viewType === 'month'
                ? t.months[currentDate.getMonth()]
                : `${t.months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View type toggle */}
          {navigationStack.length === 0 && (
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
          )}

          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full glassmorphic hover:bg-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
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
        {(viewType === 'month' || viewType === 'monthDetail') && (
          <div className="grid grid-cols-7 gap-1 mb-2">
            {t.weekDays.map(day => (
              <div key={day} className="text-center text-sm text-white/70">
                {day}
              </div>
            ))}
          </div>
        )}
        
        <div className={`grid gap-2 ${viewType === 'year' ? 'grid-cols-3 md:grid-cols-4' : 'grid-cols-7'}`}>
          {generateCalendarData().map((date, index) => {
            if (!date) return <div key={`empty-${index}`} />;
            
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const dateEntries = getEntriesForDate(date);
            const hasEntries = dateEntries.length > 0;
            
            // Get dominant mood for coloring
            const dominantEntry = dateEntries[0];
            const backgroundColor = dominantEntry 
              ? getEntryColor(dominantEntry)
              : 'transparent';
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => drillDown(date)}
                className={`
                  calendar-day group
                  ${isSelected ? 'selected' : ''}
                  ${hasEntries ? 'has-entries' : ''}
                  hover:scale-105 transition-all duration-300
                `}
                style={{
                  background: hasEntries ? backgroundColor : undefined
                }}
              >
                <span className={`
                  text-sm ${isSelected ? 'font-medium' : ''}
                  ${hasEntries ? 'text-white' : 'text-white/70'}
                  group-hover:text-white
                `}>
                  {viewType === 'year' 
                    ? t.monthsShort[date.getMonth()]
                    : date.getDate()}
                </span>
                
                {hasEntries && (
                  <div className="absolute bottom-2 right-2 flex -space-x-1">
                    {dateEntries.slice(0, 2).map((entry, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-white/50"
                        style={{ transform: `translateX(${i * -4}px)` }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Entries */}
      {viewType !== 'year' && (
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
                    ${getEntryColor(entry)},
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
                      <span className="text-white/50">•</span>
                      <span>{t.categories[entry.category.toLowerCase()]}</span>
                    </div>
                    <p className="text-white/90">{entry.notes}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {/* Mood indicator */}
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getMoodColor(entry.mood) }}
                      title={`${t.mood}: ${entry.mood}`}
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
                        title={`${t.emotions}: ${emotion}`}
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
      )}

      {/* Latest Entries */}
      {viewType !== 'year' && (
        <div className="space-y-4">
          <h2 className="text-xl font-medium">{t.latestEntries}</h2>
          
          <div className="space-y-4">
            {entries.slice(0, 3).map((entry) => (
              <div 
                key={entry.id}
                className="glassmorphic rounded-xl p-4 relative"
                style={{
                  background: `linear-gradient(135deg, 
                    ${getEntryColor(entry)},
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
                      title={`${t.mood}: ${entry.mood}`}
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
                        title={`${t.emotions}: ${emotion}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEntries;
