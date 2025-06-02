const express = require('express');
const connectDB = require('./src/services/mongodb.service');
const cors = require('cors');
require('dotenv').config();

const app = express();
const mongoUrl = process.env.MONGO_URL;
const port = process.env.PORT || 8080;
const router = require('./src/routers');

app.use(express.json());
app.use(cors());
app.use(express.static('static'));

if (!mongoUrl) {
    throw new Error('MONGO_URL is not defined in environment variables');
}

router(app);

connectDB(mongoUrl)
    .then(() => {
        app.listen(port, '0.0.0.0', () => {
            console.log(`Server is starting at http://0.0.0.0:${port}`);
        });
    })
    .catch((error) => {
        console.log(error);
    });
