const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const upload = require('express-fileupload');

const session = require('express-session');
const flash = require('connect-flash');
const { mongoDbUrl } = require('./config/database');
const passport = require('passport');

// run npm i @handlebars/allow-prototype-access
const Handlebars = require('handlebars');//disable prototype checks for your models
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
// end


let port = 4500;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');


// uses mongoose default promise
mongoose.Promise = global.Promise;


// connect to a db & create the db cms
mongoose.connect(mongoDbUrl, { useNewUrlParser: true }).then(db=>{
    console.log('MongoDB is connected');
}).catch(error=> console.log("Could not connect" +error));


// Create a middle ware
app.use(express.static(path.join(__dirname, 'public')));

// Helper function
const { select, generateDate, paginate } = require('./helpers/handlebars-helpers');

//Use the template engine (handlebars) to read the file
// add {handlebars: allowInsecurePrototypeAccess(Handlebars)} to the engine
// pass the helper fuction to the engine
app.engine('handlebars', exphbs.engine({defaultLayout: 'home', 
                        helpers: {select: select, generateDate: generateDate, paginate: paginate}, 
                        handlebars: allowInsecurePrototypeAccess(Handlebars)}));

//set the view engin
app.set('view engine', 'handlebars');

// Upload Middleware to upload files
app.use(upload());

// session
app.use(session({
    secret: 'gordwhine',
    saveUninitialized: true,
    resave: false
}));



// flash middleware
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Local Variable using middleware
app.use((req, res, next)=>{
    //declearing a global var to asscess the user
    res.locals.user = req.user || null; 
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.form_errors = req.flash('form_errors');
    res.locals.error = req.flash('error');
    next();
});

// Body Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Method Override
app.use(methodOverride('_method'));

// Load Routes
const home = require('./routes/home/main');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');





// Use routes by chainning it to a middlesware
app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);


app.listen(port, ()=>{
    console.log(`Listening on port: ${port}`);
});