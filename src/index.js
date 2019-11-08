const express = require('express');
const hbs = require('hbs');
const app = express();
const path = require('path');
const router = require('./routes/auth');
const mongoose = require('mongoose');

const cookieParser = require('cookie-parser');

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);
app.use(cookieParser());
app.use('/', require('./routes/auth'))

hbs.registerPartials(__dirname + '/views/partials');

mongoose.connect('mongodb://localhost/signup', { useNewUrlParser: true })
    .then(() => {
        console.log("Connected to Mongo!");
    }).catch(err => {
        console.error('Error connecting to mongo', err);
    })

app.listen(3001);