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
    },
    en: {
      // ... English translations ...
    }
  };

  const EMOTION_LABELS = {
    // Θετικά συναισθήματα
    "joy": "Χαρά",
    "calm": "Ηρεμία",
    "gratitude": "Ευγνωμοσύνη",
    "enthusiasm": "Ενθουσιασμός",
    "optimism": "Αισιοδοξία",
    "satisfaction": "Ικανοποίηση",
    "pride": "Περηφάνια",
    "love": "Αγάπη",
    "relief": "Ανακούφιση",
    "serenity": "Γαλήνη",
    
    // Αρνητικά συναισθήματα
    "anxiety": "Άγχος",
    "anger": "Θυμός",
    "sadness": "Λύπη",
    "disappointment": "Απογοήτευση",
    "worry": "Ανησυχία",
    "frustration": "Ματαίωση",
    "shame": "Ντροπή",
    "loneliness": "Μοναξιά",
    "fear": "Φόβος",
    "insecurity": "Ανασφάλεια"
  };

  const COLORS = {
    // Θετικά συναισθήματα (φωτεινά παστέλ)
    "joy": "rgba(255, 196, 196, 0.75)",      // Ροζ
    "calm": "rgba(182, 232, 255, 0.75)",     // Γαλάζιο
    "gratitude": "rgba(196, 255, 196, 0.75)", // Πράσινο
    "enthusiasm": "rgba(255, 223, 186, 0.75)", // Πορτοκαλί
    "optimism": "rgba(255, 255, 186, 0.75)",  // Κίτρινο
    "satisfaction": "rgba(186, 255, 223, 0.75)", // Τιρκουάζ
    "pride": "rgba(223, 186, 255, 0.75)",    // Μωβ ανοιχτό
    "love": "rgba(255, 186, 223, 0.75)",     // Ροζ ανοιχτό
    "relief": "rgba(186, 223, 255, 0.75)",   // Γαλάζιο ανοιχτό
    "serenity": "rgba(186, 255, 255, 0.75)", // Τιρκουάζ ανοιχτό
    
    // Αρνητικά συναισθήματα (μουντά παστέλ)
    "anxiety": "rgba(169, 169, 169, 0.75)",   // Γκρι
    "anger": "rgba(205, 147, 147, 0.75)",     // Κόκκινο-γκρι
    "sadness": "rgba(147, 147, 205, 0.75)",   // Μπλε-γκρι
    "disappointment": "rgba(186, 158, 158, 0.75)", // Καφέ-γκρι
    "worry": "rgba(169, 186, 169, 0.75)",     // Πράσινο-γκρι
    "frustration": "rgba(186, 169, 158, 0.75)", // Πορτοκαλί-γκρι
    "shame": "rgba(186, 158, 186, 0.75)",     // Μωβ-γκρι
    "loneliness": "rgba(158, 158, 186, 0.75)", // Μπλε-γκρι ανοιχτό
    "fear": "rgba(186, 169, 169, 0.75)",      // Κόκκινο-γκρι ανοιχτό
    "insecurity": "rgba(169, 169, 186, 0.75)", // Μωβ-γκρι ανοιχτό

    // Διάθεση
    'very-positive': 'rgba(127,205,205,0.75)', // Γαλαζοπράσινο
    'positive': 'rgba(152,251,152,0.75)',      // Πράσινο ανοιχτό
    'neutral': 'rgba(212,225,87,0.75)',        // Κίτρινο απαλό
    'negative': 'rgba(255,179,71,0.75)',       // Πορτοκαλί ανοιχτό
    'very-negative': 'rgba(255,153,153,0.75)', // Κόκκινο απαλό

    // Κατηγορίες
    personal: 'rgba(156,39,176,0.75)',       // Μωβ
    friends: 'rgba(76,175,80,0.75)',         // Πράσινο
    family: 'rgba(33,150,243,0.75)',         // Μπλε
    work: 'rgba(255,152,0,0.75)',            // Πορτοκαλί
    studies: 'rgba(255,235,59,0.75)',        // Κίτρινο
    health: 'rgba(233,30,99,0.75)',          // Ροζ
    finances: 'rgba(158,158,158,0.75)',      // Γκρι
    entertainment: 'rgba(0,150,136,0.75)'    // Τιρκουάζ
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
        // Μετατροπή των δεδομένων με ελληνικά labels
        const formattedData = {
          ...data,
          emotions: data.emotions.map(emotion => ({
            ...emotion,
            name: EMOTION_LABELS[emotion.name] || emotion.name
          })),
          timeOfDay: data.timeOfDay.map(entry => ({
            ...entry,
            name: TIME_LABELS[entry.name] || entry.name
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
                          fill={COLORS[entry.originalName] || COLORS[entry.type === 'positive' ? 'positive' : 'negative']} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mood Distribution */}
            <div className="glassmorphic rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4">
                {translations[language].charts.mood}
              </h3>
              <div className="aspect-square">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.moodDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      label
                    >
                      {stats.moodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.originalName]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px'
                      }}
                    />
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
                        <Cell key={`cell-${index}`} fill={COLORS[entry.id]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time of Day */}
            <div className="glassmorphic rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4">
                {translations[language].charts.timeOfDay}
              </h3>
              <div className="aspect-square">
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
                          fill={[
                            'rgba(179,229,252,0.75)', // Πρωί - ανοιχτό γαλάζιο
                            'rgba(255,236,179,0.75)', // Μεσημέρι - ανοιχτό κίτρινο
                            'rgba(255,204,188,0.75)', // Απόγευμα - ανοιχτό πορτοκαλί
                            'rgba(179,157,219,0.75)'  // Βράδυ - ανοιχτό μωβ
                          ][index % 4]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px'
                      }}
                    />
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
