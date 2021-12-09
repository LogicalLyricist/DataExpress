const express = require('express');
const pug = require('pug');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const path = require('path')
const app = express();
const fs = require('fs');
const XMLHttpRequest = require('xhr2');
const xhr = new XMLHttpRequest();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(cookieParser('whatever'));
app.use((req,res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.static(path.join(__dirname,'/public')));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

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
    client.close();
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

renderAdmin = async (req, res) => {
    await client.connect();
    const findResult = await collection.find({}).toArray();
    client.close();

    res.render('admin',{
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
    
    var cheeseCount = 0;
    var pepperoniCount = 0;
    var pineappleCount = 0;
    var otherCount = 0;
    var flyingCount = 0;
    var teleportCount = 0;
    var invisCount = 0;
    var strengthCount = 0;
    var actionCount = 0;
    var comedyCount = 0;
    var dramaCount = 0;
    var horrorCount = 0;

    for(var i = 0; i < findResult.length; i++ ) {
        q1 = findResult[i].q1
        console.log(q1)
        q2 = findResult[i].q2
        q3 = findResult[i].q3
        
        if (q1 === "Cheese"){
            cheeseCount++
        }else if(q1 === "Pepperoni"){
            pepperoniCount++
        }else if(q1 === "Pineapple"){
        pineappleCount++
        }else{
            otherCount++
        }

        if (q2 === "Flying"){
            flyingCount++
        }else if(q2 === "Teleportation"){
            teleportCount++
        }else if(q2 === "Invisibility"){
        invisCount++
        }else{
            strengthCount++
        }

        if (q3 === "Action"){
            actionCount++
        }else if(q3 === "Comedy"){
            comedyCount++
        }else if(q3 === "Drama"){
            dramaCount++
        }else{
            horrorCount++
        }
    }

    
    var theJSON = [
        {
            name: 'Bob',
            age: 21,
            species: 'Zombie'
        },
        {
            name: 'Suzette',
            age: 34,
            species: 'Vampire'
        },
        {
            name: 'Harry',
            age: 42,
            species: 'Werewolf'
        },
        {
            name: 'Sally',
            age: 28,
            species: 'Human'
        }
    ];

    theJSON = [
        {
            Question: 'What is your favorite pizza topping',
            Cheese: cheeseCount,
            Pepperoni: pepperoniCount,
            Pineapple: pineappleCount,
            Other: otherCount,
        },
        {
            Question: 'What is your dream superpower',
            Flying: flyingCount,
            Teleportation: teleportCount,
            Invisibility: invisCount,
            Strength: strengthCount,
        },
        {
            Question: 'What is your favorite movie genre',
            Action: actionCount,
            Comedy: comedyCount,
            Drama: dramaCount,
            Horror: horrorCount,
        }
    ];

    fs.writeFile("results.json", JSON.stringify(theJSON), (err, result) => {
        if(err) console.log('error: ', err);
    });
    client.close()
}
api = (req, res) => {
    res.json(JSON.parse(fs.readFileSync('results.json'), 'utf8'));
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

deleteUser = async (req, res) =>{
    await client.connect();
    const deleteResult = await collection.deleteOne({_id: ObjectId(req.params.id)});
    client.close
    res.redirect('/admin')
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
app.post("/", logout)
app.get('/start', start);

app.get('/login', renderLogin);
app.post('/loggedIn', urlencodedParser, authUser);

app.get('/create', renderCreate);
app.post('/create', urlencodedParser, addUser);

app.get('/home', renderHome);
app.post('/home',urlencodedParser, authUser);

app.get('/edit', renderEdit);
app.post('/edit', urlencodedParser, editUser);
app.get('/admin', renderAdmin);
app.get('/delete/:id', deleteUser);

app.get('/fail', passFailed);
app.get('/api', api);

app.listen(3000);