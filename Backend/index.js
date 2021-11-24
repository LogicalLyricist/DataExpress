const express = require('express');
const pug = require('pug');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const path = require('path')
const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(cookieParser('whatever'));

const { MongoClient, ObjectId } = require('mongodb');
const { hasUncaughtExceptionCaptureCallback } = require('process');
const url = 'mongodb+srv://Group:MTM282@dataexpressdb.108zd.mongodb.net/DataExpress?retryWrites=true&w=majority';
const client = new MongoClient(url);

const dbName = 'DataExpress';
const db = client.db(dbName);
const collection = db.collection('Users');

loginPage = (req, res) => {
    res.render('login');
};

login = async (req, res) => {
    await client.connect();
    let username = req.body.username;
    let password = req.body.password;
    const findResult = await collection.find({username});

    bcrypt.compare(password, findResult.password, (err, res) => {
        if(err){
            console.log(err)
        }else{
            req.session.user = {
                isAuthenticated: true,
                username: req.body.username
            }
        }''
    });
    console.log('Found documents => ', findResult);
    client.close();
    res.redirect('/home');
};

home = async (req, res) => {
    console.log(req.session.user + req.session.user.isAuthenticated)
    if(req.session.user && req.session.user.isAuthenticated){
        await client.connect();
        let user = req.session.user;
        const findResult = await collection.find({user}).toArray();
        console.log('Found documents => ', findResult);
        client.close();
        
        res.render('home', {
            title: 'User List',
            users: findResult
        });
    }else{
        res.redirect('/');
    }
};

start = (req, res) => {
    res.render('start');
};

createPage = (req, res) => {
    res.render('createAccount');
};

create = async (req, res) => {
    await client.connect();
    let salt = bcrypt.genSaltSync(10);
    let user = {
        username: req.body.username,
        pass: bcrypt.hashSync(req.body.password, salt),
        email: req.body.email,
        age: req.body.age,
        q1: req.body.question1,
        q2: req.body.question2,
        q3: req.body.question3
    };
    console.log(user +":" + req.body.username);
        req.session.user = {
            isAuthenticated: true,
            username: req.body.username
        }
    const insertResult = await collection.insertOne(user);
    client.close();
    res.redirect('/start');
};

const urlencodedParser = express.urlencoded({
    extended: false
});


app.use(expressSession({
    secret: 'whatever',
    saveUninitialized: true, 
    resave: true
}));

app.get('/', start);
app.get('/start', start);
app.post('/login', urlencodedParser, loginPage);
//app.post('/loggedIn', routes.login);
app.post('/loggedIn', urlencodedParser, login);
app.get('/create', createPage);
app.post('/createAcc', urlencodedParser, create);
app.get('/createAcc', urlencodedParser, create);
app.get('/home', home);

app.listen(3000);
