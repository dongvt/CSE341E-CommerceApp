const crypto = require('crypto');
const envVar = require('dotenv').config();

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');

const transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
}));

exports.getLogin = (req, res, next) => {

    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: req.flash('error'),
        email: '',
        allErrors: []
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const pass = req.body.password;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'LogIn',
            isAuth: false,
            errorMessage: errors.array()[0].msg,
            email: email,
            allErrors: errors.array()
        });
    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'LogIn',
                    isAuth: false,
                    errorMessage: errors.array()[0].msg,
                    email: email,
                    allErrors: errors.array()
                });
            }
            bcrypt.compare(pass, user.password)
                .then(matched => {
                    if (matched) {
                        req.session.isAuth = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            return res.redirect('/');
                        });
                    }
                    return res.render('auth/login', {
                        path: '/login',
                        pageTitle: 'LogIn',
                        isAuth: false,
                        errorMessage: '',
                        email: email,
                        allErrors: []
                    });
                })
                .catch(err => {
                    const errorThrown = new Error(err);
                    errorThrown.httpStatusCode = 500;
                    return next(errorThrown);
                })
        })
        .catch(err => {
            const errorThrown = new Error(err);
            errorThrown.httpStatusCode = 500;
            return next(errorThrown);
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
        errorMessage: req.flash('error'),
        oldData: {
            email: '',
            passw: '',
            confirmPassword: '',
            name: ''
        },
        allErrors: []
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const pass = req.body.password;
    const confPass = req.body.confirmPassword;
    const name = req.body.name;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            isAuth: false,
            errorMessage: errors.array()[0].msg,
            oldData: {
                email: email,
                passw: pass,
                confirmPassword: confPass,
                name: name
            },
            allErrors: errors.array()
        });
    }

    bcrypt.hash(pass, 12)
        .then(hashPass => {
            const newUser = new User({
                email: email,
                password: hashPass,
                name: name,
                cart: { items: [] }
            });
            return newUser.save();
        })
        .then(result => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'Ecommerce Site',
                subject: 'Singup Test',
                html: '<p> You have succesfuly signed up </p>'
            });

        })
        .catch(err => {
            const errorThrown = new Error(err);
            errorThrown.httpStatusCode = 500;
            return next(errorThrown);
        });
}

exports.getReset = (req, res, next) => {

    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset',
        isAuth: false,
        errorMessage: req.flash('error')
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');

        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account found with this email: ' + req.body.email);
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000; //one hour in miliseconds
                return user.save();
            })
            .then(result => {
                res.redirect('/login');
                transporter.sendMail({
                    to: req.body.email,
                    from: 'Ecommerce Site',
                    subject: 'Reset Password',
                    html: `
                    <p> You requested a password reset </p>
                    <p> Use this <a href="http://localhost:5000/reset/${token}" >link </a>to set a new password </p>
                    `
                });
            })
            .catch(err => {
                const errorThrown = new Error(err);
                errorThrown.httpStatusCode = 500;
                return next(errorThrown);
            });
    })

};

exports.getNewPassword = (req, res, next) => {

    const token = req.params.token;

    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                isAuth: false,
                errorMessage: req.flash('error'),
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(err => {
            const errorThrown = new Error(err);
            errorThrown.httpStatusCode = 500;
            return next(errorThrown);
        });
};

exports.postNewPassword = (req, res, next) => {
    const newPass = req.body.password;
    const userId = req.body.userId;
    const passToken = req.body.passwordToken;

    let resUser;
    User.findOne({ resetToken: passToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
        .then(user => {
            resUser = user;
            return bcrypt.hash(newPass, 12)
        })
        .then(hashPass => {
            resUser.password = hashPass;
            resUser.resetToken = null;
            resUser.resetTokenExpiration = null;
            return resUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => {
            const errorThrown = new Error(err);
            errorThrown.httpStatusCode = 500;
            return next(errorThrown);
        })


};