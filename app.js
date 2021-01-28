const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');
const mongoose = require('mongoose');
const User = require('./models/user');

const cors = require('cors');


const PORT = process.env.PORT || 5000;

const app = express();

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

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb+srv://gvt:Mariana1@cluster0.h4mw8.mongodb.net/shop?retryWrites=true&w=majority';

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOptions));
app.use((req, res, next) => {
    User.findById('60128784bcd5bd45bc15176d')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log(err);
        });
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);




mongoose
    .connect(MONGODB_URL,options)
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Govert',
                    email: 'car16116@byui.edu',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });
        
        app.listen(PORT);
    })
    .catch(err => console.log(err));

