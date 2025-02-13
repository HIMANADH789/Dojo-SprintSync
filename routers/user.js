const express= require('express');
const mongoose= require('mongoose');
const passport= require('passport');
const localStrategy= require('passport-local');
const path= require('path');
const session= require('express-session');
const User= require('../schemas/user');
const user= require('../controllers/user');
const {isLoggedIn}= require('../utils/middlewares');
const flash= require('connect-flash');





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

app.use(flash());
app.use((req,res,next)=>{
  res.locals.success=req.flash('success');
  res.locals.error=req.flash('error');
  next();
})
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());





router.get('/register',user.registerForm);

router.post('/register',user.register);

router.get('/login',user.loginForm);

router.post('/login',passport.authenticate('local',{failureRedirect:'/login'}),user.login);

router.post('/logout',user.logout);

router.get('/notifications',isLoggedIn,user.getNotifications);

router.post('/acceptFriendRequest/:fid',isLoggedIn,user.acceptFriendRequest);

router.post('/acceptTeamTask/:tid',isLoggedIn,user.acceptTeamTask);

router.post('/searchFriend',isLoggedIn,user.searchFriend);

router.post('/requestFriend/:fid',isLoggedIn,user.requestFriend);

router.get('/showFriends',isLoggedIn,user.showFriends);

router.get('/committedTasks',isLoggedIn,user.showCommittedTasks);
router.get('/personalTasks',isLoggedIn,user.showPersonalTasks);
router.get('/groupTasks',isLoggedIn,user.showGroupTasks);

module.exports=router;

