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

const checkAuth = (req, res, next) => {
    if(req.session.user && req.session.user.isAuthenticated){
        next();
    }else{
        res.redirect('/');
    }
}

app.use(expressSession({
    secret: 'whatever',
    saveUninitialized: true, 
    resave: true
}));

app.get('/', routes.start);
app.get('/start', routes.start);
app.post('/login', routes.loginPage);
app.post('/loggedIn', routes.login);
app.post('/loggedIn', urlencodedParser, routes.login);
app.post('/create', routes.createPage);
app.post('/createAcc', routes.create);
app.get('/createAcc', urlencodedParser, routes.create);
app.get('/home', checkAuth, routes.home);

app.listen(3000);
