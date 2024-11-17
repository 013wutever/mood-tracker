import React, { useState } from 'react';
import { 
  Calendar,
  Filter,
  Download,
  PieChart,
  BarChart,
  Activity,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';

const Progress = ({ language = 'el' }) => {
  const [timeFilter, setTimeFilter] = useState('week'); // week, month, year, all

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
      download: 'Λήψη αναφοράς'
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
      download: 'Download report'
    }
  };

  // Dummy data - θα αντικατασταθεί με πραγματικά δεδομένα από το Google Sheets
  const stats = {
    totalEntries: 42,
    weeklyCompletion: 85,
    averageMood: 'Θετική',
    streak: 7
  };

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
          
          <button className="glassmorphic p-2 rounded-xl hover:bg-white/20">
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
        {Object.entries(translations[language].charts).map(([key, value]) => (
          <div key={key} className="glassmorphic rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">{value}</h3>
            <div className="aspect-square flex items-center justify-center text-white/30">
              {key === 'moodDistribution' && <PieChart className="w-16 h-16" />}
              {key === 'categoryBreakdown' && <PieChart className="w-16 h-16" />}
              {key === 'weeklyTrend' && <Activity className="w-16 h-16" />}
              {key === 'timeOfDay' && <Clock className="w-16 h-16" />}
            </div>
          </div>
        ))}
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
