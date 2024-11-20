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

  // Fetch data when component mounts or timeFilter changes
  useEffect(() => {
    fetchStats();
  }, [timeFilter, userEmail]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching stats for:', userEmail, timeFilter); // Debug log

      const response = await googleSheetsService.getEntries(userEmail, {
        timeFilter: timeFilter
      });

      console.log('API Response:', response); // Debug log

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch data');
      }

      const entries = response.data;

      // Process the entries to calculate stats
      const processedStats = {
        totalEntries: entries.length,
        weeklyCompletion: calculateWeeklyCompletion(entries),
        moodDistribution: calculateMoodDistribution(entries),
        categoryBreakdown: calculateCategoryBreakdown(entries),
        emotions: calculateEmotionsStats(entries),
        timeOfDay: calculateTimeOfDayStats(entries),
        positivityRatio: calculatePositivityRatio(entries)
      };

      console.log('Processed Stats:', processedStats); // Debug log

      setStats(processedStats);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(translations[language].error);
      setIsLoading(false);
    }
  };

  // Helper functions for calculations
  const calculateWeeklyCompletion = (entries) => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry[0]);
      return entryDate >= startOfWeek;
    });
    return Math.round((weekEntries.length / 7) * 100);
  };

  const calculateMoodDistribution = (entries) => {
    const moodCounts = entries.reduce((acc, entry) => {
      const mood = entry[3];
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(moodCounts).map(([name, value]) => ({
      name,
      value: Math.round((value / entries.length) * 100)
    }));
  };

  const calculateCategoryBreakdown = (entries) => {
    const categoryCounts = entries.reduce((acc, entry) => {
      const category = entry[2];
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value: Math.round((value / entries.length) * 100)
    }));
  };

  const calculateEmotionsStats = (entries) => {
    const allEmotions = entries.flatMap(entry => entry[4].split(','));
    const emotionCounts = allEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(emotionCounts).map(([name, value]) => ({
      name,
      value: Math.round((value / allEmotions.length) * 100)
    }));
  };

  const calculateTimeOfDayStats = (entries) => {
    const timeSlots = entries.map(entry => {
      const hour = new Date(entry[0]).getHours();
      if (hour < 12) return 'morning';
      if (hour < 17) return 'afternoon';
      if (hour < 20) return 'evening';
      return 'night';
    });

    const timeCounts = timeSlots.reduce((acc, time) => {
      acc[time] = (acc[time] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(timeCounts).map(([name, value]) => ({
      name,
      value: Math.round((value / timeSlots.length) * 100)
    }));
  };

  const calculatePositivityRatio = (entries) => {
    const positiveCount = entries.filter(entry => 
      ['positive', 'very-positive'].includes(entry[3])
    ).length;
    
    return Math.round((positiveCount / entries.length) * 100);
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader className="w-8 h-8 animate-spin text-white/50" />
        <p className="text-white/70">{translations[language].loading}</p>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="space-y-8">
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
                      fill={`var(--emotion-${entry.name})`}
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
                      fill={`var(--mood-${entry.name.toLowerCase()})`}
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
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Last updated timestamp */}
      <div className="text-center text-sm text-white/50 flex items-center justify-center gap-2">
        <CalendarIcon className="w-4 h-4" />
        {new Date().toLocaleDateString('el-GR')}
      </div>
    </div>
  );
};

export default Progress;
