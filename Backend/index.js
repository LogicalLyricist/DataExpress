const express = require('express');
const pug = require('pug');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const path = require('path')
const app = express();
const fs = require('fs');

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(cookieParser('whatever'));

app.use(express.static(path.join(__dirname,'/public')));

let visited = 0;

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
    console.log(username + password)
    
    const findResult = await collection.find({username: username}).toArray();
    console.log("USER: ---------------" + findResult[0])

    const passCheck = bcrypt.compareSync(password, findResult[0].pass)
    if(passCheck){
        req.session.user = {
            isAuthenticated: true,
            accountName: req.body.username
        }
        console.log('Found documents => ', findResult);

       // console.log('Found documents => ', findResult);
        client.close();
        
        res.redirect("/home")
    }else{
        res.redirect("/fail")
    }
}

renderHome = async (req, res) => {
    await client.connect();
    let user = req.session.user;
    console.log('account name ' + user.accountName);

    const findResult = await collection.find({username: user.accountName}).toArray();
    console.log('Found documents => ', findResult);
    
    visited++;
    res.cookie('stuff', user.accountName, {maxAge: 999999999999999999999999999999});
    res.cookie('visited', visited, {maxAge: 999999999999999999999999999999});
    
    if (!(req.cookies.beenHereBefore == 'yes')){
    
        res.cookie('beenHereBefore', 'yes', {maxAge: 999999999999999999999999999999});
        visited = 0;
    }

    res.render('home',{
        title: 'User List',
        users: findResult});
};

logout = (req,res) => {
    req.session.destroy()
    res.redirect("/")
}
start = (req, res) => {
    updateToJSON()
    res.render('start');
};

renderCreate = (req, res) => {
    res.render('createAccount');
};

updateToJSON = async (req, res) => {
    await client.connect();
    const findResult = await collection.find({}).toArray();
    var finalOutput

    for(var i = 0; i < findResult.length; i++ ) {
        q1 = findResult[i].q1
        q2 = findResult[i].q2
        q3 = findResult[i].q3
        console.log(q1 + q2 + q3)
        
        finalOutput += (q1 + q2 +q3)
        console.log(finalOutput)
    }
    finalOutput = JSON.stringify(finalOutput)

    fs.writeFile("results.json", finalOutput, (err, result) => {
        if(err) console.log('error: ', err);
    });
    client.close()
}

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
        q3: req.body.question3,
        isAdmin: false
    };
    console.log(user +":" + req.body.username);
        req.session.user = {
            isAuthenticated: true,
            accountName: req.body.username
        }
    const insertResult = await collection.insertOne(user);
    client.close();
    res.redirect('/start');
};

renderEdit = (req, res) => {
    res.render('edit');
};

passFailed = (req, res) => {
    res.render("fail");
}

editUser = async (req, res) => {
    await client.connect();
    let salt = bcrypt.genSaltSync(10);
    let user = {
        username: req.body.username,
        pass: bcrypt.hashSync(req.body.password, salt),
        email: req.body.email,
        age: req.body.age,
        q1: req.body.question1,
        q2: req.body.question2,
        q3: req.body.question3,
        isAdmin: false
    };
    console.log(user)
    const editResult = await collection.replaceOne(
        {"username": req.session.user.accountName}
        , user);
    console.log(user +" : " + req.body.username);
        req.session.user = {
            isAuthenticated: true,
            accountName: req.body.username
        }
    
    client.close();
    res.redirect('/home');
}

const urlencodedParser = express.urlencoded({
    extended: false
});


app.use(expressSession({
    secret: 'whatever',
    saveUninitialized: true, 
    resave: true
}));

app.get('/', start); //Ask about later
app.post("/", logout)
app.get('/start', start);

app.get('/login', renderLogin);
app.post('/loggedIn', urlencodedParser, authUser);

app.get('/create', renderCreate);
app.post('/create', urlencodedParser, addUser);
//app.get('/createAcc', urlencodedParser, addUser);

//v one of these needs to go v
app.get('/home', renderHome);
app.post('/home',urlencodedParser, authUser);

app.get('/edit', renderEdit);
app.post('/edit', urlencodedParser, editUser);

app.get('/fail', passFailed);

app.listen(3000);