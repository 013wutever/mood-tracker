import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        project_id: "mood-tracker-app-441922"
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const { action, data } = req.body;

    switch (action) {
      case 'addEntry': {
        const response = await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'TrackerData1!A2:G',
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[
              new Date().toISOString(),
              data.userEmail,
              data.category,
              data.moodEmoji,
              data.emotions.join(','),
              data.notes,
              `MT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            ]]
          }
        });
        return res.status(200).json({ success: true, data: response.data });
      }

      case 'getEntries': {
        let range = 'TrackerData1!A2:G';
        const entries = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range
        });

        let filteredEntries = entries.data.values || [];

        // Filter by user
        if (data.userEmail) {
          filteredEntries = filteredEntries.filter(row => row[1] === data.userEmail);
        }

        // Apply time range filter if provided
        if (data.timeRange) {
          const startDate = new Date(data.timeRange.start);
          const endDate = new Date(data.timeRange.end);
          
          filteredEntries = filteredEntries.filter(row => {
            const entryDate = new Date(row[0]);
            return entryDate >= startDate && entryDate <= endDate;
          });
        }

        // Apply time filter (week/month/year/all)
        if (data.timeFilter) {
          const now = new Date();
          let cutoffDate = new Date();

          switch (data.timeFilter) {
            case 'week':
              cutoffDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              cutoffDate.setMonth(now.getMonth() - 1);
              break;
            case 'year':
              cutoffDate.setFullYear(now.getFullYear() - 1);
              break;
            default:
              // 'all' - no filtering needed
              break;
          }

          if (data.timeFilter !== 'all') {
            filteredEntries = filteredEntries.filter(row => {
              const entryDate = new Date(row[0]);
              return entryDate >= cutoffDate;
            });
          }
        }

        return res.status(200).json({ success: true, data: filteredEntries });
      }

      case 'verifyUser': {
        const users = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'UserAccounts!A2:D'
        });
        
        const userRows = users.data.values || [];
        const user = userRows.find(row => 
          row[0] === data.email && row[1] === data.hashedPassword
        );

        if (user) {
          const userRowIndex = userRows.indexOf(user) + 2;
          // Update last login
          await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
            range: `UserAccounts!D${userRowIndex}`,
            valueInputOption: 'USER_ENTERED',
            resource: {
              values: [[new Date().toISOString()]]
            }
          });
          return res.status(200).json({ success: true });
        }
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      case 'addUser': {
        // Check if user already exists
        const existingUsers = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'UserAccounts!A2:D'
        });
        
        const exists = (existingUsers.data.values || [])
          .some(row => row[0] === data.email);

        if (exists) {
          return res.status(400).json({ 
            success: false, 
            error: 'User already exists' 
          });
        }

        // Add new user
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'UserAccounts!A2:D',
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[
              data.email,
              data.hashedPassword,
              new Date().toISOString(), // Created date
              new Date().toISOString()  // Last login date
            ]]
          }
        });
        return res.status(200).json({ success: true });
      }

      case 'getCalendarEntries': {
        const entries = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'TrackerData1!A2:G'
        });

        let filteredEntries = entries.data.values || [];

        // Filter by user
        filteredEntries = filteredEntries.filter(row => row[1] === data.userEmail);

        // Format entries for calendar
        const calendarEntries = filteredEntries.map(entry => ({
          id: entry[6],
          date: entry[0],
          mood: entry[3],
          emotions: entry[4].split(','),
          notes: entry[5],
          category: entry[2]
        }));

        return res.status(200).json({ success: true, data: calendarEntries });
      }

      case 'getStatsForDate': {
        const entries = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'TrackerData1!A2:G'
        });

        let filteredEntries = entries.data.values || [];

        // Filter by user and date
        const targetDate = new Date(data.date);
        filteredEntries = filteredEntries.filter(row => {
          const entryDate = new Date(row[0]);
          return row[1] === data.userEmail && 
                 entryDate.toDateString() === targetDate.toDateString();
        });

        return res.status(200).json({ success: true, data: filteredEntries });
      }

      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action' 
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
