import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Filter, 
  Download,
  Activity,
  Calendar as CalendarIcon,
  Clock,
  Loader,
  XCircle,
  Heart,
  Sun,
  Moon
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
    positivityRatio: 0,
    negativeEmotions: [],
    positiveEmotions: [],
    categoryMoodCorrelation: [],
    dailyMoodTrend: [],
    emotionCategoryBreakdown: []
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
        positivityRatio: 'Δείκτης θετικότητας',
      },
      charts: {
        emotions: 'Συναισθήματα',
        mood: 'Διάθεση',
        category: 'Κατηγορία',
        timeOfDay: 'Ώρα ημέρας',
        dailyTrend: 'Ημερήσια τάση',
        positiveEmotions: 'Θετικά συναισθήματα',
        negativeEmotions: 'Αρνητικά συναισθήματα',
        categoryMood: 'Συσχέτιση κατηγορίας-διάθεσης',
        emotionCategory: 'Συναισθήματα ανά κατηγορία'
      },
      loading: 'Φόρτωση...',
      error: 'Σφάλμα φόρτωσης δεδομένων',
      retry: 'Δοκιμάστε ξανά',
      timeOfDay: {
        morning: 'Πρωί',
        noon: 'Μεσημέρι',
        afternoon: 'Απόγευμα',
        evening: 'Βράδυ'
      }
    },
    en: {
      // ... [αντίστοιχες μεταφράσεις στα αγγλικά]
    }
  };

  const t = translations[language];

  const parseDateString = (dateStr) => {
    // Handle the format from Google Sheets (2024-11-20T14:...)
    return new Date(dateStr);
  };

  useEffect(() => {
    fetchStats();
  }, [timeFilter, userEmail]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await googleSheetsService.getEntries(userEmail, {
        timeFilter: timeFilter
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch data');
      }

      const entries = response.data;
      
      // Process entries
      const processedStats = {
        totalEntries: entries.length,
        weeklyCompletion: calculateWeeklyCompletion(entries),
        moodDistribution: calculateMoodDistribution(entries),
        categoryBreakdown: calculateCategoryBreakdown(entries),
        emotions: calculateEmotionsStats(entries),
        timeOfDay: calculateTimeOfDayStats(entries),
        positivityRatio: calculatePositivityRatio(entries),
        negativeEmotions: calculateNegativeEmotions(entries),
        positiveEmotions: calculatePositiveEmotions(entries),
        categoryMoodCorrelation: calculateCategoryMoodCorrelation(entries),
        dailyMoodTrend: calculateDailyMoodTrend(entries),
        emotionCategoryBreakdown: calculateEmotionCategoryBreakdown(entries)
      };

      setStats(processedStats);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(t.error);
      setIsLoading(false);
    }
  };

  // Calculation functions with proper date parsing
  const calculateWeeklyCompletion = (entries) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weekEntries = entries.filter(entry => {
      const entryDate = parseDateString(entry[0]);
      return entryDate >= startOfWeek;
    });
    
    return Math.round((weekEntries.length / 7) * 100);
  };

  // [Συνέχεια στο επόμενο μήνυμα λόγω μεγέθους...]
  // Additional calculation functions
  const calculateDailyMoodTrend = (entries) => {
    const moodValues = {
      'very-negative': 1,
      'negative': 2,
      'neutral': 3,
      'positive': 4,
      'very-positive': 5
    };

    // Group entries by date
    const dailyMoods = entries.reduce((acc, entry) => {
      const date = parseDateString(entry[0]).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(moodValues[entry[3]]);
      return acc;
    }, {});

    // Calculate average mood per day
    return Object.entries(dailyMoods).map(([date, moods]) => ({
      date: date,
      value: moods.reduce((sum, mood) => sum + mood, 0) / moods.length
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const calculateEmotionCategoryBreakdown = (entries) => {
    const breakdown = entries.reduce((acc, entry) => {
      const category = entry[2];
      const emotions = entry[4].split(',');
      
      emotions.forEach(emotion => {
        if (!acc[category]) {
          acc[category] = {};
        }
        acc[category][emotion] = (acc[category][emotion] || 0) + 1;
      });
      
      return acc;
    }, {});

    // Transform to format suitable for stacked bar chart
    return Object.entries(breakdown).map(([category, emotions]) => ({
      category,
      ...emotions
    }));
  };

  const calculateCategoryMoodCorrelation = (entries) => {
    const correlation = entries.reduce((acc, entry) => {
      const category = entry[2];
      const mood = entry[3];
      
      if (!acc[category]) {
        acc[category] = {
          positive: 0,
          negative: 0,
          total: 0
        };
      }
      
      acc[category].total++;
      if (['positive', 'very-positive'].includes(mood)) {
        acc[category].positive++;
      } else if (['negative', 'very-negative'].includes(mood)) {
        acc[category].negative++;
      }
      
      return acc;
    }, {});

    return Object.entries(correlation).map(([category, stats]) => ({
      category,
      positiveRatio: (stats.positive / stats.total) * 100,
      negativeRatio: (stats.negative / stats.total) * 100
    }));
  };

  // Custom components
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glassmorphic p-3 rounded-lg">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm">
              {`${item.name}: ${Math.round(item.value)}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Rendering the enriched dashboard
  return (
    <div className="space-y-8">
      {/* Header and filters - unchanged */}
      {/* ... */}

      {/* Quick stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="glassmorphic rounded-xl p-4">
          <div className="text-sm text-white/70 mb-2">
            {t.stats.positivityRatio}
          </div>
          <div className="text-2xl font-semibold">
            {stats.positivityRatio}%
          </div>
        </div>
      </div>

      {/* Mood Trend Chart */}
      <div className="glassmorphic rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">
          {t.charts.dailyTrend}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.dailyMoodTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Emotion Category Breakdown */}
      <div className="glassmorphic rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">
          {t.charts.emotionCategory}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.emotionCategoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="category" 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {stats.emotions.map((emotion, index) => (
                <Bar 
                  key={emotion.name}
                  dataKey={emotion.name}
                  stackId="a"
                  fill={`var(--emotion-${emotion.name})`}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category-Mood Correlation */}
      <div className="glassmorphic rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">
          {t.charts.categoryMood}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.categoryMoodCorrelation} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                type="number"
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <YAxis 
                type="category"
                dataKey="category"
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="positiveRatio" name="Θετική διάθεση" fill="#4ade80" />
              <Bar dataKey="negativeRatio" name="Αρνητική διάθεση" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Original charts can follow here */}
      {/* ... */}

    </div>
  );
};

export default Progress;
