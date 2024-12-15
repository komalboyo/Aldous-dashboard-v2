const express = require('express');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

async function connectToDatabase() {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    return client.db('user-chat').collection('users');
}

app.get('/api/chat-records', async (req, res) => {
    try {
        const collection = await connectToDatabase();
        const chatRecords = await collection.find({}).toArray();
        res.json(chatRecords);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat records' });
    }
});

app.get('/get-pdfs', (req, res) => {
    const pdfDir = path.join(__dirname, '../public/pdfs');
    fs.readdir(pdfDir, (err, files) => {
        if (err) return res.status(500).json({ error: 'Unable to scan files' });
        res.json(files.filter(file => file.endsWith('.pdf')));
    });
});

module.exports = app;
