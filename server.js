const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const JSZip = require('jszip');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/your-database-name', { useNewUrlParser: true, useUnifiedTopology: true });

const FileSchema = new mongoose.Schema({
  date: String,
  originalname: String,
  mimetype: String,
  size: Number,
  path: String,
});

const File = mongoose.model('File', FileSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static('public'));

app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const { date } = req.body;

    if (!date || !req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Invalid request parameters.' });
    }

    const files = req.files;

    await Promise.all(files.map(async (file) => {
      const newFile = new File({
        date: date,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.buffer.toString('base64'),
      });

      await newFile.save();
    }));

    res.json({ success: true });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/download/:selectedDate', async (req, res) => {
  try {
    const selectedDate = req.params.selectedDate;

    const files = await File.find({ date: selectedDate });

    if (files.length === 0) {
      return res.status(404).json({ error: 'Files not found for the selected date.' });
    }

    const zip = new JSZip();
    files.forEach((file, index) => {
      zip.file(`file_${index + 1}.${file.originalname.split('.').pop()}`, Buffer.from(file.path, 'base64'), { binary: true });
    });

    const zipData = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=notes_${selectedDate}.zip`);
    res.end(zipData); // Corrected line
  } catch (error) {
    console.error('Error generating or sending zip file:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
