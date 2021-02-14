const Product = require('../models/product');
const Order = require('../models/orders');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
  }).catch(err => {
    console.log(err);
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail',{
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
}

exports.getIndex = (req, res, next) => {
  Product.find()
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
};

exports.getCart = (req, res, next) => {
  
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(cartProducts => {
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: cartProducts.cart.items
    });
  })
  .catch(err => console.log(err));
  

};

exports.postCart = (req,res,next) => {
   const prodId = req.body.productId;
   const qty    = parseInt(req.body.quantity);

   Product.findById(prodId)
    .then(prod => {
      req.user.addToCart(prod,qty);
      res.redirect('/cart'); 
    }).then( result => {
      console.log(result);
    });
};

exports.postCartDeleteProduct = (req,res,next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err => {
    console.log(err);
  });
};

exports.postOrder = (req, res, next) => {
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user => {
    const products = user.cart.items.map(i => {
      return {product: {...i.productId._doc} , quantity: i.quantity};
    });
    
    const grandTotal = products.reduce((total,p) => total + (parseFloat(p.product.price) * p.quantity),0);
    
    const order = new Order({
      user: {
        name: req.user.name,
        email: req.user.email,
        userId: req.user //Moongose select the ID
      },
      date: new Date(),
      products: products,
      totalPrice: grandTotal
    });

    return order.save();
  })
    .then(result => {
      return req.user.clearCart();
      
    })
    .then(result => {
      res.redirect('/orders');
    })  
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  
  Order.find({'user.userId':req.user._id})
    .then(orders => {
        res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
  
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
