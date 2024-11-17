import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = 'your-spreadsheet-id'; // Θα χρειαστούμε το ID από το URL του spreadsheet σας
const MOOD_DATA_RANGE = 'TrackerData1!A2:G';
const USER_DATA_RANGE = 'UserAccounts!A2:D';

class GoogleSheetsService {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: "mood-tracker-service@mood-tracker-app-441922.iam.gserviceaccount.com",
        client_id: "102400437271083031953",
        project_id: "mood-tracker-app-441922"
        // Θα χρειαστούμε το νέο private_key από το νέο service account
      },
      scopes: SCOPES,
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async addMoodEntry(data) {
    try {
      const row = [
        new Date().toISOString(), // Timestamp
        data.userEmail,
        data.category,
        data.moodEmoji,
        data.emotions.join(','),
        data.notes,
        this.generateUniqueId()
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: MOOD_DATA_RANGE,
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
        spreadsheetId: SPREADSHEET_ID,
        range: MOOD_DATA_RANGE
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
    return entries.reduce((acc, entry) => {
      acc[entry[3]] = (acc[entry[3]] || 0) + 1;
      return acc;
    }, {});
  }

  calculateCategoryBreakdown(entries) {
    return entries.reduce((acc, entry) => {
      acc[entry[2]] = (acc[entry[2]] || 0) + 1;
      return acc;
    }, {});
  }

  calculateStreak(entries) {
    if (!entries.length) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i][0]);
      entryDate.setHours(0, 0, 0, 0);

      if (currentDate.getTime() === entryDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  // User Authentication Methods
  async addUser(email, hashedPassword) {
    try {
      const row = [
        email,
        hashedPassword,
        new Date().toISOString(), // RegisterDate
        new Date().toISOString()  // LastLogin
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: USER_DATA_RANGE,
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

  async verifyUser(email, hashedPassword) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: USER_DATA_RANGE
      });

      const rows = response.data.values || [];
      const user = rows.find(row => row[0] === email && row[1] === hashedPassword);

      if (user) {
        // Update last login
        const userRow = rows.indexOf(user) + 2; // +2 because of header and 0-based index
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
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
}

export default new GoogleSheetsService();
