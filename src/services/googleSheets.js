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
            emotions,
            notes
          }
        })
      });

      const result = await response.json();
      console.log('Add entry result:', result);
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

      const result = await response.json();
      console.log('Get entries result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch entries');
      }

      // Transform the data to the correct format
      const entries = result.data.map(entry => ({
        timestamp: entry[0],
        userEmail: entry[1],
        category: entry[2],
        mood: entry[3],
        emotions: entry[4].split(','),
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
          action: 'getEntries',
          data: {
            userEmail
          }
        })
      });

      const result = await response.json();
      console.log('Calendar entries result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch calendar entries');
      }

      // Transform the data to the correct format
      const entries = result.data.map(entry => ({
        date: new Date(entry[0]),
        userEmail: entry[1],
        category: entry[2],
        mood: entry[3],
        emotions: entry[4].split(','),
        notes: entry[5],
        id: entry[6]
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

      const result = await response.json();
      console.log('Verify user result:', result);
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

      const result = await response.json();
      console.log('Add user result:', result);
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
      
      if (!entries.success) {
        throw new Error(entries.error || 'Failed to fetch stats');
      }

      // Process the entries to calculate stats
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

// Helper functions for stats calculations
function calculateWeeklyCompletion(entries) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const weekEntries = entries.filter(entry => 
    new Date(entry.timestamp) >= startOfWeek
  );
  
  return Math.round((weekEntries.length / 7) * 100);
}

function calculateMoodDistribution(entries) {
  return calculateDistribution(entries.map(e => e.mood));
}

function calculateCategoryBreakdown(entries) {
  return calculateDistribution(entries.map(e => e.category));
}

function calculateEmotionsStats(entries) {
  const allEmotions = entries.flatMap(e => e.emotions);
  return calculateDistribution(allEmotions);
}

function calculateTimeOfDayStats(entries) {
  const timeSlots = entries.map(entry => {
    const hour = new Date(entry.timestamp).getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'night';
  });
  return calculateDistribution(timeSlots);
}

function calculatePositivityRatio(entries) {
  const positiveCount = entries.filter(entry => 
    ['positive', 'very-positive'].includes(entry.mood)
  ).length;
  
  return entries.length > 0 ? Math.round((positiveCount / entries.length) * 100) : 0;
}

function calculateDailyMoodTrend(entries) {
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
    acc[date].push(moodValues[entry.mood]);
    return acc;
  }, {});

  return Object.entries(dailyMoods)
    .map(([date, moods]) => ({
      date,
      value: moods.reduce((sum, mood) => sum + mood, 0) / moods.length
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function calculateDistribution(items) {
  const counts = items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

  const total = items.length;
  return Object.entries(counts).map(([name, count]) => ({
    name,
    value: total > 0 ? Math.round((count / total) * 100) : 0
  }));
}

export default googleSheetsService;
