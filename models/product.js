const moongose = require('mongoose');

const Schema = moongose.Schema;

const productSchema = new Schema ({
  title : {
    type: String,
    require: true
  },
  imageUrl : {
    type: String,
    require: true
  },
  description : {
    type: String,
    require: true
  },
  price:  {
    type: String,
    require: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true
  }
});

module.exports = moongose.model('Product',productSchema);
// const MongoDb = require('mongodb');

// const getDB = require('../util/database').getDB;

// module.exports = class Product {
//   constructor(title, imageUrl, description, price,id, userId) {
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this.price = price;
//     this._id = id ? new MongoDb.ObjectID(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDB();
//     let dbOp; 
//     if (this._id) {
//       dbOp = db.collection('products').updateOne({_id : this._id},{$set: this});
//     } else {
//       dbOp = db.collection('products').insertOne(this);
//     }

//     return dbOp
//       .then( res => {
//         console.log("SUCCESS");
//       })
//       .catch(err => {
//         throw err;
//       });
//   }

//   static deleteById(id) {
//     const db = getDB();
//     db.collection('products')
//       .deleteOne({_id: new MongoDb.ObjectID(id)})
//       .then(result => {
//         console.log('Deleted');
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static fetchAll(/* cb */) {
//     const db = getDB();
//     return db
//       .collection('products')
//       .find()
//       .toArray()
//       .then(prod => {
//         return prod;
//       })
//       .catch(err => {
//         throw err;
//       });
//     /* getProductsFromFile(cb); */
//   }

//   static findById (id) {
//     const db = getDB();
//     return db
//       .collection('products')
//       .find({_id: new MongoDb.ObjectID(id)})
//       .next()
//       .then(prod => {
//         return prod;
//       })
//       .catch(err => {
//         throw err;
//       });
//   }
// };
