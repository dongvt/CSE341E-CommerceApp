const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

//Import Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

//Import libraries/packages
const cors = require('cors');
const errorController = require('./controllers/error');
const mongoose = require('mongoose');
const User = require('./models/user');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const flash = require('connect-flash');


//Constant variables
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb+srv://gvt:Mariana1@cluster0.h4mw8.mongodb.net/shop?retryWrites=true&w=majority';
const PORT = process.env.PORT || 5000;
const csrfProtection = csurf();

const app = express();

const store = new MongoDbStore({
    uri: MONGODB_URL,
    collection: 'sessions'

});

const corsOptions = {
    origin: "https://desolate-mountain-16221.herokuapp.com/",
    optionsSuccessStatus: 200
};

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    family: 4
};


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOptions));
app.use(
    session({ secret: 'Long String in Production', resave: false, saveUninitialized: false, store: store })
);
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log(err);
        });
});

app.use((req, res, next) => {
    res.locals.isAuth = req.session.isAuth;
    res.locals.token = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
    .connect(MONGODB_URL, options)
    .then(result => {
        app.listen(PORT,() =>{
            console.log('Listening on port: ' + PORT)
        });
    })
    .catch(err => console.log(err));

