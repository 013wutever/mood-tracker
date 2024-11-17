import React, { useState, useEffect } from 'react';
import { 
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
        timeOfDay: 'Ώρα ημέρας',
        positivityRatio: 'Θετικότητα/Αρνητικότητα'
      }
    },
    en: {
      // ... English translations ...
    }
  };

  const COLORS = {
    'very-positive': '#7FCDCD',  // γαλαζοπράσινο
    'positive': '#98FB98',       // πράσινο ανοιχτό
    'neutral': '#D4E157',        // κίτρινο απαλό
    'negative': '#FFB347',       // πορτοκαλί ανοιχτό
    'very-negative': '#FF9999',  // κόκκινο απαλό
    personal: '#9C27B0',
    friends: '#4CAF50',
    family: '#2196F3',
    work: '#FF9800',
    studies: '#FFEB3B',
    health: '#E91E63',
    finances: '#9E9E9E',
    entertainment: '#009688'
  };

  const MOOD_LABELS = {
    'very-positive': 'Πολύ θετική',
    'positive': 'Θετική',
    'neutral': 'Ουδέτερη',
    'negative': 'Αρνητική',
    'very-negative': 'Πολύ αρνητική'
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
        // Μετατροπή των δεδομένων για τα γραφήματα
        const formattedData = {
          ...data,
          moodDistribution: data.moodDistribution.map(item => ({
            ...item,
            name: MOOD_LABELS[item.name] || item.name
          })),
          timeOfDay: data.timeOfDay.map(item => ({
            ...item,
            name: TIME_LABELS[item.name] || item.name
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
                      fill="#8884d8"
                      label
                    >
                      {stats.emotions.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.type === 'positive' ? COLORS.positive : COLORS.negative} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
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
                      fill="#8884d8"
                      label
                    >
                      {stats.moodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.originalName]} />
                      ))}
                    </Pie>
                    <Tooltip />
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
                      fill="#8884d8"
                      label
                    >
                      {stats.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.id]} />
                      ))}
                    </Pie>
                    <Tooltip />
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
                      fill="#8884d8"
                      label
                    >
                      {stats.timeOfDay.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={['#B39DDB', '#90CAF9', '#FFB74D', '#4DB6AC'][index % 4]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
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
