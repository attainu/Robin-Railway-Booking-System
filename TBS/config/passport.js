const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
import User from "../models/User"
import Admin from "../models/Admin"
import config from "../config/database"


// To authtenticate the User by JWT Startegy
module.exports = (userType, passport) => {
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        if (userType == 'admin') {
            Admin.getAdminById(jwt_payload.data._id, (err, user) => {
                if (err) return done(err, false);
                if (user) return done(null, user);
                return done(null, false);
            });
        }
        if (userType == 'users') {
            User.getUserById(jwt_payload.data._id, (err, user) => {
                if (err) return done(err, false);
                if (user) return done(null, user);
                return done(null, false);
            });
        }
    }));
}