const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passportConf = require('./config/passport');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const morgan = require('morgan');
var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime');
var path = require('path')


const app = express();

//Multer Config

var storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err)

            cb(null, raw.toString('hex') + '.jpeg');
        })
    }
})

var upload = multer({ storage: storage })
const User = require('./user');
const Bids = require('./Bids');
const secret = require('./config/secret');

// //Connect to Db
mongoose.connect(secret.db, { useMongoClient: true }, (err) => {
    err ? console.log(err) : console.log('Database connected');
});
//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Initialize Passport
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || secret.key,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({ url: secret.db })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'))

app.get('/', (req, res) => {
    res.end('Welcome to Bid2BuildAPI');
});
app.get('/api/test', (req, res) => {
    res.json({ message: "API ONLINE !!" });
})

app.get('/api/auth', (req, res) => {
    if (req.user) {
        res.send(req.user);
    } else {
        res.send({ message: 'unauthorized' });
    }
})
app.post('/api/signup', (req, res) => {
    let user = new User();

    user.username = req.body.username;
    user.password = req.body.password;
    user.email = req.body.email;
    user.role = req.body.role;

    User.findOne({ email: req.body.email, username: req.body.user }, (err, existingUser, next) => {
        if (err) return next(err);
        if (existingUser) {
            res.send({ error: 'user already exists' })
        } else {
            user.save(function (err, user) {
                if (err) console.error(err);
                res.send({ success: true });
            });
        }
    });
});

app.post('/api/login', passport.authenticate('local'), (req, res) => {
    User.findOne({ username: req.user.username }, (err, user) => {
        res.send({ username: req.user.username, role: user.role });
    });
})
app.post('/api/requestBid', upload.single('photo'), (req, res) => {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    let Bid = new Bids();
    Bid.username = req.body.username;
    Bid.name = req.body.name;
    Bid.image = req.file.path;
    Bid.currentBid = req.body.currentBid;
    Bid.closed = false;
    Bid.approved = false;
    Bid.save(function (err) {
        if (err) console.log(err);
        res.send("success"); console.log("Done");
    })
})

app.get('/api/myBids', (req, res) => {
    Bids.find({ username: req.user,approved:true }, (err, bids) => {
        if (bids) {
            res.send(bids);
        } else {
            res.send("No Bids");
        }
    });
})
app.get('/api/admin/requestedBids', (req, res) => {
    Bids.find({ approved: false }, (err, bids) => {
        if (err) {
            res.send(err);
        } else {
            res.send(bids)
        }
    });
})
app.post('/api/admin/changeBidStatus', (req, res) => {
    if (req.body.approved == true) {
        Bids.findOneAndUpdate(
            { "_id": req.body._id },
            {
                $set: { "approved": true }
            }, (err, done) => {
                if (err) throw err;
            })
    } else {
        try {
            Bids.deleteOne({ "_id": req.body._id },function(err,user) {

                if(err) throw err;
                res.send("{success}");
            });

        } catch (e) {
            console.log(e);
        }
    }
})
app.get('/api/logout', (req, res) => {
    req.logout();
    res.send({ success: true });
})
const port = process.env.PORT || '3000';
app.listen(port, () => console.log(`API running on localhost:${port}`));
// app.listen(process.env.PORT, err => err ? console.log(err) : console.log(`Connected to http://localhost:${process.env.PORT}`));