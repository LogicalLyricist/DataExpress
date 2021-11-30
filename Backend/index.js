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

renderLogin = (req, res) => {
    res.render('login');
};

authUser = async (req, res) => {
    await client.connect();
    let username = req.body.username;
    let password = req.body.password;
    
    const findResult = await collection.find({username:{username}}).toArray();
    console.log("USER: ---------------" + findResult[0])
    bcrypt.compareSync(password, findResult[0].pass, (err, res) => {
        if(err){
            //console.log(err)
        }else{
            req.session.user = {
                isAuthenticated: true,
                username: req.body.username
            }
        }
    });

    console.log('Found documents => ', findResult);
    if(req.session.user && req.session.user.isAuthenticated){
        let user = req.session.user;
        const findResult = await collection.find({user}).toArray();
        console.log('Found documents => ', findResult);
        client.close();
        
        res.render('renderHome', {
            title: 'User List',
            users: findResult
        });
    }else{
        client.close
        res.redirect('/');
    }
};

renderHome = (req, res) => {
    res.render("home")
};

start = (req, res) => {
    res.render('start');
};

renderCreate = (req, res) => {
    res.render('createAccount');
};

addUser = async (req, res) => {
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

app.get('/', renderHome); //Ask about later
app.get('/start', start);
app.get('/login', renderLogin);
app.post('/loggedIn', urlencodedParser, authUser);
app.get('/create', renderCreate);
app.post('/createAcc', urlencodedParser, addUser);
app.get('/createAcc', urlencodedParser, addUser);
app.get('/home', renderHome);
app.post('/home',urlencodedParser, renderHome);
app.listen(3000);
