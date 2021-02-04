const  bcrypt = require('bcryptjs');

const User = require('../models/user');


exports.getLogin = (req, res, next) => {
    
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: req.flash('error')
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const pass = req.body.password;

    User.findOne({email: email})
        .then(user => {
            if (!user) {
                req.flash('error','Invalid email or password.');
                return res.redirect('/login');
            }
            bcrypt.compare(pass,user.password)
            .then(matched => {
                if (matched) {
                    req.session.isAuth = true;
                    req.session.user = user;
                    return req.session.save(err => {
                        console.log(err);
                        return res.redirect('/');
                    });
                }
                req.flash('error','Invalid email or password..');
                res.redirect('/login');
            })
            .catch(err => {
                console.log(err);
            })
        })
        .catch(err => {
            console.log(err);
        });
    
};

exports.postLogout = (req, res, next) => {
    
    req.session.destroy(() => {
        res.redirect('/');
    })
    
};

exports.getSignup = (req, res, next) => {

    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuth: false,
        errorMessage: req.flash('error')
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const pass = req.body.password;
    const name = req.body.name;
    const conPass = req.body.confirmPassword;

    if (pass !== conPass) {
        req.flash('error','The password and confirmation password are different');
        return res.redirect('/signup');
    }
    
    User.findOne({email: email})
    .then(userInf => {
        if (userInf) {
            req.flash('error','Email alredy used');
            return res.redirect('/signup');
        }
        return bcrypt.hash(pass, 12)
            .then(hashPass => {
                const newUser = new User({
                    email: email,
                    password: hashPass,
                    name: name,
                    cart: {items: []}
                });
                return newUser.save();
            })
            .then (result => {
                res.redirect('/login');
            });
    })
    .catch(err => console.log(err));
};