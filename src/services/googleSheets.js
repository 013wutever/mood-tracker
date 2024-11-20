// src/services/googleSheets.js

const googleSheetsService = {
  async addMoodEntry({ userEmail, category, moodEmoji, emotions, notes }) {
    try {
      console.log('Adding mood entry:', { userEmail, category, moodEmoji, emotions, notes });
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addEntry',
          data: {
            userEmail,
            category,
            moodEmoji,
            emotions: Array.isArray(emotions) ? emotions : emotions.split(','),
            notes: notes || ''
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Add entry result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add entry');
      }
      
      return result;
    } catch (error) {
      console.error('Error adding mood entry:', error);
      return { success: false, error: error.message };
    }
  },

  async getEntries(userEmail, options = {}) {
    try {
      console.log('Getting entries for:', userEmail, options);
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getEntries',
          data: {
            userEmail,
            ...options
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Get entries result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch entries');
      }

      // Transform the data
      const entries = result.data.map(entry => ({
        timestamp: entry[0],
        userEmail: entry[1],
        category: entry[2],
        mood: entry[3],
        emotions: entry[4].split(',').map(e => e.trim()),
        notes: entry[5],
        id: entry[6]
      }));

      return { success: true, data: entries };
    } catch (error) {
      console.error('Error getting entries:', error);
      return { success: false, error: error.message };
    }
  },

  async getCalendarEntries(userEmail) {
    try {
      console.log('Getting calendar entries for:', userEmail);
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getCalendarEntries',
          data: { userEmail }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Calendar entries result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch calendar entries');
      }

      // Transform the data
      const entries = result.data.map(entry => ({
        id: entry[6],
        date: new Date(entry[0]),
        userEmail: entry[1],
        category: entry[2],
        mood: entry[3],
        emotions: entry[4].split(',').map(e => e.trim()),
        notes: entry[5]
      }));

      return { success: true, data: entries };
    } catch (error) {
      console.error('Error getting calendar entries:', error);
      return { success: false, error: error.message };
    }
  },

  async verifyUser(email, hashedPassword) {
    try {
      console.log('Verifying user:', email);
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verifyUser',
          data: {
            email,
            hashedPassword
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Verify user result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Invalid credentials');
      }
      
      return result;
    } catch (error) {
      console.error('Error verifying user:', error);
      return { success: false, error: error.message };
    }
  },

  async addUser(email, hashedPassword) {
    try {
      console.log('Adding user:', email);
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addUser',
          data: {
            email,
            hashedPassword
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Add user result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add user');
      }
      
      return result;
    } catch (error) {
      console.error('Error adding user:', error);
      return { success: false, error: error.message };
    }
  },

  async getUserStats(userEmail, timeFilter = 'week') {
    try {
      console.log('Getting user stats:', userEmail, timeFilter);
      const entries = await this.getEntries(userEmail, { timeFilter });
      
      if (!entries.success || !entries.data) {
        throw new Error('Failed to fetch entries for stats');
      }

      // Calculate stats from entries
      const data = entries.data;
      const stats = {
        totalEntries: data.length,
        weeklyCompletion: calculateWeeklyCompletion(data),
        moodDistribution: calculateMoodDistribution(data),
        categoryBreakdown: calculateCategoryBreakdown(data),
        emotions: calculateEmotionsStats(data),
        timeOfDay: calculateTimeOfDayStats(data),
        positivityRatio: calculatePositivityRatio(data),
        dailyMoodTrend: calculateDailyMoodTrend(data)
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { success: false, error: error.message };
    }
  }
};

// Helper functions for calculations
function calculateWeeklyCompletion(entries) {
  if (!entries.length) return 0;
  
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const weekEntries = entries.filter(entry => 
    new Date(entry.timestamp) >= startOfWeek
  );
  
  return Math.round((weekEntries.length / 7) * 100);
}

function calculateMoodDistribution(entries) {
  if (!entries.length) return [];
  
  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(moodCounts).map(([name, count]) => ({
    name,
    value: Math.round((count / entries.length) * 100)
  }));
}

function calculateCategoryBreakdown(entries) {
  if (!entries.length) return [];
  
  const categoryCounts = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    value: Math.round((count / entries.length) * 100)
  }));
}

function calculateEmotionsStats(entries) {
  if (!entries.length) return [];
  
  const allEmotions = entries.flatMap(entry => entry.emotions);
  const emotionCounts = allEmotions.reduce((acc, emotion) => {
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(emotionCounts).map(([name, count]) => ({
    name,
    value: Math.round((count / allEmotions.length) * 100)
  }));
}

function calculateTimeOfDayStats(entries) {
  if (!entries.length) return [];
  
  const timeSlots = entries.map(entry => {
    const hour = new Date(entry.timestamp).getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'night';
  });

  const timeCounts = timeSlots.reduce((acc, time) => {
    acc[time] = (acc[time] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(timeCounts).map(([name, count]) => ({
    name,
    value: Math.round((count / timeSlots.length) * 100)
  }));
}

function calculatePositivityRatio(entries) {
  if (!entries.length) return 0;
  
  const positiveCount = entries.filter(entry => 
    ['positive', 'very-positive'].includes(entry.mood)
  ).length;
  
  return Math.round((positiveCount / entries.length) * 100);
}

function calculateDailyMoodTrend(entries) {
  if (!entries.length) return [];
  
  const moodValues = {
    'very-negative': 1,
    'negative': 2,
    'neutral': 3,
    'positive': 4,
    'very-positive': 5
  };

  const dailyMoods = entries.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(moodValues[entry.mood] || 3);
    return acc;
  }, {});

  return Object.entries(dailyMoods)
    .map(([date, moods]) => ({
      date,
      value: moods.reduce((sum, mood) => sum + mood, 0) / moods.length
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

export default googleSheetsService;
