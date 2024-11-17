import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Filter, 
  Download,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Activity,
  Calendar as CalendarIcon,
  Clock,
  Loader,
  XCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import googleSheetsService from '../../services/googleSheets';

const Progress = ({ language = 'el', userEmail }) => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEntries: 0,
    weeklyCompletion: 0,
    averageMood: '',
    streak: 0,
    moodDistribution: [],
    categoryBreakdown: [],
    weeklyTrend: [],
    timeOfDay: []
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
        averageMood: 'Μέση διάθεση',
        streak: 'Συνεχόμενες μέρες'
      },
      charts: {
        moodDistribution: 'Κατανομή διάθεσης',
        categoryBreakdown: 'Ανάλυση κατηγοριών',
        weeklyTrend: 'Εβδομαδιαία τάση',
        timeOfDay: 'Ώρα καταχώρησης'
      },
      download: 'Λήψη αναφοράς',
      loading: 'Φόρτωση...',
      error: 'Σφάλμα φόρτωσης δεδομένων',
      retry: 'Δοκιμάστε ξανά'
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
        totalEntries: 'Total entries',
        weeklyCompletion: 'Weekly completion',
        averageMood: 'Average mood',
        streak: 'Current streak'
      },
      charts: {
        moodDistribution: 'Mood distribution',
        categoryBreakdown: 'Category breakdown',
        weeklyTrend: 'Weekly trend',
        timeOfDay: 'Time of day'
      },
      download: 'Download report',
      loading: 'Loading...',
      error: 'Error loading data',
      retry: 'Try again'
    }
  };

  const COLORS = {
    'very-positive': '#7FCDCD',
    'positive': '#98FB98',
    'neutral': '#D4E157',
    'negative': '#FFB347',
    'very-negative': '#FF9999',
    personal: '#9C27B0',
    friends: '#4CAF50',
    family: '#2196F3',
    work: '#FF9800',
    studies: '#FFEB3B',
    health: '#E91E63',
    finances: '#9E9E9E',
    entertainment: '#009688'
  };

  useEffect(() => {
    fetchStats();
  }, [timeFilter, userEmail]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await googleSheetsService.getUserStats(userEmail);
      if (data) {
        setStats(data);
      }
    } catch (err) {
      setError(translations[language].error);
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-2xl font-semibold">
          {translations[language].title}
        </h1>
        
        <div className="flex gap-2">
          <div className="flex rounded-xl overflow-hidden">
            {Object.entries(translations[language].filters).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setTimeFilter(key)}
                className={`px-4 py-2 text-sm transition-colors
                  ${timeFilter === key 
                    ? 'bg-white/20' 
                    : 'bg-white/5 hover:bg-white/10'}`}
              >
                {value}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => {/* Download logic */}}
            className="glassmorphic p-2 rounded-xl hover:bg-white/20"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(translations[language].stats).map(([key, value]) => (
          <div key={key} className="glassmorphic rounded-xl p-4">
            <div className="text-sm text-white/70 mb-2">{value}</div>
            <div className="text-2xl font-semibold">
              {stats[key.replace(/([A-Z])/g, '_$1').toLowerCase()]}
              {key === 'weeklyCompletion' && '%'}
              {key === 'streak' && ' μέρες'}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <div className="glassmorphic rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">
            {translations[language].charts.moodDistribution}
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
                >
                  {stats.moodDistribution.map((entry, index) => (
                    <Cell key={index} fill={COLORS[entry.name]} />
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
            {translations[language].charts.categoryBreakdown}
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
                >
                  {stats.categoryBreakdown.map((entry, index) => (
                    <Cell key={index} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="glassmorphic rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">
            {translations[language].charts.weeklyTrend}
          </h3>
          <div className="aspect-square">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
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
              <BarChart data={stats.timeOfDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Last updated */}
      <div className="text-center text-sm text-white/50 flex items-center justify-center gap-2">
        <CalendarIcon className="w-4 h-4" />
        {new Date().toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US')}
      </div>
    </div>
  );
};

export default Progress;
