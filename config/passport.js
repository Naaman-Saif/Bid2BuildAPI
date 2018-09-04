const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');
const User = require('../user');

//Passport Strategy
passport.use(new Strategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
        if (err) {
            return done(err);
        }

        if (!user) {
            return done(null, false, { message: 'username incorrect' });
        }

        if (!user.comparePassword(password)) {
            return done(null, false, { message: 'Password incorrect' });
        }

        return done(null, user);
    })
}));

//Serialization
passport.serializeUser((user, done) => {
    done(null, user._id);
});

//Deserialization
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        if (err) return done(err);

        done(null, user);
    });
});

module.exports = passport;