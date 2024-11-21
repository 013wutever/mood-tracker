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
        <div className="glassmorphic p-3 rounded-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm">{`${Math.round(payload[0].value)}%`}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white"
        textAnchor="middle" 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom legend renderer for better translations
  const CustomLegend = ({ payload }) => {
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <li key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  const t = (path) => getTranslation(language, path);

  useEffect(() => {
    fetchStats();
  }, [timeFilter, userEmail]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const entries = await googleSheetsService.getUserEntries(userEmail, timeFilter);
      
      if (entries.success) {
        const processedStats = {
          totalEntries: entries.data.length,
          weeklyCompletion: calculateWeeklyCompletion(entries.data),
          moodDistribution: calculateMoodDistribution(entries.data),
          categoryBreakdown: calculateCategoryBreakdown(entries.data),
          emotions: calculateEmotionsStats(entries.data),
          timeOfDay: calculateTimeOfDayStats(entries.data),
          emotionsByCategory: calculateEmotionsByCategory(entries.data),
          negativeByCategory: calculateNegativeByCategory(entries.data),
          monthlyEntries: calculateMonthlyEntries(entries.data),
          positiveVsNegative: calculatePositiveVsNegative(entries.data)
        };
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

  const calculateWeeklyCompletion = (entries) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekEntries = entries.filter(entry => new Date(entry[0]) >= oneWeekAgo);
    return Math.round((weekEntries.length / 7) * 100);
  };

  const calculateMoodDistribution = (entries) => {
    const moodCounts = entries.reduce((acc, entry) => {
      const mood = entry[3];
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    const total = entries.length;
    return Object.entries(moodCounts).map(([mood, count]) => ({
      id: mood,
      name: t(`moodEntry.moods.${mood}`),
      value: Math.round((count / total) * 100)
    }));
  };

  const calculateCategoryBreakdown = (entries) => {
    const categoryCounts = entries.reduce((acc, entry) => {
      const category = entry[2];
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const total = entries.length;
    return Object.entries(categoryCounts).map(([category, count]) => ({
      id: category,
      name: t(`moodEntry.categories.${category}`),
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
      value: Math.round((count / total) * 100),
      type: getEmotionType(emotion)
    }));
  };
  // Add these functions after calculateEmotionsStats
  const getEmotionType = (emotion) => {
    if (emotionTypes.positive.includes(emotion)) return 'positive';
    if (emotionTypes.negative.includes(emotion)) return 'negative';
    return 'neutral';
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

  const calculateTimeOfDayStats = (entries) => {
    const timeSlots = {
      morning: { id: 'morning', name: t('progress.timeOfDay.morning'), value: 0 },
      noon: { id: 'noon', name: t('progress.timeOfDay.noon'), value: 0 },
      afternoon: { id: 'afternoon', name: t('progress.timeOfDay.afternoon'), value: 0 },
      evening: { id: 'evening', name: t('progress.timeOfDay.evening'), value: 0 }
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
      { id: 'positive', name: t('progress.charts.positiveEmotions'), value: Math.round((emotionCounts.positive / total) * 100) },
      { id: 'negative', name: t('progress.charts.negativeEmotions'), value: Math.round((emotionCounts.negative / total) * 100) }
    ];
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

 // ... previous code remains the same ...

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
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-white/70">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 glassmorphic rounded-xl hover:bg-white/20"
        >
          {t('states.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with filters */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-2xl font-semibold">
          {t('progress.title')}
        </h1>
        
        <div className="flex gap-2">
          <div className="flex rounded-xl overflow-hidden glassmorphic">
            {Object.entries(t('progress.filters')).map(([key, value]) => (
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

      {/* Quick stats cards with margin bottom for separation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glassmorphic rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-300" />
            <h3 className="text-lg">{t('progress.stats.totalEntries')}</h3>
          </div>
          <p className="text-3xl font-semibold">{stats.totalEntries}</p>
        </div>

        <div className="glassmorphic rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-green-300" />
            <h3 className="text-lg">{t('progress.stats.weeklyCompletion')}</h3>
          </div>
          <p className="text-3xl font-semibold">{stats.weeklyCompletion}%</p>
        </div>

        <div className="glassmorphic rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-5 h-5 text-pink-300" />
            <h3 className="text-lg">{t('progress.stats.positivityRatio')}</h3>
          </div>
          <p className="text-3xl font-semibold">
            {stats.positiveVsNegative[0]?.value || 0}%
          </p>
        </div>
      </div>

      {/* Main charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Emotions Chart */}
        <div className="glassmorphic rounded-xl p-6">
          <h3 className="text-xl mb-6">{t('progress.charts.emotions')}</h3>
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
                >
                  {stats.emotions.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={`var(--emotion-${entry.id})`}
                    />
                  ))}
                </Pie>
                <Legend 
                  content={<CustomLegend />}
                  verticalAlign="bottom"
                />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="glassmorphic rounded-xl p-6">
          <h3 className="text-xl mb-6">{t('progress.charts.mood')}</h3>
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
                    <Cell 
                      key={`cell-${index}`}
                      fill={moodColors[entry.id]}
                    />
                  ))}
                </Pie>
                <Legend 
                  content={<CustomLegend />}
                  verticalAlign="bottom"
                />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time of Day */}
        <div className="glassmorphic rounded-xl p-6">
          <h3 className="text-xl mb-6">{t('progress.charts.timeOfDay')}</h3>
          <div className="aspect-square">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.timeOfDay}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                >
                  {stats.timeOfDay.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={timeColors[entry.id]}
                    />
                  ))}
                </Pie>
                <Legend 
                  content={<CustomLegend />}
                  verticalAlign="bottom"
                />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glassmorphic rounded-xl p-6">
          <h3 className="text-xl mb-6">{t('progress.charts.category')}</h3>
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
                    <Cell 
                      key={`cell-${index}`}
                      fill={categoryColors[entry.id]}
                    />
                  ))}
                </Pie>
                <Legend 
                  content={<CustomLegend />}
                  verticalAlign="bottom"
                />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Positive vs Negative Emotions */}
        <div className="glassmorphic rounded-xl p-6">
          <h3 className="text-xl mb-6">{t('progress.charts.positiveVsNegative')}</h3>
          <div className="aspect-square">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.positiveVsNegative}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {stats.positiveVsNegative.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={sentimentColors[entry.id]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Negativity by Category */}
        <div className="glassmorphic rounded-xl p-6">
          <h3 className="text-xl mb-6">{t('progress.charts.negativeByCategory')}</h3>
          <div className="aspect-square">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.negativeByCategory}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {stats.negativeByCategory.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={categoryColors[entry.id]}
                      opacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Entries at the bottom */}
      <div className="glassmorphic rounded-xl p-6 mt-8">
        <h3 className="text-xl mb-6">{t('progress.charts.monthlyEntries')}</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.monthlyEntries}>
              <XAxis dataKey="name" />
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
