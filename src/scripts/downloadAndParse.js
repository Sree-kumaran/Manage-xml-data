const axios = require('axios');
const mongoose = require('mongoose');
const { parseXML } = require('../services/xmlParserService');
const Item = require('../models/item.model');
require('dotenv').config();

const XML_URL = 'https://www.nasa.gov/news-release/feed/';

async function fetchXML() {
    console.log('Downloading XML data from NASA...');
    const response = await axios.get(XML_URL, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/xml, text/xml, */*',
        },
        timeout: 60000,
    });
    return response.data;
}

async function insertInBatches(data) {
  const BATCH_SIZE = 100;
  let inserted = 0;
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    await Item.insertMany(batch, { ordered: false });
    inserted += batch.length;
    console.log(`Inserted ${inserted}/${data.length}`);
  }
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    await Item.deleteMany({});
    console.log('Old data cleared');

    const xmlData = await fetchXML();
    console.log('XML downloaded successfully');

    console.log('Parsing XML...');
    const parsedData = await parseXML(xmlData);
    console.log(`Parsed ${parsedData.length} entries`);

    console.log('Inserting into MongoDB...');
    await insertInBatches(parsedData);

    console.log('✅ Done! All data inserted.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
    }
    process.exit(1);
  }
}

run();