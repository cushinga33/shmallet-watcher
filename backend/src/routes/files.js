const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('fast-csv');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// Configure multer to store files temporarily as buffer objects in server memory
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB cap limit
});

router.post('/upload', upload.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a valid CSV file.' });
    }

    const fileBuffer = req.file.buffer.toString('utf8');
    const parsedRows = [];

    // Open a string stream out of the memory buffer
    const csvStream = csv.parse({ headers: true, ignoreEmpty: true })
        .on('data', (row) => {
            parsedRows.push(row);
        })
        .on('end', () => {
            // Success! Send the raw array data back to the frontend
            res.status(200).json({
                message: 'CSV parsed successfully!',
                filename: req.file.originalname,
                rowCount: parsedRows.length,
                transactions: parsedRows
            });
        })
        .on('error', (error) => {
            console.error('CSV Stream compilation breakdown:', error);
            res.status(500).json({ error: 'Failed to properly parse structural CSV columns.' });
        });

    // Write buffer block right into the engine stream
    csvStream.write(fileBuffer);
    csvStream.end();
});

module.exports = router;