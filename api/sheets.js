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

    console.log('API Request:', { action, data }); // Debug log

    switch (action) {
      case 'addEntry': {
        // Validate required fields
        if (!data.userEmail || !data.category || !data.moodEmoji || !data.emotions) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields'
          });
        }

        const response = await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'TrackerData1!A2:G',
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [[
              new Date().toISOString(), // Timestamp
              data.userEmail,
              data.category,
              data.moodEmoji,
              Array.isArray(data.emotions) ? data.emotions.join(',') : data.emotions,
              data.notes || '',
              `MT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            ]]
          }
        });

        console.log('Add Entry Response:', response.data); // Debug log
        return res.status(200).json({ success: true, data: response.data });
      }

      case 'getEntries': {
        console.log('Getting entries for user:', data.userEmail); // Debug log

        const entriesResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'TrackerData1!A2:G'
        });

        let entries = entriesResponse.data.values || [];
        
        // Filter by user email
        if (data.userEmail) {
          entries = entries.filter(row => row[1] === data.userEmail);
        }

        // Apply time filter if provided
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
            // 'all' - no filtering needed
          }

          if (data.timeFilter !== 'all') {
            entries = entries.filter(row => {
              try {
                const entryDate = new Date(row[0]);
                return entryDate >= cutoffDate;
              } catch (error) {
                console.error('Error parsing date:', row[0], error);
                return false;
              }
            });
          }
        }

        // Apply date range filter if provided
        if (data.timeRange) {
          const startDate = new Date(data.timeRange.start);
          const endDate = new Date(data.timeRange.end);
          
          entries = entries.filter(row => {
            try {
              const entryDate = new Date(row[0]);
              return entryDate >= startDate && entryDate <= endDate;
            } catch (error) {
              console.error('Error parsing date:', row[0], error);
              return false;
            }
          });
        }

        console.log('Filtered entries count:', entries.length); // Debug log
        return res.status(200).json({ success: true, data: entries });
      }

      case 'verifyUser': {
        if (!data.email || !data.hashedPassword) {
          return res.status(400).json({
            success: false,
            error: 'Missing email or password'
          });
        }

        const usersResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'UserAccounts!A2:D'
        });
        
        const users = usersResponse.data.values || [];
        const user = users.find(row => 
          row[0] === data.email && row[1] === data.hashedPassword
        );

        if (user) {
          const userRowIndex = users.indexOf(user) + 2;
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

        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        });
      }

      case 'addUser': {
        if (!data.email || !data.hashedPassword) {
          return res.status(400).json({
            success: false,
            error: 'Missing email or password'
          });
        }

        // Check if user exists
        const existingUsersResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'UserAccounts!A2:D'
        });
        
        const existingUsers = existingUsersResponse.data.values || [];
        const userExists = existingUsers.some(row => row[0] === data.email);

        if (userExists) {
          return res.status(400).json({ 
            success: false, 
            error: 'User already exists' 
          });
        }

        // Add new user
        const now = new Date().toISOString();
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'UserAccounts!A2:D',
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[
              data.email,
              data.hashedPassword,
              now,  // Created date
              now   // Last login date
            ]]
          }
        });

        return res.status(200).json({ success: true });
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
      error: error.message || 'Internal server error'
    });
  }
}
