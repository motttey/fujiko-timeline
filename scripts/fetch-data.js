const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const fetchData = async () => {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}/values/sheet?key=${process.env.API_KEY}`
    );
    const data = await response.json();
    if (data.error) {
      console.error("Error fetching data from Google Sheets:", data.error.message);
      process.exit(1);
    }
    const values = data.values.slice(1);
    const formattedData = values.map((row, index) => ({
      id: index,
      date: row[1],
      work: row[2],
      url: row[3],
    }));

    const outputPath = path.resolve(__dirname, '../public/timeline-data.json');
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(formattedData, null, 2));
    console.log('Data fetched and saved to public/timeline-data.json');
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    process.exit(1);
  }
};

fetchData();
