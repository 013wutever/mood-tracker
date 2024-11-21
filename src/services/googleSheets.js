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

  async getCalendarEntries(userEmail, timeRange) {
    try {
      console.log('Getting calendar entries for:', userEmail);
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getCalendarEntries',
          data: { 
            userEmail,
            timeRange
          }
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

      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error getting calendar entries:', error);
      return { success: false, error: error.message };
    }
  },

  async getUserEntries(userEmail, timeFilter = 'week') {
    try {
      console.log('Getting user entries:', userEmail, timeFilter);
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Get entries result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch entries');
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error getting entries:', error);
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
      
      return { success: true };
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
      
      return { success: true };
    } catch (error) {
      console.error('Error adding user:', error);
      return { success: false, error: error.message };
    }
  }
};

export default googleSheetsService;
