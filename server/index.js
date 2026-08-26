const express= require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config();
const app = express();
const adminRoutes = require('./routes/adminRoutes');
const mongoDB = require('./config/db');
mongoDB();


app.use(express.json())
app.use(cors());

//API'S STARTED
app.use('/api/admin',require('./routes/adminRoutes'));
app.use('/api/category', require('./routes/categoryRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

app.listen(process.env.PORT , () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});