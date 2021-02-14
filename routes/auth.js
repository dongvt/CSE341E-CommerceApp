const express = require('express');
const { check, body } = require('express-validator/check');

const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', [
    check('email')
        .isEmail()
        .withMessage('Invalid email address')
        .custom((val, { req }) => {
            
            return User.findOne({ email: val })
                .then(userInf => {
                    if (!userInf) {
                        return Promise.reject('Email or password does not exist');
                    }
                });
        }),
        body('password',
        'Insert a valid password')
        .isLength({ min: 8 })
]
    , authController.postLogin);

router.post('/logout', authController.postLogout);

router.post('/signup', [
    check('email')
        .isEmail()
        .withMessage('Invalid email')
        .normalizeEmail()
        .custom((val, { req }) => {
            if (val.includes("yopmail.com")) {
                throw new Error('Yopmail mails are invalid.');
            } else {
                return User.findOne({ email: val })
                    .then(userInf => {
                        if (userInf) {
                            return Promise.reject('Email already used');
                        }
                    });
            }
        })
        .normalizeEmail(),
    body('name')
        .isLength({min: 3}),
    body('password',
        'Insert a password with at least 8 characters')
        .isLength({ min: 8 })
        .trim(),
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password have to match');
            }
            return true;
        })
        
    
], authController.postSignup);

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;