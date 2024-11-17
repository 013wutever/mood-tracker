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

  async getUserStats(userEmail) {
    const entries = await this.getUserEntries(userEmail);
    
    return {
      totalEntries: entries.length,
      weeklyCompletion: this.calculateWeeklyCompletion(entries),
      moodDistribution: this.calculateMoodDistribution(entries),
      categoryBreakdown: this.calculateCategoryBreakdown(entries),
      streak: this.calculateStreak(entries)
    };
  }

  // Helper methods remain the same
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
      acc[entry[3]] = (acc[entry[3]] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value
    }));
  }

  calculateCategoryBreakdown(entries) {
    const breakdown = entries.reduce((acc, entry) => {
      acc[entry[2]] = (acc[entry[2]] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(breakdown).map(([name, value]) => ({
      name,
      value
    }));
  }

  calculateStreak(entries) {
    if (!entries.length) return 0;

    entries.sort((a, b) => new Date(b[0]) - new Date(a[0]));
    
    let streak = 1;
    let currentDate = new Date(entries[0][0]);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < entries.length; i++) {
      const entryDate = new Date(entries[i][0]);
      entryDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((currentDate - entryDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }

    return streak;
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
