const express = require('express');
const pug = require('pug');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const path = require('path')
const routes = require('./routes/routes');
const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(cookieParser('whatever'));

const urlencodedParser = express.urlencoded({
    extended: false
});

app.use(expressSession({
    secret: 'whatever',
    saveUninitialized: true, 
    resave: true
}));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/login', urlencodedParser, (req, res) => {
    console.log(req.body.username);
    if(req.body.username != null && req.body.password != null){
        req.session.user = {
            isAuthenticated: true,
            username: req.body.username
        }
    }else {
        res.redirect('/');
    }
});

app.listen(3000);
