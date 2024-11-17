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
      case 'addEntry':
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

      case 'getEntries':
        const entries = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'TrackerData1!A2:G'
        });
        const filteredEntries = (entries.data.values || [])
          .filter(row => row[1] === data.userEmail);
        return res.status(200).json({ success: true, data: filteredEntries });

      case 'verifyUser':
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

      case 'addUser':
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
              new Date().toISOString(),
              new Date().toISOString()
            ]]
          }
        });
        return res.status(200).json({ success: true });

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
