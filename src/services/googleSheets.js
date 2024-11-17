import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = '1uslJdpA2W1VV5M21oGQcDNp00wJt5KbUh6dqZU3qk0U'; // Θα χρειαστούμε το ID από το URL του spreadsheet σας
const MOOD_DATA_RANGE = 'TrackerData1!A2:G';
const USER_DATA_RANGE = 'UserAccounts!A2:D';

class GoogleSheetsService {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: "mood-tracker-service@mood-tracker-app-441922.iam.gserviceaccount.com",
        client_id: "102400437271083031953",
        project_id: "mood-tracker-app-441922"
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC83JMCXooQDGs0\nw/Walhk6y9l5JGEVI258cryQydbg79mZpvShgoSudsMe4qUAjQ/I+U4ZDlXakuC0\n4ee7dsB1gHKMvLJBlTGATkprS4TUx/3Ri+paQ5oNgg2MazuokWh71IKrsO2XKd8o\nBJv08wyBoB1Se8bh1LmjxAfgxKNlOuUTjkB/rASns1hVLs4MOHuQKQjCRDjmDIvW\nL25Vegn9OGO/UysrLgxGCWxJM6+T2+TXElapguCMsHf4JE36RcWPlEyrhC23nLgr\ne6unyZVaqexiviAgSBuiTzBRJb6B4IXS+CsBI36GH9dc9edoJQtV++cGZibM0h01\nKmUz8VALAgMBAAECggEAT1v2UCgOpqi5Qa5YHVGWH206IFvniXzed9+0mbiemN1g\nV97ea6GPBEp2Ohutjvo3WFFd/kxWSiau0oMcn1rKi3VibP37f3BkIRCE1+ofUlQJ\nNUywOKawbJ2p+Me0hWQ4fdQx5lhNtdfL5CJvsDGTH0L7H0ZQr2N2cDi2wL2QFUA8\nIZ55GxcnNDbXOC5K2ua4w1VTeG027/bj34pkk/I0+4GtWCnLCRMl6dh66IEUjqt4\nC/LlWzNIXpBCN3JFfIeHFOTyxAEIK4aW27eo1vDX9aq8dlHFMwT+X5X6rp1yxZdZ\nTc6MXmVXc6WVtgKdorEX9Rdsjjp/U4/91ekxI5m94QKBgQD8jxGqR8R9AA/eMdLw\naL3ZuX/uUwrHwr/Te3ONx6jVKajP+GaPpHl28Kx/hx0Y0heB3r1CZEUveM3HnSpU\nQVqWM7EJ2COlbWz12j5RA0+1qz/9hUanTg/eEnrHfRgCfchjZbOlLsOyD/8SWZNW\nDuCuECT600C/lOSL4YtOsDCa4QKBgQC/b1PsdR3eDJWSHy4elEUalbGwpIyy6R39\ngjKqfU8zjjXsMYon1BWQlBzMUwTRoZtr4sCFOLfGxFCGKclQ16WQzkfDmsxjdBwF\nGPYHhnw3oXHTARZLlXHeK15PRJTZbHvC8gRa3XjGJRWf+g2qVDxZiLik2wrDyJmR\nvJCI02cUawKBgHQH0sjVcfsvtRqS72NN67MEmzbF5hUCbxjdBaikivdrzUfGym/B\n06AGUGnCjGaj1vLufyrqYDLAIGJN3W2aHOEW3IY2S6Ir1LxayPh1OgCvrZVuzpf8\nsCOJf+j4mrhCS3cG+XKxOm0rFje6+Yq3CRhPCH5H4d5irGFrfJHpNlthAoGAReNo\n6iyfqM9DU8NaXQOYbuozot+QFkkRD9oWkTOKVLIYcZBsdbnx3YSVNusgGUA8s5hm\n3LwmK8TD+RcMTh1Mbp9Ah+Ldt3lOOXYxa/HnK5AfM/9zmkiG96sxlRLenLoEPNmK\nSXoNe5lSWcM6dfKmzbEiZ90oAu4bUp9azPkQ6t0CgYBlp868YLOobaPVbkw7HSuj\nTEqWJg8T/UNGBhlxyctwgh0GkhaUe03SveBiPULee7pY+1SAiNdE9idwwFm/Uuz6\n+0oRWiH8Yfrxh/6f3cGQjPydSQyTxVimc4Xolf5G8ZByX2Q4hXZVGKdxVTrGItZI\nA60zJtW7rTCza9roBiGK+Q==\n-----END PRIVATE KEY-----\n"
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
