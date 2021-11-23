const { MongoClient, ObjectId } = require('mongodb');
const { hasUncaughtExceptionCaptureCallback } = require('process');
const url = 'mongodb+srv://Group:MTM282@dataexpressdb.108zd.mongodb.net/DataExpress?retryWrites=true&w=majority';
const client = new MongoClient(url);

const dbName = 'DataExpress';
const db = client.db(dbName);
const collection = db.collection('Users');
const bcrypt = require('bcryptjs');

const checkAuth = (req, res, next) => {
    console.log(req.body.username);
    if(req.body.username == "user" && req.body.password == "pass"){
            req.session.user = {
                isAuthenticated: true,
                username: req.body.username
            }
            res.redirect("/private");
    }
}

exports.loginPage = (req, res) => {
    res.render('login');
};

exports.login = async (req, res) => {
    await client.connect();
    let username = req.body.username;
    let password = req.body.password;
    const findResult = await collection.find({username});

    bcrypt.compare(password, findResult.password, (err, res) => {
        req.session.user = {
            isAuthenticated: true,
            username: req.body.username
        }
    });
    console.log('Found documents => ', findResult);
    client.close();
    res.redirect('/home');
};

exports.home = async (req, res) => {
    await client.connect();
    let user = req.session.user;
    const findResult = await collection.find({user}).toArray();
    console.log('Found documents => ', findResult);
    client.close();
    
    res.render('home', {
        title: 'User List',
        users: findResult
    });
};

exports.start = (req, res) => {
    res.render('start');
};

exports.createPage = (req, res) => {
    res.render('createAccount');
};

exports.create = async (req, res) => {
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
        /*req.session.user = {
            isAuthenticated: true,
            username: req.body.username
        }*/
        console.log("Thank god")
    const insertResult = await collection.insertOne(user);
    client.close();
    res.redirect('/start');
};