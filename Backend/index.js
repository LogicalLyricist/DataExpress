const express = require('express');
const pug = require('pug');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use(cookieParser('whatever'));

const urlencodedParser = express.urlencoded({
    extended: false
});
