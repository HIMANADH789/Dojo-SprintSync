const express= require('express');
const mongoose= require('mongoose');
const passport= require('passport');
const localStrategy= require('passport-local');
const path= require('path');
const session= require('express-session');
const User= require('../schemas/user');
const home= require('../controllers/home');
const {isLoggedIn}= require('../utils/middlewares');



main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/taskManager');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const app= express();
const router= express.Router({mergeParams: true});

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));

app.use(session({
    secret: 'your_secret_key', 
    resave: false,
    saveUninitialized: true,
  }));




app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

router.get('/',isLoggedIn,home.homePage);

module.exports=router;
