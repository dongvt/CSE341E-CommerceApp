const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
    MongoClient.connect('',
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(res => {
        console.log("Well, here you go!");
        _db = res.db();
        callback(res);
    })
    .catch(res => {
        console.log(res);
        throw err;
    });
}

const getDB = () => {
    if (_db)
        return _db;
    
    throw 'Error connection the DB';
}

exports.mongoConnect = mongoConnect;
exports.getDB = getDB;