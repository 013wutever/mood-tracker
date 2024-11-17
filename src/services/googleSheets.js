class GoogleSheetsService {
  async addMoodEntry(data) {
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addEntry',
          data
        })
      });

      const result = await response.json();
      return { success: result.success };
    } catch (error) {
      console.error('Error adding mood entry:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserEntries(userEmail) {
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getEntries',
          data: { userEmail }
        })
      });

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting user entries:', error);
      return [];
    }
  }

  async getUserStats(userEmail, timeFilter = 'week') {
    try {
      const entries = await this.getUserEntries(userEmail);
      if (!entries.length) return this.getEmptyStats();

      const filteredEntries = this.filterEntriesByTime(entries, timeFilter);
      
      return {
        totalEntries: entries.length,
        weeklyCompletion: this.calculateWeeklyCompletion(filteredEntries),
        moodDistribution: this.calculateMoodDistribution(filteredEntries),
        categoryBreakdown: this.calculateCategoryBreakdown(filteredEntries),
        emotions: this.calculateEmotions(filteredEntries),
        timeOfDay: this.calculateTimeOfDay(filteredEntries),
        positivityRatio: this.calculatePositivityRatio(filteredEntries)
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return this.getEmptyStats();
    }
  }

  getEmptyStats() {
    return {
      totalEntries: 0,
      weeklyCompletion: 0,
      moodDistribution: [],
      categoryBreakdown: [],
      emotions: [],
      timeOfDay: [],
      positivityRatio: []
    };
  }

  filterEntriesByTime(entries, timeFilter) {
    const now = new Date();
    const filterDate = new Date();

    switch (timeFilter) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return entries;
    }

    return entries.filter(entry => new Date(entry[0]) >= filterDate);
  }

  calculateWeeklyCompletion(entries) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentEntries = entries.filter(entry => 
      new Date(entry[0]) > oneWeekAgo
    );

    return Math.round((recentEntries.length / 7) * 100);
  }

  calculateMoodDistribution(entries) {
    const distribution = entries.reduce((acc, entry) => {
      const mood = entry[3];
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      originalName: name,
      value: Math.round((value / entries.length) * 100)
    }));
  }

  calculateEmotions(entries) {
    const emotions = entries.reduce((acc, entry) => {
      const entryEmotions = entry[4].split(',');
      entryEmotions.forEach(emotion => {
        acc[emotion] = (acc[emotion] || 0) + 1;
      });
      return acc;
    }, {});

    return Object.entries(emotions).map(([name, value]) => ({
      name,
      value,
      type: this.getEmotionType(name)
    }));
  }

  getEmotionType(emotion) {
    const positiveEmotions = [
      'joy', 'calm', 'gratitude', 'enthusiasm', 'optimism',
      'satisfaction', 'pride', 'love', 'relief', 'serenity'
    ];
    return positiveEmotions.includes(emotion) ? 'positive' : 'negative';
  }

  calculateTimeOfDay(entries) {
    const getTimeCategory = (date) => {
      const hour = new Date(date).getHours();
      if (hour >= 5 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 17) return 'noon';
      if (hour >= 17 && hour < 21) return 'afternoon';
      return 'evening';
    };

    const distribution = entries.reduce((acc, entry) => {
      const timeCategory = getTimeCategory(entry[0]);
      acc[timeCategory] = (acc[timeCategory] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value: Math.round((value / entries.length) * 100)
    }));
  }

  calculatePositivityRatio(entries) {
    const positiveCount = entries.filter(entry => 
      ['very-positive', 'positive'].includes(entry[3])
    ).length;

    const negativeCount = entries.filter(entry => 
      ['very-negative', 'negative'].includes(entry[3])
    ).length;

    const total = entries.length;

    return [
      { name: 'Θετικά', value: Math.round((positiveCount / total) * 100) },
      { name: 'Αρνητικά', value: Math.round((negativeCount / total) * 100) }
    ];
  }

  calculateCategoryBreakdown(entries) {
    const breakdown = entries.reduce((acc, entry) => {
      const category = entry[2];
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(breakdown).map(([id, value]) => ({
      id,
      name: this.getCategoryName(id),
      value: Math.round((value / entries.length) * 100)
    }));
  }

  getCategoryName(id) {
    const categories = {
      personal: 'Προσωπικά',
      friends: 'Φίλοι',
      family: 'Οικογένεια',
      work: 'Επαγγελματικά',
      studies: 'Σπουδές',
      health: 'Υγεία',
      finances: 'Οικονομικά',
      entertainment: 'Ψυχαγωγία'
    };
    return categories[id] || id;
  }

  async verifyUser(email, hashedPassword) {
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verifyUser',
          data: { email, hashedPassword }
        })
      });

      const result = await response.json();
      return { success: result.success };
    } catch (error) {
      console.error('Error verifying user:', error);
      return { success: false, error: error.message };
    }
  }

  async addUser(email, hashedPassword) {
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addUser',
          data: { email, hashedPassword }
        })
      });

      const result = await response.json();
      return { success: result.success };
    } catch (error) {
      console.error('Error adding user:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new GoogleSheetsService();
