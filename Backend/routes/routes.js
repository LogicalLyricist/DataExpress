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

exports.login = async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    await client.connect();
    const findResult = await collection.find({username});

    bcrypt.compare(password, findResult.password, (err, res) => {
        req.session.user = {
            isAuthenticated: true,
            username: req.body.username
        }
        res.redirect('/home');
    });
    console.log('Found documents => ', findResult);
    client.close();
};

exports.home = async (req, res) => {
    let user = req.session.user;
    await client.connect();
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
    const insertResult = await collection.insertOne(user);
    client.close();
    res.redirect('/start');
};