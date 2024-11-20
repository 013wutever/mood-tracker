const googleSheetsService = {
  async addMoodEntry({ userEmail, category, moodEmoji, emotions, notes }) {
    try {
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
      return result;
    } catch (error) {
      console.error('Error adding mood entry:', error);
      return { success: false, error: error.message };
    }
  },

  async getEntries(userEmail, timeRange = null) {
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getEntries',
          data: {
            userEmail,
            timeRange
          }
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting entries:', error);
      return { success: false, error: error.message };
    }
  },

  async verifyUser(email, hashedPassword) {
    try {
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
      return result;
    } catch (error) {
      console.error('Error verifying user:', error);
      return { success: false, error: error.message };
    }
  },

  async addUser(email, hashedPassword) {
    try {
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
      return result;
    } catch (error) {
      console.error('Error adding user:', error);
      return { success: false, error: error.message };
    }
  },

  // Νέα μέθοδος για την ανάκτηση των καταχωρήσεων για το ημερολόγιο
  async getCalendarEntries(userEmail, startDate, endDate) {
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getEntries',
          data: {
            userEmail,
            timeRange: {
              start: startDate,
              end: endDate
            }
          }
        })
      });

      const result = await response.json();
      
      // Μορφοποίηση των δεδομένων για το ημερολόγιο
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data.map(entry => ({
            id: entry[6], // MT-timestamp-random
            date: entry[0], // timestamp
            mood: entry[3], // moodEmoji
            emotions: entry[4].split(','), // emotions array
            notes: entry[5], // notes
            category: entry[2] // category
          }))
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error getting calendar entries:', error);
      return { success: false, error: error.message };
    }
  },

  // Νέα μέθοδος για την ανάκτηση στατιστικών
  async getUserStats(userEmail, timeFilter = 'week') {
    try {
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

      const result = await response.json();
      
      if (result.success && result.data) {
        // Υπολογισμός στατιστικών από τα δεδομένα
        const entries = result.data;
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        // Υπολογισμός βασικών στατιστικών
        const stats = {
          totalEntries: entries.length,
          weeklyCompletion: calculateWeeklyCompletion(entries, startOfWeek),
          moodDistribution: calculateMoodDistribution(entries),
          categoryBreakdown: calculateCategoryBreakdown(entries),
          emotions: calculateEmotionsStats(entries),
          timeOfDay: calculateTimeOfDayStats(entries),
          positivityRatio: calculatePositivityRatio(entries)
        };

        return {
          success: true,
          data: stats
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { success: false, error: error.message };
    }
  }
};

// Βοηθητικές συναρτήσεις για τους υπολογισμούς
function calculateWeeklyCompletion(entries, startOfWeek) {
  const weekEntries = entries.filter(entry => {
    const entryDate = new Date(entry[0]);
    return entryDate >= startOfWeek;
  });
  
  return (weekEntries.length / 7) * 100;
}

function calculateMoodDistribution(entries) {
  const moods = entries.map(entry => entry[3]);
  return calculateDistribution(moods);
}

function calculateCategoryBreakdown(entries) {
  const categories = entries.map(entry => entry[2]);
  return calculateDistribution(categories);
}

function calculateEmotionsStats(entries) {
  const allEmotions = entries.flatMap(entry => entry[4].split(','));
  return calculateDistribution(allEmotions);
}

function calculateTimeOfDayStats(entries) {
  const timeSlots = entries.map(entry => {
    const hour = new Date(entry[0]).getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'night';
  });
  return calculateDistribution(timeSlots);
}

function calculatePositivityRatio(entries) {
  const positiveCount = entries.filter(entry => 
    ['positive', 'very-positive'].includes(entry[3])
  ).length;
  
  return (positiveCount / entries.length) * 100;
}

function calculateDistribution(items) {
  const distribution = items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

  const total = items.length;
  return Object.entries(distribution).map(([name, count]) => ({
    name,
    value: (count / total) * 100
  }));
}

export default googleSheetsService;
