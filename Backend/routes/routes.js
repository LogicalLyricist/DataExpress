const { MongoClient, ObjectId } = require('mongodb');
const url = '';
const client = new MongoClient(url);

exports.index = (req, res) => {
    res.render('index')
};