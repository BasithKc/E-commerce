//Importing built-in modules
const path = require('path')

//Importing third party modules
const express = require('express')
require('dotenv').config()
const session = require('express-session');
const mongoose = require('mongoose')
const flash = require('connect-flash');

const app = express()

//Connecting to mongodb
const dbUrl = process.env.DB_URL
mongoose.connect(dbUrl)
const db = mongoose.connection;

//checking whether connected or not
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

//Using middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))) //static
app.use(flash())//flash
app.use(session({//session
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
}));


//Port setting
const PORT = process.env.PORT || 3001

//importing routers
const indexRouter = require('./routes/index')
const adminRouter = require('./routes/admin')
const userRouter = require('./routes/user')

//Setting view Engine and veiw path
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


//Handling Routing
app.use(indexRouter)
app.use(adminRouter)
app.use(userRouter)

//Post listening
app.listen(PORT, () => {
    console.log(`Server Started on ${PORT}`);
})