const express = require('express');
// use express router for the routes
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Once app gets to this router, replace the layout with this 
router.all('/*', (req, res, next)=> {
    req.app.locals.layout = 'home';
    next();
});

// the routes that renders the home page
router.get('/', (req, res)=> {
    const perPage = 10;
    const page = req.query.page || 1;
    Post.find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .then(posts =>{
            Post.count().then(postCount=>{
                Category.find({}).then(categories=>{
                    res.render('home/index', {
                        posts: posts, 
                        categories: categories,
                        current: parseInt(page),
                        pages: Math.ceil(postCount / perPage)
                    });
                });
            });
    }); 
});

// the routes that renders the about page
router.get('/about', (req, res)=> {
    res.render('home/about');
});

// the routes that renders the login page
router.get('/login', (req, res)=> {
    res.render('home/login');
});

//Passport middleware
passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{
    //console.log(password);
    User.findOne({email: email}).then(user=>{
        if (!user) return done(null, false, {message: 'The User was not Found'});
        // compare the password to the one in the db
        bcrypt.compare(password, user.password, (err, matched)=>{
            if(err) return err;

            if (matched) {
              return done(null, user);  
            } else {
                return done(null, false, { message: 'Incorrect password' });
            }
        });
    });
}));

// Passport serializing the input
passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


// the routes that login a user
router.post('/login', (req, res, next)=> {
    //Using passport to login a user
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

// Logout route
router.get('/logOut', (req, res)=>{
    req.logOut();
    res.redirect('/login');
});

// the routes that renders the register page
router.get('/register', (req, res)=> {
    res.render('home/register');
});

// the routes that register a user
router.post('/register', (req, res)=> {
    let errors = [];

    if (!req.body.firstName) {
        errors.push({message: 'Please Enter your First Name'});
    }
    if (!req.body.lastName) {
        errors.push({message: 'Please Enter your Last Name'});
    }
    if (!req.body.email) {
        errors.push({message: 'Please Enter your Email'});
    }
    if (req.body.password == '' && req.body.passwordConfirm == '') {
        errors.push({message: 'Your password and confirm password field should not be empty'});
    }
    if (req.body.password !== req.body.passwordConfirm) {
        errors.push({message: 'Password field do not match'});
    }

    if (errors.length > 0) {
        res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        });
    } else {

        User.findOne({email: req.body.email}).then(user=>{
            if (!user) {
                //Instanstiate a user
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        newUser.password = hash;

                        newUser.save().then(savedUser=>{
                            req.flash('success_message', 'Your Registration was successful, Please login');
                            res.redirect('/login');
                        });
                    });
                });
            } else {
                req.flash('error_message', 'This email is already registered, Please login');
                res.redirect('/login');
            }
        });
    }
});

// the routes that renders the single post page
router.get('/post/:slug', (req, res)=> {
    // how to populate multiple things inside one populate function
    Post.findOne({slug: req.params.slug})
        .populate({path: 'comments', match: {approveComment: true}, populate: {path: 'user', model: 'users'}})
        .populate('user')
        .then(post =>{
            Category.find({}).then(categories=>{
                res.render('home/post', {post: post, categories: categories});
            });
        });
});

module.exports = router;