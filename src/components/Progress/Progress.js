import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Filter, 
  Download,
  Activity,
  Calendar as CalendarIcon,
  Clock,
  Loader,
  XCircle
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import googleSheetsService from '../../services/googleSheets';

const Progress = ({ language = 'el', userEmail }) => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEntries: 0,
    weeklyCompletion: 0,
    moodDistribution: [],
    categoryBreakdown: [],
    emotions: [],
    timeOfDay: [],
    positivityRatio: []
  });

  const translations = {
    el: {
      title: 'Στατιστικά & Πρόοδος',
      filters: {
        week: 'Εβδομάδα',
        month: 'Μήνας',
        year: 'Έτος',
        all: 'Όλα'
      },
      stats: {
        totalEntries: 'Συνολικές καταχωρήσεις',
        weeklyCompletion: 'Ολοκλήρωση εβδομάδας',
      },
      charts: {
        emotions: 'Συναισθήματα',
        mood: 'Διάθεση',
        category: 'Κατηγορία',
        timeOfDay: 'Ώρα ημέρας'
      },
      loading: 'Φόρτωση...',
      error: 'Σφάλμα φόρτωσης δεδομένων',
      retry: 'Δοκιμάστε ξανά'
    }
  };

  const EMOTION_LABELS = {
    "χαρά": "Χαρά",
    "ενθουσιασμός": "Ενθουσιασμός",
    "αγάπη": "Αγάπη",
    "ηρεμία": "Ηρεμία",
    "ικανοποίηση": "Ικανοποίηση",
    "άγχος": "Άγχος",
    "φόβος": "Φόβος",
    "θυμός": "Θυμός",
    "λύπη": "Λύπη",
    "απογοήτευση": "Απογοήτευση",
    "ανακούφιση": "Ανακούφιση",
    "περηφάνια": "Περηφάνια",
    "ευγνωμοσύνη": "Ευγνωμοσύνη",
    "ζήλια": "Ζήλια",
    "ντροπή": "Ντροπή",
    "ενοχή": "Ενοχή",
    "σύγχυση": "Σύγχυση",
    "έκπληξη": "Έκπληξη",
    "ελπίδα": "Ελπίδα"
  };

  const getEmotionColor = (emotion) => {
    const style = getComputedStyle(document.documentElement);
    return style.getPropertyValue(`--emotion-${emotion}`).trim() || 'rgba(255,255,255,0.75)';
  };

  const TIME_COLORS = {
    'morning': 'rgba(179,229,252,0.75)',  // Πρωί - ανοιχτό γαλάζιο
    'noon': 'rgba(255,236,179,0.75)',     // Μεσημέρι - ανοιχτό κίτρινο
    'afternoon': 'rgba(255,204,188,0.75)', // Απόγευμα - ανοιχτό πορτοκαλί
    'evening': 'rgba(179,157,219,0.75)'    // Βράδυ - ανοιχτό μωβ
  };

  const TIME_LABELS = {
    'morning': 'Πρωί',
    'noon': 'Μεσημέρι',
    'afternoon': 'Απόγευμα',
    'evening': 'Βράδυ'
  };

  useEffect(() => {
    fetchStats();
  }, [timeFilter, userEmail]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await googleSheetsService.getUserStats(userEmail, timeFilter);
      if (data) {
        const formattedData = {
          ...data,
          emotions: data.emotions.map(emotion => ({
            ...emotion,
            name: EMOTION_LABELS[emotion.value] || emotion.name,
            color: getEmotionColor(emotion.value)
          })),
          timeOfDay: data.timeOfDay.map(entry => ({
            ...entry,
            name: TIME_LABELS[entry.name] || entry.name,
            color: TIME_COLORS[entry.name]
          }))
        };
        setStats(formattedData);
      }
    } catch (err) {
      setError(translations[language].error);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glassmorphic p-3 rounded-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm">{`${Math.round(payload[0].value)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 content-wrapper">
      {/* Header with filters */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-white">
          {translations[language].title}
        </h1>
        
        <div className="flex gap-2">
          <div className="flex rounded-xl overflow-hidden glassmorphic">
            {Object.entries(translations[language].filters).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setTimeFilter(key)}
                className={`px-4 py-2 text-sm transition-colors
                  ${timeFilter === key 
                    ? 'bg-white/20 shadow-inner' 
                    : 'bg-white/5 hover:bg-white/10'}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader className="w-8 h-8 animate-spin text-white/50" />
          <p className="text-white/70">{translations[language].loading}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <XCircle className="w-12 h-12 text-red-400" />
          <p className="text-white/70">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 glassmorphic rounded-xl hover:bg-white/20"
          >
            {translations[language].retry}
          </button>
        </div>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glassmorphic rounded-xl p-4">
              <div className="text-sm text-white/70 mb-2">
                {translations[language].stats.totalEntries}
              </div>
              <div className="text-2xl font-semibold">
                {stats.totalEntries}
              </div>
            </div>
            <div className="glassmorphic rounded-xl p-4">
              <div className="text-sm text-white/70 mb-2">
                {translations[language].stats.weeklyCompletion}
              </div>
              <div className="text-2xl font-semibold">
                {stats.weeklyCompletion}%
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emotions Chart */}
            <div className="glassmorphic rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4">
                {translations[language].charts.emotions}
              </h3>
              <div className="aspect-square">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.emotions}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      label
                    >
                      {stats.emotions.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="glassmorphic rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4">
                {translations[language].charts.category}
              </h3>
              <div className="aspect-square">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      label
                    >
                      {stats.categoryBreakdown.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getEmotionColor(entry.name.toLowerCase())}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time of Day */}
            <div className="glassmorphic rounded-xl p-6 col-span-2">
              <h3 className="text-lg font-medium mb-4">
                {translations[language].charts.timeOfDay}
              </h3>
              <div className="aspect-square max-w-xl mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.timeOfDay}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="40%"
                      outerRadius="70%"
                      label
                    >
                      {stats.timeOfDay.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Last updated */}
      <div className="text-center text-sm text-white/50 flex items-center justify-center gap-2">
        <CalendarIcon className="w-4 h-4" />
        {new Date().toLocaleDateString('el-GR')}
      </div>
    </div>
  );
};

export default Progress;
