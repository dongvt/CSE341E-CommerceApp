const Product = require('../models/product');

const { validationResult } = require('express-validator/check');

exports.getAddProduct = (req, res, next) => {

  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    error: false,
    product: [],
    errorMessage: '',
    allErrors: []
  });

};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      error: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
        error: true,
      },
      errorMessage: errors.array()[0].msg,
      allErrors: errors.array()
    });
  }

  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    description: description,
    price: price,
    userId: req.user
  });

  product.save()
    .then(result => {
      console.log('Product Created')
      res.redirect('/admin/products');
    })
    .catch(err => {
      const errorThrown = new Error(err);
      errorThrown.httpStatusCode = 500;
      return next(errorThrown);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode)
    res.redirect('/');

  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product)
        return res.redirect('/');

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/add-product',
        editing: editMode,
        error: false,
        product: product,
        errorMessage: '',
        allErrors: []
      });
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.prodId;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors)
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      error: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
        error: true,
        _id: req.body.prodId
      },
      errorMessage: errors.array()[0].msg,
      allErrors: errors.array()
    });
  }

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() === req.user._id.toString()) {
        product.title = title;
        product.imageUrl = imageUrl;
        product.price = price;
        product.description = description;
        return product.save().then(result => {
          res.redirect('/admin/products');
        });
      } else {
        res.redirect('/');
      }
    })
    .catch(err => {
      const errorThrown = new Error(err);
      errorThrown.httpStatusCode = 500;
      return next(errorThrown);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    }).catch(err => {
      const errorThrown = new Error(err);
      errorThrown.httpStatusCode = 500;
      return next(errorThrown);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then(() => {
      res.redirect('/admin/products');
    });
};