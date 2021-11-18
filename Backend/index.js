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

app.get('/', routes.index);
app.get('/index', routes.index);
app.post('/login', routes.loginPage);
app.post('/loggedIn', routes.login);
//app.post('/login', urlencodedParser, routes.login);
app.post('/create', routes.createPage);
//app.get('/create', urlencodedParser, routes.create);
app.post('/createAcc', routes.create);


app.listen(3000);
