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
  TrendingUp,
  TrendingDown
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
  Bar,
  Area,
  AreaChart
} from 'recharts';

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
    monthlyEntries: [],
    positiveSentiment: 0,
    negativeSentiment: 0,
    sentimentByCategory: [],
    negativeEntriesByCategory: []
  });

  // Κατηγοριοποίηση συναισθημάτων
  const emotionCategories = {
    positive: [
      'χαρά', 'ενθουσιασμός', 'αγάπη', 'ηρεμία', 
      'ικανοποίηση', 'ανακούφιση', 'περηφάνια', 
      'ευγνωμοσύνη', 'ελπίδα'
    ],
    negative: [
      'άγχος', 'φόβος', 'θυμός', 'λύπη', 
      'απογοήτευση', 'ζήλια', 'ντροπή', 
      'ενοχή', 'σύγχυση'
    ]
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
        totalEntries: 'Συνολικές Καταχωρήσεις',
        weeklyCompletion: 'Ολοκλήρωση Εβδομάδας',
        positiveSentiment: 'Θετικό Συναίσθημα',
        negativeSentiment: 'Αρνητικό Συναίσθημα'
      },
      charts: {
        emotions: 'Συναισθήματα',
        mood: 'Διάθεση',
        category: 'Κατηγορία',
        timeOfDay: 'Ώρα Ημέρας',
        monthlyEntries: 'Καταχωρήσεις ανά Μήνα',
        sentimentByCategory: 'Θετικότητα/Αρνητικότητα ανά Κατηγορία',
        negativeByCategory: 'Αρνητικότητα ανά Κατηγορία'
      },
      timeOfDay: {
        morning: 'Πρωί',
        noon: 'Μεσημέρι',
        afternoon: 'Απόγευμα',
        evening: 'Βράδυ'
      },
      moodLabels: {
        'very-positive': 'Πολύ Θετική',
        'positive': 'Θετική',
        'neutral': 'Ουδέτερη',
        'negative': 'Αρνητική',
        'very-negative': 'Πολύ Αρνητική'
      },
      loading: 'Φόρτωση...',
      error: 'Σφάλμα φόρτωσης δεδομένων',
      retry: 'Δοκιμάστε ξανά',
      percentage: 'Ποσοστό'
    },
    en: {
      title: 'Statistics & Progress',
      filters: {
        week: 'Week',
        month: 'Month',
        year: 'Year',
        all: 'All'
      },
      stats: {
        totalEntries: 'Total Entries',
        weeklyCompletion: 'Weekly Completion',
        positiveSentiment: 'Positive Sentiment',
        negativeSentiment: 'Negative Sentiment'
      },
      charts: {
        emotions: 'Emotions',
        mood: 'Mood',
        category: 'Category',
        timeOfDay: 'Time of Day',
        monthlyEntries: 'Monthly Entries',
        sentimentByCategory: 'Sentiment by Category',
        negativeByCategory: 'Negative by Category'
      },
      timeOfDay: {
        morning: 'Morning',
        noon: 'Noon',
        afternoon: 'Afternoon',
        evening: 'Evening'
      },
      moodLabels: {
        'very-positive': 'Very Positive',
        'positive': 'Positive',
        'neutral': 'Neutral',
        'negative': 'Negative',
        'very-negative': 'Very Negative'
      },
      loading: 'Loading...',
      error: 'Error loading data',
      retry: 'Try again',
      percentage: 'Percentage'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (userEmail) {
      fetchData();
    }
  }, [userEmail, timeFilter]);

  const fetchData = async () => {
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
      console.log('API Response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      const entries = result.data.map(entry => ({
        timestamp: entry[0],
        userEmail: entry[1],
        category: entry[2],
        mood: entry[3],
        emotions: entry[4].split(',').map(e => e.trim()),
        notes: entry[5],
        id: entry[6]
      }));

      const calculatedStats = calculateStats(entries);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (entries) => {
    if (!entries.length) {
      return {
        totalEntries: 0,
        weeklyCompletion: 0,
        moodDistribution: [],
        categoryBreakdown: [],
        emotions: [],
        timeOfDay: [],
        monthlyEntries: [],
        positiveSentiment: 0,
        negativeSentiment: 0,
        sentimentByCategory: [],
        negativeEntriesByCategory: []
      };
    }

    // Weekly completion
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEntries = entries.filter(entry => new Date(entry.timestamp) >= weekStart);
    const weeklyCompletion = Math.round((weekEntries.length / 7) * 100);

    // Mood distribution
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
      name: t.moodLabels[mood],
      value: Math.round((count / entries.length) * 100)
    }));

    // Category breakdown
    const categoryCounts = entries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    }, {});

    const categoryBreakdown = Object.entries(categoryCounts).map(([category, count]) => ({
      name: category,
      value: Math.round((count / entries.length) * 100)
    }));

    // Emotions breakdown
    const allEmotions = entries.flatMap(entry => entry.emotions);
    const emotionCounts = allEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});

    const emotions = Object.entries(emotionCounts).map(([emotion, count]) => ({
      name: emotion,
      value: Math.round((count / allEmotions.length) * 100)
    }));

    // Time of day
    const timeSlots = entries.map(entry => {
      const hour = new Date(entry.timestamp).getHours();
      if (hour < 12) return 'morning';
      if (hour < 14) return 'noon';
      if (hour < 20) return 'afternoon';
      return 'evening';
    });

    const timeOfDayCounts = timeSlots.reduce((acc, time) => {
      acc[time] = (acc[time] || 0) + 1;
      return acc;
    }, {});

    const timeOfDay = Object.entries(timeOfDayCounts).map(([time, count]) => ({
      name: t.timeOfDay[time],
      value: Math.round((count / timeSlots.length) * 100)
    }));

    // Monthly entries
    const monthlyData = entries.reduce((acc, entry) => {
      const date = new Date(entry.timestamp);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});

    const monthlyEntries = Object.entries(monthlyData)
      .map(([month, count]) => ({
        month,
        count
      }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/').map(Number);
        const [bMonth, bYear] = b.month.split('/').map(Number);
        return aYear === bYear ? aMonth - bMonth : aYear - bYear;
      });

    // Sentiment analysis
    const positiveSentiment = entries.reduce((acc, entry) => {
      const positiveEmotions = entry.emotions.filter(e => 
        emotionCategories.positive.includes(e)
      ).length;
      return acc + positiveEmotions;
    }, 0);

    const negativeSentiment = entries.reduce((acc, entry) => {
      const negativeEmotions = entry.emotions.filter(e => 
        emotionCategories.negative.includes(e)
      ).length;
      return acc + negativeEmotions;
    }, 0);

    const totalSentiments = positiveSentiment + negativeSentiment;
    
    // Sentiment by category
    const sentimentByCategory = Object.entries(categoryCounts).map(([category, total]) => {
      const categoryEntries = entries.filter(e => e.category === category);
      const positive = categoryEntries.reduce((acc, entry) => {
        return acc + entry.emotions.filter(e => 
          emotionCategories.positive.includes(e)
        ).length;
      }, 0);
      
      const negative = categoryEntries.reduce((acc, entry) => {
        return acc + entry.emotions.filter(e => 
          emotionCategories.negative.includes(e)
        ).length;
      }, 0);

      return {
        category,
        positive: Math.round((positive / (positive + negative)) * 100) || 0,
        negative: Math.round((negative / (positive + negative)) * 100) || 0
      };
    });

    // Negative entries by category
    const negativeEntriesByCategory = Object.entries(categoryCounts).map(([category, total]) => {
      const categoryEntries = entries.filter(e => e.category === category);
      const negativeCount = categoryEntries.filter(entry => 
        entry.emotions.some(e => emotionCategories.negative.includes(e))
      ).length;

      return {
        category,
        value: Math.round((negativeCount / categoryEntries.length) * 100)
      };
    });

    return {
      totalEntries: entries.length,
      weeklyCompletion,
      moodDistribution,
      categoryBreakdown,
      emotions,
      timeOfDay,
      monthlyEntries,
      positiveSentiment: Math.round((positiveSentiment / totalSentiments) * 100) || 0,
      negativeSentiment: Math.round((negativeSentiment / totalSentiments) * 100) || 0,
      sentimentByCategory,
      negativeEntriesByCategory
    };
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glassmorphic p-3 rounded-lg">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm">
              {item.name}: {Math.round(item.value)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getEmotionColor = (emotion) => {
    return `var(--emotion-${emotion})`;
  };

  const getCategoryColor = (category) => {
    return `var(--category-${category.toLowerCase()})`;
  };

  const getMoodColor = (mood) => {
    return `var(--mood-${mood})`;
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
          onClick={fetchData}
          className="px-4 py-2 glassmorphic rounded-xl hover:bg-white/20"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 mobile-content">
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

      <div className="mobile-grid">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              {t.stats.positiveSentiment}
            </div>
            <div className="text-2xl font-semibold text-green-300">
              {stats.positiveSentiment}%
            </div>
          </div>
          <div className="glassmorphic rounded-xl p-4">
            <div className="text-sm text-white/70 mb-2">
              {t.stats.negativeSentiment}
            </div>
            <div className="text-2xl font-semibold text-orange-300">
              {stats.negativeSentiment}%
            </div>
          </div>
        </div>

        {/* Monthly Entries Chart */}
        <div className="glassmorphic rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">
            {t.charts.monthlyEntries}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyEntries}>
                <defs>
                  <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(255,255,255,0.3)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="rgba(255,255,255,0.1)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.7)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="rgba(255,255,255,0.8)" 
                  fillOpacity={1}
                  fill="url(#monthlyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Grid */}
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
                    label={({ name, value }) => `${name} (${value}%)`}
                  >
                    {stats.emotions.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getEmotionColor(entry.name)}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="glassmorphic rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">
              {t.charts.mood}
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
                    label={({ name, value }) => `${name} (${value}%)`}
                  >
                    {stats.moodDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getMoodColor(entry.name.toLowerCase().replace(' ', '-'))}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
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
                    label={({ name, value }) => `${name} (${value}%)`}
                  >
                    {stats.categoryBreakdown.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getCategoryColor(entry.name)}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Time of Day */}
          <div className="glassmorphic rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">
              {t.charts.timeOfDay}
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
                    label={({ name, value }) => `${name} (${value}%)`}
                  >
                    {stats.timeOfDay.map((entry, index) => {
                      const timeKey = Object.entries(t.timeOfDay)
                        .find(([_, value]) => value === entry.name)?.[0];
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`var(--time-${timeKey})`}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sentiment by Category */}
          <div className="glassmorphic rounded-xl p-6 col-span-2">
            <h3 className="text-lg font-medium mb-4">
              {t.charts.sentimentByCategory}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.sentimentByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <YAxis 
                    dataKey="category" 
                    type="category"
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="positive" stackId="a" fill="var(--sentiment-positive)" />
                  <Bar dataKey="negative" stackId="a" fill="var(--sentiment-negative)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Negative by Category */}
          <div className="glassmorphic rounded-xl p-6 col-span-2">
            <h3 className="text-lg font-medium mb-4">
              {t.charts.negativeByCategory}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.negativeEntriesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="category"
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="var(--sentiment-negative)"
                    label={({ value }) => `${value}%`}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
