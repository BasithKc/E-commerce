const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config()

const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))
app.use(bodyParser.urlencoded({extended:true}))


const PORT = process.env.PORT || 3001

const indexRouter = require('./routes/index')

app.set('views',path.join(__dirname,'views'))
app.set('view engine', 'ejs')

app.use(indexRouter)


app.listen(PORT, () => {
    console.log(`Server Started on ${PORT}`);
})