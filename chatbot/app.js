const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bucketRoutes = require('./routes/bucket');
const authRoutes  = require('./routes/auth');
const uploadRoutes  = require('./routes/uploadRoutes');
const { authenticate } = require('./middleware/authMiddleWare');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use('/api/buckets',[authenticate], bucketRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
