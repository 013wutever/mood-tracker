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
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

const Progress = ({ language = 'el', userEmail }) => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    weeklyCompletion: 0,
    moodDistribution: [],
    categoryBreakdown: [],
    emotions: [],
    timeOfDay: []
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getEntries',
          data: {
            userEmail,
            timeFilter
          }
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('API response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      // Store raw data
      setRawData(result.data);
      
      // Calculate stats
      if (result.data && result.data.length > 0) {
        const calculatedStats = calculateStats(result.data);
        setStats(calculatedStats);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchData();
    }
  }, [userEmail, timeFilter]);

  const calculateStats = (data) => {
    // Example entry structure from sheets:
    // [timestamp, userEmail, category, moodEmoji, emotions, notes, id]
    
    const totalEntries = data.length;
    
    // Calculate weekly completion
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEntries = data.filter(entry => new Date(entry[0]) >= weekStart);
    const weeklyCompletion = Math.round((weekEntries.length / 7) * 100);

    // Calculate mood distribution
    const moodCounts = data.reduce((acc, entry) => {
      const mood = entry[3];
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    const moodDistribution = Object.entries(moodCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / totalEntries) * 100)
    }));

    // Calculate category breakdown
    const categoryCounts = data.reduce((acc, entry) => {
      const category = entry[2];
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const categoryBreakdown = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / totalEntries) * 100)
    }));

    // Calculate emotions
    const allEmotions = data.flatMap(entry => entry[4].split(','));
    const emotionCounts = allEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});

    const emotions = Object.entries(emotionCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / allEmotions.length) * 100)
    }));

    // Calculate time of day distribution
    const timeSlots = data.map(entry => {
      const hour = new Date(entry[0]).getHours();
      if (hour < 12) return 'morning';
      if (hour < 17) return 'afternoon';
      if (hour < 20) return 'evening';
      return 'night';
    });

    const timeOfDayCounts = timeSlots.reduce((acc, time) => {
      acc[time] = (acc[time] || 0) + 1;
      return acc;
    }, {});

    const timeOfDay = Object.entries(timeOfDayCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / timeSlots.length) * 100)
    }));

    return {
      totalEntries,
      weeklyCompletion,
      moodDistribution,
      categoryBreakdown,
      emotions,
      timeOfDay
    };
  };

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
      // ... English translations
    }
  };

  const t = translations[language];

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
          onClick={fetchData}
          className="px-4 py-2 glassmorphic rounded-xl hover:bg-white/20"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with filters */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-white">
          {t.title}
        </h1>
        
        <div className="flex gap-2">
          <div className="flex rounded-xl overflow-hidden glassmorphic">
            {Object.entries(t.filters).map(([key, value]) => (
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

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glassmorphic rounded-xl p-4">
          <div className="text-sm text-white/70 mb-2">
            {t.stats.totalEntries}
          </div>
          <div className="text-2xl font-semibold">
            {stats.totalEntries}
          </div>
        </div>
        <div className="glassmorphic rounded-xl p-4">
          <div className="text-sm text-white/70 mb-2">
            {t.stats.weeklyCompletion}
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
            {t.charts.emotions}
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
                      fill={`var(--emotion-${entry.name})`}
                    />
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
            {t.charts.category}
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
                      fill={`var(--category-${entry.name.toLowerCase()})`}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time of Day */}
        <div className="glassmorphic rounded-xl p-6 col-span-2">
          <h3 className="text-lg font-medium mb-4">
            {t.charts.timeOfDay}
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
                  {stats.timeOfDay.map((entry, index) => {
                    const colors = {
                      morning: 'rgba(179,229,252,0.75)',
                      afternoon: 'rgba(255,204,188,0.75)',
                      evening: 'rgba(179,157,219,0.75)',
                      night: 'rgba(69,90,100,0.75)'
                    };
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={colors[entry.name]}
                      />
                    );
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
