import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

class GoogleSheetsService {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        project_id: "mood-tracker-app-441922"
      },
      scopes: SCOPES,
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.spreadsheetId = process.env.REACT_APP_GOOGLE_SHEETS_ID;
  }

  async addMoodEntry(data) {
    try {
      const row = [
        new Date().toISOString(),
        data.userEmail,
        data.category,
        data.moodEmoji,
        data.emotions.join(','),
        data.notes,
        this.generateUniqueId()
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'TrackerData1!A2:G',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [row]
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding mood entry:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserEntries(userEmail) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'TrackerData1!A2:G'
      });

      const rows = response.data.values || [];
      return rows.filter(row => row[1] === userEmail);
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

  // Helper methods
  generateUniqueId() {
    return `MT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'UserAccounts!A2:D'
      });

      const rows = response.data.values || [];
      const user = rows.find(row => row[0] === email && row[1] === hashedPassword);

      if (user) {
        const userRow = rows.indexOf(user) + 2;
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `UserAccounts!D${userRow}`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[new Date().toISOString()]]
          }
        });

        return { success: true };
      }

      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Error verifying user:', error);
      return { success: false, error: error.message };
    }
  }

  async addUser(email, hashedPassword) {
    try {
      const row = [
        email,
        hashedPassword,
        new Date().toISOString(),
        new Date().toISOString()
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'UserAccounts!A2:D',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [row]
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding user:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new GoogleSheetsService();
