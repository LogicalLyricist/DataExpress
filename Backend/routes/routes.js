const { MongoClient, ObjectId } = require('mongodb');
const url = 'mongodb+srv://group:MTM282@dataexpressdb.108zd.mongodb.net/DataExpress?retryWrites=true&w=majority';
const client = new MongoClient(url);

exports.index = (req, res) => {
    res.render('index')
};