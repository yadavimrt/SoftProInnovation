const express= require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path');
dotenv.config();
const app = express();
const adminRoutes = require('./routes/adminRoutes');
const mongoDB = require('./config/db');
mongoDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//API'S STARTED
app.use('/api/admin', adminRoutes);
app.use('/api/category', require('./routes/categoryRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/product', require('./routes/productRoutes'));

app.listen(process.env.PORT , () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});