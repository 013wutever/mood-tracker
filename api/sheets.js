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

      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
