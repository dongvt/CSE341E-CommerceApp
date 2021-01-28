const moongose = require('mongoose');

const Schema = moongose.Schema;

const userSchema = new Schema ({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: { 
    items: [{
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }]
  }
});

userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if ( cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push(
      {
        productId : product._id , 
        quantity: newQuantity
      }
    )
  }

  const updatedCart = {items: updatedCartItems};

  this.cart = updatedCart;
  return this.save();
};

module.exports = moongose.model('User',userSchema); 

// const MongoDb = require('mongodb');

// const getDB = require('../util/database').getDB;

// module.exports = class User {
//     constructor(userName, email, cart, id) {
//         this.userName = userName;
//         this.email = email;
//         this.cart = cart;
//         this._id = id ? new MongoDb.ObjectID(id) : null;
//     }

//     save() {
//         const db = getDB();
//         let dbOp; 
//         /* if (this._id) {
//           dbOp = db.collection('products').updateOne({_id : this._id},{$set: this});
//         } else {
//           dbOp = db.collection('products').insertOne(this);
//         } */

//         dbOp = db.collection('users').insertOne(this);
    
//         return dbOp
//           .then( res => {
//             console.log("SUCCESS");
//           })
//           .catch(err => {
//             throw err;
//           });
//     }

//     addToCart(product) {
//       const cartProductIndex = this.cart.items.findIndex(cp => {
//         return cp.productId.toString() === product._id.toString();
//       });

//       let newQuantity = 1;
//       const updatedCartItems = [...this.cart.items];

//       if ( cartProductIndex >= 0) {
//         newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//         updatedCartItems[cartProductIndex].quantity = newQuantity;
//       } else {
//         updatedCartItems.push(
//           {
//             productId : new MongoDb.ObjectID(product._id) , 
//             quantity: newQuantity
//           }
//         )
//       }

//       const updatedCart = {items: updatedCartItems};


//       const db = getDB();
//       db.collection('users')
//         .updateOne(
//           {_id : this._id}, 
//           {$set:{cart:updatedCart}}
//         );
//     }

//     getCart() {
//       const db = getDB();
//       const productIds = this.cart.items.map(it => it.productId);
//       console.log(productIds);
//       return db
//         .collection('products')
//         .find({_id: {$in: productIds}})
//         .toArray()
//         .then(products => {
//           return products.map(p => {
//             return {
//               ...p,
//               quantity: this.cart.items.find(i => {
//                 return i.productId.toString() === p._id.toString();
//               }).quantity
//             };
//           });
//         });
//     }

//     addOrder() {
//       const db = getDB();
//       return this.getCart().then(products => {
//         const order = {
//           items: products,
//           user: {
//             _id: new MongoDb.ObjectID(this._id),
//             name: this.name,
//             email: this.email
//           }
//         }
//         return db.collection('orders').insertOne(order);
//       })      
//       .then(result => {
//         this.cart = {items: []};
//         return db.collection('users')
//         .updateOne(
//           {_id : this._id}, 
//           {$set:{cart:{items:[]}}}
//         );
//       })
//     }

//     getOrders() {
//       const db = getDB();
//       return db
//         .collection('orders')
//         .find({'user._id': new MongoDb.ObjectID(this._id)}).toArray();
//     }

//     deleteItemFromCart(id) {
//       const updatedCartItems = this.cart.item.filter( item => {
//         return item.productId.toString() !== id-toString();
//       });

//       const db = getDB();
//       db.collection('users')
//         .updateOne(
//           {_id : this._id}, 
//           {$set:{cart:{items:updatedCartItems}}}
//         );

//     }

//     static findById(userId) {
//       const db = getDB();
//       return db
//         .collection('users')
//         .findOne({_id: new MongoDb.ObjectID(userId)})
//         .then(user => {
//           return user;
//         })
//         .catch(err => {
//           throw err;
//         });
//     }
// }