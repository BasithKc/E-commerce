const express = require('express')
const path = require('path')
 require('dotenv').config()
const mongoose = require('mongoose')
const session = require('express-session');
const flash = require('connect-flash')

const dbUrl = 'mongodb://localhost:27017/E-commerce'
const app = express()

mongoose.connect(dbUrl)

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')))
app.use(flash())



const PORT = process.env.PORT || 3001

const indexRouter = require('./routes/index')
const adminRouter = require('./routes/admin')

app.set('views',path.join(__dirname,'views'))
app.set('view engine', 'ejs')

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}));

app.use(indexRouter)
app.use(adminRouter)


app.listen(PORT, () => {
    console.log(`Server Started on ${PORT}`);
})