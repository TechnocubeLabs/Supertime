var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;
/*    TwitterStrategy = require('passport-twitter').Strategy,
    GitHubStrategy = require('passport-github').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    LinkedInStrategy = require('passport-linkedin').Strategy;
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;*/
var BearerStrategy = require('passport-http-bearer').Strategy;

var crypto = require('crypto');

var opts = {}

var validator = require('validator');

var verifyHandler = function(token, tokenSecret, profile, done) {
    process.nextTick(function() {
        console.log("Token = ", token, " Token Secret = ", tokenSecret, " provider = ", profile.provider);
        Passport.findOne({ identifier: profile.id, provider: profile.provider })
            .populate('user')
            .exec(function(err, passport) {
                if (passport) { //passport exits.
                    if(passport.provider_token != token){ //check if token has changed since last login. if yes update else do nothing.
                        passport.provider_token = token;
                        passport.save();
                    }
                    return done(null, passport.user);
                } else { //user first time login. create a passport.
                    var access_token = crypto.randomBytes(48).toString('base64');
                    Passport.create({
                        identifier: profile.id,
                        provider: profile.provider,
                        provider_token: token,
                        provider_secret: tokenSecret,
                        access_token: access_token
                    }).exec(function(err, passport) {
                        return done(err, passport);
                    })
                }
            });
    });
};

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(uid, done) {
    User.findOne({ id: uid }, function(err, user) {
        done(err, user);
    });
});

/**
 * Configure advanced options for the Express server inside of Sails.
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#documentation
 */
var baseURL = require('./local').baseURL;

module.exports.http = {

    customMiddleware: function(app) {

        passport.use(new LocalStrategy(function(username, password, done) {
            var query = {};
            if (validator.isEmail(username)) {
                query.email = username;
            } else {
                query.username = username;
            }

            User.findOne(query, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                Passport.findOne({ provider: 'local', user: user.id }).exec(function(err, userpassport) {
                    if (err) {
                        return done(null, false, { message: 'no passport found for user' });
                    }
                    userpassport.validatePassword(password, function(err, result) {
                        if (err) {
                            return done(err);
                        }
                        if (!result) {
                            return done(null, false, { message: "login failed!" });
                        } else {
                            return done(null, user, { message: "login success!" });
                        }
                    });
                });
            });
        }));

        /*passport.use(new FacebookStrategy({
            clientID: "1292787994084037",
            clientSecret: "e60b681da0f881a53eb51718b27d119f",
            callbackURL: baseURL + "/auth/facebook/callback",
            enableProof: true
        }, verifyHandler));*/

        /*        passport.use(new TwitterStrategy({
                    consumerKey: 'NwkKvuT4cBGPdwLZb7rwRkXff',
                    consumerSecret: 'HAw6oT3VOaZ6WMqFyS8WOYfJxDG4MFxfLiTzhBHxcPsoL5eEyt',
                    callbackURL: baseURL + '/auth/twitter/callback'
                }, verifyHandler));

                passport.use(new GitHubStrategy({
                    clientID: "a8a8510c271876baa741",
                    clientSecret: "821c246d4a0f9c85c365f709676ea303948b691e",
                    callbackURL: baseURL + "/auth/github/callback"
                }, verifyHandler));

                passport.use(new GoogleStrategy({
                    clientID: '594154956549-c0on7rfvfnlfvvup658g4p4f6ad8lole.apps.googleusercontent.com',
                    clientSecret: 'Mq-Mb8wT_5ZRkaDU8pSByPMW',
                    callbackURL: "http://guru.com:3000" + "/auth/google/callback"
                }, verifyHandler));

                passport.use(new LinkedInStrategy({
                    consumerKey: "758h6edoc1coyj",
                    consumerSecret: "kLZvMNmEE3pFSh2E",
                    callbackURL: baseURL + "/auth/linkedin/callback"
                }, verifyHandler));

                opts.jwtFromRequest = ExtractJwt.fromUrlQueryParameter('token');
                opts.secretOrKey = 'lbthomte';
                passport.use(new JwtStrategy(opts, function(jwt_payload, done) {

                    console.log("jwt_payload", jwt_payload);
                    Passport.findOne({ id: jwt_payload.id }, function(err, user) {
                        if (err) {
                            return done(err, false);
                        }
                        console.log("found a jwt user:::", user);
                        if (user) {
                            done(null, user);
                        } else {
                            done(null, false);
                            // or you could create a new account
                        }
                    });
                }));
        */
        passport.use(new BearerStrategy(
            function(token, done) {
                Passport.findOne({ access_token: token }, function(err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        return done(null, false);
                    }
                    return done(null, user, { scope: 'all' });
                });
            }
        ));

        app.use(passport.initialize());
        app.use(passport.session());
    }

    // Completely override Express middleware loading.
    // If you only want to override the bodyParser, cookieParser
    // or methodOverride middleware, see the appropriate keys below.
    // If you only want to override one or more of the default middleware,
    // but keep the order the same, use the `middleware` key.
    // See the `http` hook in the Sails core for the default loading order.
    //
    // loadMiddleware: function( app, defaultMiddleware, sails ) { ... }


    // Override one or more of the default middleware (besides bodyParser, cookieParser)
    //
    // middleware: {
    //    session: false, // turn off session completely for HTTP requests
    //    404: function ( req, res, next ) { ... your custom 404 middleware ... }
    // }


    // The middleware function used for parsing the HTTP request body.
    // (this most commonly comes up in the context of file uploads)
    //
    // Defaults to a slightly modified version of `express.bodyParser`, i.e.:
    // If the Connect `bodyParser` doesn't understand the HTTP body request
    // data, Sails runs it again with an artificial header, forcing it to try
    // and parse the request body as JSON.  (this allows JSON to be used as your
    // request data without the need to specify a 'Content-type: application/json'
    // header)
    //
    // If you want to change any of that, you can override the bodyParser with
    // your own custom middleware:
    // bodyParser: function customBodyParser (options) { ... return function(req, res, next) {...}; }
    //
    // Or you can always revert back to the vanilla parser built-in to Connect/Express:
    // bodyParser: require('express').bodyParser,
    //
    // Or to disable the body parser completely:
    // bodyParser: false,
    // (useful for streaming file uploads-- to disk or S3 or wherever you like)
    //
    // WARNING
    // ======================================================================
    // Multipart bodyParser (i.e. express.multipart() ) will be removed
    // in Connect 3 / Express 4.
    // [Why?](https://github.com/senchalabs/connect/wiki/Connect-3.0)
    //
    // The multipart component of this parser will be replaced
    // in a subsequent version of Sails (after v0.10, probably v0.11) with:
    // [file-parser](https://github.com/balderdashy/file-parser)
    // (or something comparable)
    //
    // If you understand the risks of using the multipart bodyParser,
    // and would like to disable the warning log messages, uncomment:
    // silenceMultipartWarning: true,
    // ======================================================================


    // Cookie parser middleware to use
    //            (or false to disable)
    //
    // Defaults to `express.cookieParser`
    //
    // Example override:
    // cookieParser: (function customMethodOverride (req, res, next) {})(),


    // HTTP method override middleware
    //            (or false to disable)
    //
    // This option allows artificial query params to be passed to trick
    // Sails into thinking a different HTTP verb was used.
    // Useful when supporting an API for user-agents which don't allow
    // PUT or DELETE requests
    //
    // Defaults to `express.methodOverride`
    //
    // Example override:
    // methodOverride: (function customMethodOverride (req, res, next) {})()
};


/**
 * HTTP Flat-File Cache
 *
 * These settings are for Express' static middleware- the part that serves
 * flat-files like images, css, client-side templates, favicons, etc.
 *
 * In Sails, this affects the files in your app's `assets` directory.
 * By default, Sails uses your project's Gruntfile to compile/copy those
 * assets to `.tmp/public`, where they're accessible to Express.
 *
 * The HTTP static cache is only active in a 'production' environment,
 * since that's the only time Express will cache flat-files.
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#documentation
 */
module.exports.cache = {

    // The number of seconds to cache files being served from disk
    // (only works in production mode)
    maxAge: 31557600000
};
