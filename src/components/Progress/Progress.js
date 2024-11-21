import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line,
  PieChart, 
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { 
  Loader,
  XCircle,
  Calendar,
  Activity,
  Heart,
  TrendingUp
} from 'lucide-react';
import { getTranslation, emotionTypes } from '../../utils/translations';
import googleSheetsService from '../../services/googleSheets';

const Progress = ({ language = 'el', userEmail }) => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [stats, setStats] = useState({
    totalEntries: 0,
    weeklyCompletion: 0,
    moodDistribution: [],
    categoryBreakdown: [],
    emotions: [],
    timeOfDay: [],
    emotionsByCategory: [],
    negativeByCategory: [],
    monthlyEntries: [],
    positiveVsNegative: []
  });

  const t = (path) => getTranslation(language, path);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Chart color schemes with pastel colors
  const moodColors = {
    'very-positive': 'var(--mood-very-positive)',
    'positive': 'var(--mood-positive)',
    'neutral': 'var(--mood-neutral)',
    'negative': 'var(--mood-negative)',
    'very-negative': 'var(--mood-very-negative)'
  };

  const timeColors = {
    'morning': 'var(--time-morning)',
    'noon': 'var(--time-noon)',
    'afternoon': 'var(--time-afternoon)',
    'evening': 'var(--time-evening)'
  };

  const categoryColors = {
    'personal': 'var(--category-personal)',
    'friends': 'var(--category-friends)',
    'family': 'var(--category-family)',
    'work': 'var(--category-work)',
    'studies': 'var(--category-studies)',
    'health': 'var(--category-health)',
    'finances': 'var(--category-finances)',
    'entertainment': 'var(--category-entertainment)'
  };

  const sentimentColors = {
    positive: 'var(--chart-positive)',
    negative: 'var(--chart-negative)'
  };

  useEffect(() => {
    fetchStats();
  }, [timeFilter, userEmail]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const entries = await googleSheetsService.getUserEntries(userEmail, timeFilter);
      
      if (entries.success) {
        const processedStats = processEntries(entries.data);
        setStats(processedStats);
      } else {
        throw new Error('Failed to fetch entries');
      }
    } catch (err) {
      setError(t('states.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const processEntries = (entries) => {
    return {
      totalEntries: entries.length,
      weeklyCompletion: calculateWeeklyCompletion(entries),
      moodDistribution: calculateMoodDistribution(entries),
      categoryBreakdown: calculateCategoryBreakdown(entries),
      emotions: calculateEmotionsStats(entries),
      timeOfDay: calculateTimeOfDayStats(entries),
      emotionsByCategory: calculateEmotionsByCategory(entries),
      negativeByCategory: calculateNegativeByCategory(entries),
      monthlyEntries: calculateMonthlyEntries(entries),
      positiveVsNegative: calculatePositiveVsNegative(entries)
    };
  };

  // Chart components configuration
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glassmorphic p-3 rounded-lg touch-none">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm">{`${Math.round(payload[0].value)}%`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    if (!payload) return null;
    
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4 px-2">
        {payload.map((entry, index) => (
          <li key={index} className="flex items-center gap-2 touch-manipulation">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className={`text-sm ${isMobile ? 'text-xs' : ''}`}>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  // Helper functions for calculations
  const calculateWeeklyCompletion = (entries) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekEntries = entries.filter(entry => new Date(entry[0]) >= oneWeekAgo);
    return Math.round((weekEntries.length / 7) * 100);
  };

  const calculateMoodDistribution = (entries) => {
    const moodTranslations = {
      'very-positive': language === 'el' ? 'Πολύ Θετικός' : 'Very Positive',
      'positive': language === 'el' ? 'Θετικός' : 'Positive',
      'neutral': language === 'el' ? 'Ουδέτερος' : 'Neutral',
      'negative': language === 'el' ? 'Αρνητικός' : 'Negative',
      'very-negative': language === 'el' ? 'Πολύ Αρνητικός' : 'Very Negative'
    };

    const moodCounts = entries.reduce((acc, entry) => {
      const mood = entry[3];
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    const total = entries.length;
    return Object.entries(moodCounts).map(([mood, count]) => ({
      id: mood,
      name: moodTranslations[mood],
      value: Math.round((count / total) * 100)
    }));
  };

  const calculateCategoryBreakdown = (entries) => {
    const categoryTranslations = {
      'personal': language === 'el' ? 'Προσωπικά' : 'Personal',
      'friends': language === 'el' ? 'Φίλοι' : 'Friends',
      'family': language === 'el' ? 'Οικογένεια' : 'Family',
      'work': language === 'el' ? 'Επαγγελματικά' : 'Work',
      'studies': language === 'el' ? 'Σπουδές' : 'Studies',
      'health': language === 'el' ? 'Υγεία' : 'Health',
      'finances': language === 'el' ? 'Οικονομικά' : 'Finances',
      'entertainment': language === 'el' ? 'Ψυχαγωγία' : 'Entertainment'
    };

    const categoryCounts = entries.reduce((acc, entry) => {
      const category = entry[2];
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const total = entries.length;
    return Object.entries(categoryCounts).map(([category, count]) => ({
      id: category,
      name: categoryTranslations[category],
      value: Math.round((count / total) * 100)
    }));
  };

  const calculateEmotionsStats = (entries) => {
    const emotionCounts = {};
    let total = 0;

    entries.forEach(entry => {
      const emotions = entry[4].split(',').map(e => e.trim());
      emotions.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        total++;
      });
    });

    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      id: emotion,
      name: t(`moodEntry.emotions.${emotion}`),
      value: Math.round((count / total) * 100)
    }));
  };

  const calculateTimeOfDayStats = (entries) => {
    const timeTranslations = {
      morning: language === 'el' ? 'Πρωί' : 'Morning',
      noon: language === 'el' ? 'Μεσημέρι' : 'Noon',
      afternoon: language === 'el' ? 'Απόγευμα' : 'Afternoon',
      evening: language === 'el' ? 'Βράδυ' : 'Evening'
    };

    const timeSlots = {
      morning: { id: 'morning', name: timeTranslations.morning, value: 0 },
      noon: { id: 'noon', name: timeTranslations.noon, value: 0 },
      afternoon: { id: 'afternoon', name: timeTranslations.afternoon, value: 0 },
      evening: { id: 'evening', name: timeTranslations.evening, value: 0 }
    };

    entries.forEach(entry => {
      const hour = new Date(entry[0]).getHours();
      if (hour >= 5 && hour < 12) timeSlots.morning.value++;
      else if (hour >= 12 && hour < 15) timeSlots.noon.value++;
      else if (hour >= 15 && hour < 19) timeSlots.afternoon.value++;
      else timeSlots.evening.value++;
    });

    const total = entries.length;
    return Object.values(timeSlots).map(slot => ({
      ...slot,
      value: Math.round((slot.value / total) * 100)
    }));
  };

  const calculateEmotionsByCategory = (entries) => {
    const categoryEmotions = {};
    
    entries.forEach(entry => {
      const category = entry[2];
      const emotions = entry[4].split(',').map(e => e.trim());
      
      if (!categoryEmotions[category]) {
        categoryEmotions[category] = { positive: 0, negative: 0, total: 0 };
      }
      
      emotions.forEach(emotion => {
        categoryEmotions[category].total++;
        if (emotionTypes.positive.includes(emotion)) {
          categoryEmotions[category].positive++;
        }
        if (emotionTypes.negative.includes(emotion)) {
          categoryEmotions[category].negative++;
        }
      });
    });

    return Object.entries(categoryEmotions).map(([category, counts]) => ({
      id: category,
      name: t(`moodEntry.categories.${category}`),
      value: Math.round((counts.positive / counts.total) * 100)
    }));
  };

  const calculateNegativeByCategory = (entries) => {
    const categoryEmotions = {};
    
    entries.forEach(entry => {
      const category = entry[2];
      const emotions = entry[4].split(',').map(e => e.trim());
      
      if (!categoryEmotions[category]) {
        categoryEmotions[category] = { negative: 0, total: 0 };
      }
      
      emotions.forEach(emotion => {
        categoryEmotions[category].total++;
        if (emotionTypes.negative.includes(emotion)) {
          categoryEmotions[category].negative++;
        }
      });
    });

    return Object.entries(categoryEmotions)
      .map(([category, counts]) => ({
        id: category,
        name: t(`moodEntry.categories.${category}`),
        value: Math.round((counts.negative / counts.total) * 100)
      }))
      .sort((a, b) => b.value - a.value);
  };

  const calculateMonthlyEntries = (entries) => {
    const monthlyData = entries.reduce((acc, entry) => {
      const date = new Date(entry[0]);
      const monthYear = date.toLocaleString(language === 'el' ? 'el-GR' : 'en-US', {
        month: 'short',
        year: '2-digit'
      });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(monthlyData)
      .map(([month, count]) => ({
        name: month,
        value: count
      }))
      .sort((a, b) => new Date(a.name) - new Date(b.name));
  };

  const calculatePositiveVsNegative = (entries) => {
    const emotionCounts = { positive: 0, negative: 0 };
    let total = 0;

    entries.forEach(entry => {
      const emotions = entry[4].split(',').map(e => e.trim());
      emotions.forEach(emotion => {
        if (emotionTypes.positive.includes(emotion)) emotionCounts.positive++;
        if (emotionTypes.negative.includes(emotion)) emotionCounts.negative++;
        total++;
      });
    });

    return [
      { 
        id: 'positive', 
        name: language === 'el' ? 'Θετικά Συναισθήματα' : 'Positive Emotions', 
        value: Math.round((emotionCounts.positive / total) * 100) 
      },
      { 
        id: 'negative', 
        name: language === 'el' ? 'Αρνητικά Συναισθήματα' : 'Negative Emotions', 
        value: Math.round((emotionCounts.negative / total) * 100) 
      }
    ];
  };

  // Mobile-optimized chart wrapper
  const MobileResponsiveChart = ({ children, height = 300 }) => (
    <div className={`w-full ${isMobile ? `h-[${height}px]` : 'aspect-square'}`}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader className="w-8 h-8 animate-spin text-white/50" />
        <p className="text-white/70">{t('states.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <XCircle className="w-12 h-12 text-red-400" /><p className="text-white/70">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 glassmorphic rounded-xl hover:bg-white/20 touch-manipulation"
        >
          {t('states.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header with filters */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold">
          {t('progress.title')}
        </h1>
        
        <div className="flex gap-2 touch-manipulation">
          <div className="flex rounded-xl overflow-hidden glassmorphic">
            {Object.entries(t('progress.filters')).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setTimeFilter(key)}
                className={`px-3 py-2 text-sm transition-colors touch-manipulation min-h-[44px]
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

      {/* Quick stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        <div className="glassmorphic rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-300" />
            <h3 className="text-base md:text-lg">{t('progress.stats.totalEntries')}</h3>
          </div>
          <p className="text-2xl md:text-3xl font-semibold">{stats.totalEntries}</p>
        </div>

        <div className="glassmorphic rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-green-300" />
            <h3 className="text-base md:text-lg">{t('progress.stats.weeklyCompletion')}</h3>
          </div>
          <p className="text-2xl md:text-3xl font-semibold">{stats.weeklyCompletion}%</p>
        </div>

        <div className="glassmorphic rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-5 h-5 text-pink-300" />
            <h3 className="text-base md:text-lg">{t('progress.stats.positivityRatio')}</h3>
          </div>
          <p className="text-2xl md:text-3xl font-semibold">
            {stats.positiveVsNegative[0]?.value || 0}%
          </p>
        </div>
      </div>

      {/* Main charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Charts */}
        {[
          {
            title: 'emotions',
            data: stats.emotions,
            colors: entry => `var(--emotion-${entry.id})`,
            type: 'pie'
          },
          {
            title: 'mood',
            data: stats.moodDistribution,
            colors: entry => moodColors[entry.id],
            type: 'pie'
          },
          {
            title: 'timeOfDay',
            data: stats.timeOfDay,
            colors: entry => timeColors[entry.id],
            type: 'pie'
          },
          {
            title: 'category',
            data: stats.categoryBreakdown,
            colors: entry => categoryColors[entry.id],
            type: 'pie'
          },
          {
            title: 'positiveVsNegative',
            data: stats.positiveVsNegative,
            colors: entry => sentimentColors[entry.id],
            type: 'bar'
          },
          {
            title: 'negativeByCategory',
            data: stats.negativeByCategory,
            colors: entry => categoryColors[entry.id],
            type: 'bar'
          }
        ].map((chart, index) => (
          <div key={chart.title} className="glassmorphic rounded-xl p-4 md:p-6">
            <h3 className="text-lg md:text-xl mb-4 md:mb-6">
              {t(`progress.charts.${chart.title}`)}
            </h3>
            <MobileResponsiveChart>
              {chart.type === 'pie' ? (
                <PieChart>
                  <Pie
                    data={chart.data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? "60%" : "70%"}
                  >
                    {chart.data.map((entry, i) => (
                      <Cell 
                        key={`cell-${i}`}
                        fill={chart.colors(entry)}
                      />
                    ))}
                  </Pie>
                  <Legend 
                    content={<CustomLegend />}
                    verticalAlign="bottom"
                  />
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              ) : (
                <BarChart data={chart.data}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    height={60}
                    interval={0}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    radius={[8, 8, 0, 0]}
                  >
                    {chart.data.map((entry, i) => (
                      <Cell 
                        key={`cell-${i}`}
                        fill={chart.colors(entry)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </MobileResponsiveChart>
          </div>
        ))}
      </div>

      {/* Monthly Entries */}
      <div className="glassmorphic rounded-xl p-4 md:p-6 mt-4 md:mt-8">
        <h3 className="text-lg md:text-xl mb-4 md:mb-6">{t('progress.charts.monthlyEntries')}</h3>
        <div className="h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.monthlyEntries}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                height={60}
                interval={isMobile ? 1 : 0}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={timeColors.morning}
                strokeWidth={2}
                dot={{ fill: timeColors.morning, strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Last updated timestamp */}
      <div className="text-center text-sm text-white/50 flex items-center justify-center gap-2">
        <Calendar className="w-4 h-4" />
        {new Date().toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US')}
      </div>
    </div>
  );
};

export default Progress;
