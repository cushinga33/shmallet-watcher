const express = require('express');
const cors = require('cors');
require('dotenv').config();
const requireAuth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({message: 'Shmallet Watcher is aware'})
})

app.get('/api/dashboard', requireAuth, (req, res) => {
    res.json({
        message: `Welcome, user ${req.user.id}!`,
        secretData: 'This is secured financial test data.'
    })
})

app.listen(PORT, () => {
    console.log(`Shmallet Watcher is watching on port ${PORT}`)
})