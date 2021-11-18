const { MongoClient, ObjectId } = require('mongodb');
const { hasUncaughtExceptionCaptureCallback } = require('process');
const url = 'mongodb+srv://group:MTM282@dataexpressdb.108zd.mongodb.net/DataExpress?retryWrites=true&w=majority';
const client = new MongoClient(url);

const dbName = 'myData';
const db = client.db(dbName);
const collection = db.collection('Users');

exports.loginPage = (req, res) => {
    res.render('login');
};

exports.login = (req, res) => {
    console.log(req.body.username);
    if(req.body.username != null && req.body.password != null){
        req.session.user = {
            isAuthenticated: true,
            username: req.body.username
        }
    }else {
        res.redirect('/');
    }
};

exports.index = (req, res) => {
    res.render('index');
};

exports.createPage = (req, res) => {
    res.render('createAccount');
};

exports.create = async (req, res) => {
    await client.connect();
    let user = {
        username: req.body.username,
        pass: req.body.password,
        email: req.body.email,
        age: req.body.age,
        q1: req.body.question1,
        q2: req.body.question2,
        q3: req.body.question3
    };
    const insertResult = await collection.insertOne(user);
    client.close();
    res.redirect('/');
};